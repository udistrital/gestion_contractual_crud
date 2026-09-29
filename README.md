# Gestion Contractual CRUD

API CRUD de gestión contractual core para el ARGO V2.

## Especificaciones Técnicas

### Tecnologías Implementadas y Versiones
-  [Node.js](https://nodejs.org/) v20
-  [NestJS](https://nestjs.com/) 10
-  [PostgreSQL](https://www.postgresql.org/)

### Variables de Entorno
```
- GESTION_CONTRACTUAL_CRUD_HOST // Host de la base de datos
- GESTION_CONTRACTUAL_CRUD_PORT // Puerto de la base de datos
- GESTION_CONTRACTUAL_CRUD_USERNAME // Usuario de la base de datos
- GESTION_CONTRACTUAL_CRUD_PASS // Contraseña de la base de datos
- GESTION_CONTRACTUAL_CRUD_DB // Nombre de la base de datos
- GESTION_CONTRACTUAL_CRUD_DB_SCHEMA // Esquema de la base de datos (PUBLIC por defecto)
```
### Ejecución del Proyecto
```
pnpm install
pnpm run start:dev
```

#### Ejecución Docker

> **Nota:** la imagen definida en el `Dockerfile` es una **imagen de despliegue**, no de desarrollo local. No compila el proyecto dentro del contenedor: copia los directorios `dist` y `node_modules` ya construidos desde el contexto de build. Por lo tanto es necesario construir el proyecto antes de construir la imagen.

Construcción de la imagen:
```
pnpm install
pnpm run build
docker build -t gestion_contractual_crud .
```

Ejecución del contenedor:
```
docker run --rm \
  -e PARAMETER_STORE=<nombre_del_parameter_store> \
  -e AWS_ACCESS_KEY_ID=<access_key> \
  -e AWS_SECRET_ACCESS_KEY=<secret_key> \
  -e AWS_DEFAULT_REGION=<region> \
  -e GESTION_CONTRACTUAL_CRUD_HOST=<host> \
  -e GESTION_CONTRACTUAL_CRUD_PORT=<puerto> \
  -e GESTION_CONTRACTUAL_CRUD_DB=<nombre_bd> \
  -e GESTION_CONTRACTUAL_CRUD_DB_SCHEMA=<esquema> \
  -p 3000:3000 \
  gestion_contractual_crud
```

> **Importante:** el `entrypoint.sh` obtiene `GESTION_CONTRACTUAL_CRUD_USERNAME` y `GESTION_CONTRACTUAL_CRUD_PASS` desde **AWS SSM Parameter Store**, usando la variable `PARAMETER_STORE` para construir la ruta del parámetro. El contenedor **no arranca con un `docker run` genérico sin credenciales de AWS válidas** con permisos de lectura sobre esos parámetros. Las demás variables de entorno sí se pasan directamente al contenedor.

#### Ejecución docker-compose

> **No aplica.** Este tipo de microservicio no usa `docker-compose`.
>
> El repositorio cuenta únicamente con `Dockerfile` y `entrypoint.sh`. Ningún otro microservicio NestJS de Argo dispone de `docker-compose.yml`; el patrón de red compartida `back_end` utilizado en la organización es exclusivo de los repositorios Go/Beego y no se replica en este componente.

### Ejecución Pruebas

Hay tres niveles de prueba. Los dos primeros no necesitan base de datos, salvo el e2e de `test/app.e2e-spec.ts` (ver más abajo).

| Nivel | Comando | Ubicación | ¿Requiere BD? |
| -- | -- | -- | -- |
| Unitarias | `pnpm test` | `src/**/*.spec.ts` | No: los repositorios TypeORM se reemplazan por mocks |
| e2e | `pnpm run test:e2e` | `test/*.e2e-spec.ts` | Solo `app.e2e-spec.ts` |
| Funcionales | `./test/funcionales-poliza.sh` | `test/funcionales-poliza.sh` | Sí, con la app corriendo |

Otros comandos disponibles:
```
pnpm run test:watch // Ejecución en modo watch
pnpm run test:cov // Reporte de cobertura
```

#### Pruebas unitarias

`pnpm test` ejecuta los `*.spec.ts` de `src/`. Cubren los services, los controllers de póliza y amparo, y las validaciones de los DTO de póliza y amparo (`class-validator`). Los repositorios se sustituyen por mocks de Jest, así que no se conectan a Postgres.

#### Pruebas e2e

`pnpm run test:e2e` usa `test/jest-e2e.json` y ejecuta los `*.e2e-spec.ts` de `test/`:

- `poliza.e2e-spec.ts` y `amparo-poliza.e2e-spec.ts`: levantan los módulos reales de Nest y prueban el flujo HTTP completo (controller, service y `ValidationPipe` global, replicado de `src/main.ts`). Los repositorios TypeORM se sustituyen por `FakeRepository` (`test/utils/fake-repository.helper.ts`), un repositorio en memoria que solo emula lo que usa `BaseCrudService`. **No necesitan base de datos.**
- `app.e2e-spec.ts`: importa `AppModule` completo y verifica el health check (`GET /`). Como carga la configuración de TypeORM, **necesita las variables de entorno y una base Postgres accesible** (ver `.env`).

Como el fake no ejecuta SQL real, estos e2e no validan llaves foráneas, tipos de columna ni restricciones de la base. Eso se prueba con las pruebas funcionales.

#### Cómo probar contra la base de datos

1. Levantar Postgres y crear la base con el esquema de `sql/creacion-tablas.sql`.
2. Definir en `.env` las variables `GESTION_CONTRACTUAL_CRUD_*` (host, puerto, usuario, contraseña, base y esquema) y `PORT`. Con `DEVELOPER_MODE=true` la conexión no usa SSL.
3. Sembrar los datos necesarios (ver el SQL de la sección siguiente) y arrancar la API con `pnpm run start:dev`.
4. Probar de una de estas formas:
   - **Swagger:** abrir `http://localhost:<PORT>/swagger` y ejecutar los endpoints a mano. `POST /amparos-polizas` recibe un **arreglo** de objetos, no un objeto.
   - **Script funcional:** `./test/funcionales-poliza.sh http://localhost:<PORT>`.
   - **Consulta directa:** verificar en la base con `SELECT * FROM poliza;` y `SELECT * FROM amparo_poliza;`. Los `DELETE` de la API son borrados lógicos (`activo = false`), por lo que la fila sigue existiendo.

#### Pruebas funcionales de póliza y amparo

`test/funcionales-poliza.sh` ejerce los endpoints de `/polizas` y `/amparos-polizas` contra una instancia en ejecución y verifica el estado HTTP de cada caso. Sale con código distinto de cero si alguno no coincide.

```
./test/funcionales-poliza.sh [url_base]   // por defecto http://localhost:8099
```

Antes de ejecutarlo, la base debe tener el esquema de `sql/creacion-tablas.sql` y los contratos generales con id 1 y 2. `sql/datos-mock.sql` **no sirve para esto**: está desincronizado del esquema y su carga falla en `contrato_general`, lo que a su vez tumba todas las inserciones con llave foránea. Mientras se corrige, los contratos se siembran directamente:

```sql
INSERT INTO contrato_general (id, tipo_contrato_id, aplica_poliza, objeto, vigencia, numero_contrato, valor_pesos, fecha_inicial, fecha_final, activo, fecha_creacion, fecha_modificacion)
VALUES
 (1, 1, true, 'Contrato de prueba 1', '2026', 'CTO-2026-001', 85000000.00, '2026-01-15', '2026-12-15', true, NOW(), NOW()),
 (2, 1, true, 'Contrato de prueba 2', '2026', 'CTO-2026-002', 120000000.00, '2026-02-01', '2026-11-30', true, NOW(), NOW());
SELECT setval(pg_get_serial_sequence('contrato_general','id'), 2, true);
```

El script parte de `poliza` y `amparo_poliza` vacías, así que conviene ejecutar antes:

```sql
TRUNCATE TABLE amparo_poliza, poliza RESTART IDENTITY CASCADE;
```

## Acta de inicio

Módulo `src/acta-inicio/`, ruta base `/actas-inicio`. Persiste en `acta_inicio` las actas de inicio de un contrato general y lo consume el formulario "Registrar Acta de Inicio" de `gestion_contractual_mf`.

- Endpoints: `GET /`, `GET /:id`, `POST /`, `PUT /:id` y `DELETE /:id` (borrado lógico).
- Respuestas con el envoltorio `{ Success, Status, Message, Data }`; el listado acepta `query`, `fields`, `sortBy`, `orderBy`, `limit`, `offset` e `include`, y devuelve `Metadata`.
- `usuario_legado` es opcional: las actas nuevas no tienen usuario de ARGO v1.

## Estado CI

| Develop | Release 0.0.1 | Master |
| -- | -- | -- |
| [![Build Status](https://hubci.portaloas.udistrital.edu.co/api/badges/udistrital/gestion_contractual_crud/status.svg?ref=refs/heads/develop)](https://hubci.portaloas.udistrital.edu.co/udistrital/gestion_contractual_crud) | [![Build Status](https://hubci.portaloas.udistrital.edu.co/api/badges/udistrital/gestion_contractual_crud/status.svg?ref=refs/heads/release/0.0.1)](https://hubci.portaloas.udistrital.edu.co/udistrital/gestion_contractual_crud) | [![Build Status](https://hubci.portaloas.udistrital.edu.co/api/badges/udistrital/gestion_contractual_crud/status.svg)](https://hubci.portaloas.udistrital.edu.co/udistrital/gestion_contractual_crud) |


# Modelo de Datos :card_file_box:

- [Ver modelo de datos del core de Argo](/modelo-database/modelo-basedatos-core-Argo.jpg)

[![Descargar Modelo de Datos](https://img.shields.io/badge/Descargar%20Modelo%20de%20Datos-Download-blue?style=for-the-badge)](/modelo-database/modelo-datos-core-argo.drawio)


## Licencia

This file is part of gestion_contractual_crud.

gestion_contractual_crud is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

gestion_contractual_crud is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with gestion_contractual_crud. If not, see https://www.gnu.org/licenses/.
