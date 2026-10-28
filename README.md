# gestion_contractual_crud

API CRUD de gestión contractual de ARGO sobre PostgreSQL, construida con Beego v2. Implementa las tablas del modelo conceptual ARGO.

## Stack

| Componente | Versión |
|---|---|
| Go | 1.25 |
| Beego | `github.com/beego/beego/v2` 2.3.10 |
| Driver PostgreSQL | `github.com/lib/pq` |
| Utilidades OAS | `github.com/udistrital/utils_oas/v2` |

## Estructura

```text
conf/app.conf        configuración (variables GESTION_CONTRACTUAL_CRUD_*)
controllers/         un controlador por tabla (generados con bee); base.go: formato de respuesta y errores
models/              un modelo por tabla (generados con bee); reglas.go: validaciones y reglas del modelo
routers/             namespace /v1 y commentsRouter generado por bee
database/            gestion_contractual.dbml (modelo, fuente de verdad) y gestion_contractual.sql (lo implementa)
swagger/             swagger.json y swagger.yml generados por bee
tests/               pruebas
```

## Modelo de datos

Tablas: `contrato_general`, `supervisor_contrato`, `ordenador_contrato`, `estado_contrato`, `convenio`, `contrato_arrendamiento`, `especificacion_tecnica`, `disponibilidad_presupuestal`, `registro_presupuestal`, `acta_inicio`, `poliza`, `estado_poliza`, `amparo_poliza` y `documento_contrato`.

- Contratista, lugar de ejecución y solicitante ya no son tablas: el proveedor y el solicitante quedan en `contrato_general`.
- Los campos conservan los tipos que generó bee (`int`, `string`, `float64`, `bool`, `time.Time`): un valor que no se envía se guarda como `0`, `""` o `false`, y las fechas vacías como NULL. La única excepción es `NumeroContrato` (`*string`), que es nulo hasta la suscripción.
- `numero_contrato` es nulo hasta la suscripción y `(numero_contrato, vigencia_id)` es único.
- `contrato_arrendamiento.contrato_general_id` es único (0..1 por contrato).
- `amparo_poliza.poliza_id` es nulo hasta que la póliza se expide.
- `estado_poliza` es un historial: el estado vigente es el registro más reciente.
- `estado_contrato`: al registrar un estado queda como `Actual` y el anterior deja de serlo.
- `documento_contrato` pertenece a un contrato, una póliza o un acta de inicio (`EntidadTipo` + `EntidadId`, sin llave foránea; el API valida que el registro exista).

Para crear el esquema `contratacion` y las tablas: `database/gestion_contractual.sql`. El modelo (fuente de verdad, issue argo_documentacion#384) está en `database/gestion_contractual.dbml` y se puede abrir en dbdiagram.io; el SQL lo implementa tal cual.

## Endpoints

Cada tabla tiene `/v1/<tabla>` con `GET /`, `GET /:id`, `POST /`, `PUT /:id` y `DELETE /:id`; por ejemplo `/v1/contrato_general`, `/v1/poliza`, `/v1/estado_poliza`.

- `GET /` acepta los parámetros de bee: `query=Campo:valor,Relacion.Campo:valor`, `fields`, `sortby`, `order` (`asc`/`desc`), `limit` (por defecto 10) y `offset`. Ejemplos:
  - amparos de una póliza: `/v1/amparo_poliza?query=PolizaId.Id:1`
  - estado actual de un contrato: `/v1/estado_contrato?query=ContratoGeneralId.Id:1,Actual:true`
  - estado vigente de una póliza: `/v1/estado_poliza?query=PolizaId.Id:1&sortby=FechaCreacion&order=desc&limit=1`
- Las relaciones se envían con su Id: `{"ContratoGeneralId": {"Id": 1}}`.
- `PUT` solo cambia los campos enviados. Si el cuerpo trae un `Id` distinto al de la ruta responde 400.
- `DELETE` es lógico: deja `Activo = false`.
- Respuesta: `{ "Success", "Status", "Message", "Data" }`. Los errores siguen el lineamiento de la OAS (refactor_controller): se registran con `logs.Error`, se llama a `c.Abort` y los responde `customerror` de utils_oas con el mismo formato y `Success: false`. Códigos: 400 (cuerpo, parámetros —incluido un campo inexistente en `query`, `fields` o `sortby`—, validación, duplicado o relación inexistente), 404 (no existe), 500.

## Ejecución local

```bash
cp .env.example .env   # ajustar valores
set -a; source .env; set +a
bee run -downdoc=true -gendoc=true
```

Swagger (modo `dev`): `http://localhost:8080/swagger/`.

Con Docker (API y PostgreSQL con `database/gestion_contractual.sql`):

```bash
cp .env.example .env
docker network create back_end   # si no existe
docker compose up
```

Variables: `GESTION_CONTRACTUAL_CRUD_HTTP_PORT`, `GESTION_CONTRACTUAL_CRUD_RUN_MODE`, `PARAMETER_STORE` (en AWS las credenciales se leen de `/<PARAMETER_STORE>/gestion_contractual_crud/db/username|password`), `GESTION_CONTRACTUAL_CRUD_PGUSER`, `GESTION_CONTRACTUAL_CRUD_PGPASS`, `GESTION_CONTRACTUAL_CRUD_PGHOST`, `GESTION_CONTRACTUAL_CRUD_PGPORT`, `GESTION_CONTRACTUAL_CRUD_PGDB`, `GESTION_CONTRACTUAL_CRUD_PGSCHEMA`.

## Pruebas

```bash
go test ./...
```

`tests/integracion_test.go` recorre el flujo completo y `tests/crud_test.go` prueba los 5 endpoints de las 14 tablas (éxito y errores) contra PostgreSQL. Solo corren con `GESTION_CONTRACTUAL_CRUD_RUN_INTEGRATION=true` y las variables `GESTION_CONTRACTUAL_CRUD_PG*` apuntando a una base con `database/gestion_contractual.sql`.

Cobertura:

```bash
go test ./... -coverpkg=./... -coverprofile=coverage.out
go tool cover -func=coverage.out
```

Sin base de datos la cobertura es de 9.6% (solo validaciones); con la integración, 95.3%.

## CI/CD

Siguen el lineamiento de gestion_personas_crud:

- `.drone.yml`: SonarQube (`sonar-project.properties`), `go vet`, pruebas, `go fmt`, `golangci-lint`, compilación, imagen en ECR (`${DRONE_REPO_NAME}`) y despliegue en ECS.
- `Dockerfile`: imagen distroless (`gcr.io/distroless/base-debian12`) con el binario y `conf/app.conf`.
