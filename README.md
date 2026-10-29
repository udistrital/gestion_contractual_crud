# gestion_contractual_crud

API CRUD de gestión contractual (ARGO) construida con Beego v2 sobre PostgreSQL. Provee los servicios para administrar contratos, supervisores, ordenadores, estados, convenios, contratos de arrendamiento, especificaciones técnicas, disponibilidades y registros presupuestales, pólizas, amparos, actas de inicio y documentos del contrato.

## Especificaciones Técnicas

### Tecnologías Implementadas y Versiones

* [Golang](https://github.com/udistrital/introduccion_oas/blob/master/instalacion_de_herramientas/golang.md) 1.25
* [BeeGo](https://github.com/udistrital/introduccion_oas/blob/master/instalacion_de_herramientas/beego.md) v2.3.10 (`github.com/beego/beego/v2`) y Bee CLI v2.3.0
* [PostgreSQL](https://www.postgresql.org/) 10 (driver `github.com/lib/pq`)
* [utils_oas](https://github.com/udistrital/utils_oas) v2 (`github.com/udistrital/utils_oas/v2`)
* [Docker](https://docs.docker.com/engine/install/ubuntu/)
* [Docker Compose](https://docs.docker.com/compose/)

### Variables de Entorno

```shell
GESTION_CONTRACTUAL_CRUD_HTTP_PORT=[puerto de ejecución, por defecto 8080]
GESTION_CONTRACTUAL_CRUD_RUN_MODE=[modo de ejecución: dev | prod]
PARAMETER_STORE=[prefijo del Parameter Store de AWS; vacío en local]
GESTION_CONTRACTUAL_CRUD_PGUSER=[usuario con acceso a la base de datos]
GESTION_CONTRACTUAL_CRUD_PGPASS=[password del usuario]
GESTION_CONTRACTUAL_CRUD_PGHOST=[dirección de la base de datos]
GESTION_CONTRACTUAL_CRUD_PGPORT=[puerto de la base de datos]
GESTION_CONTRACTUAL_CRUD_PGDB=[nombre de la base de datos]
GESTION_CONTRACTUAL_CRUD_PGSCHEMA=[esquema donde se ubican las tablas: contratacion]
```

Variables adicionales usadas solo por `docker-compose.yml`:

```shell
GESTION_CONTRACTUAL_CRUD_SERVICE_NAME=[nombre del contenedor del API]
GESTION_CONTRACTUAL_CRUD_API_BASE_DIR=[carpeta base dentro de /go/src, ej: github.com/udistrital]
GESTION_CONTRACTUAL_CRUD_API_NAME=[nombre de la carpeta del proyecto, ej: gestion_contractual_crud]
```

**NOTA:** Las variables se pueden ver en el fichero [conf/app.conf](conf/app.conf) y están identificadas con `GESTION_CONTRACTUAL_CRUD_...`. Cuando `PARAMETER_STORE` tiene valor (AWS), el usuario y la contraseña de la base de datos se leen de `/<PARAMETER_STORE>/gestion_contractual_crud/db/username` y `/<PARAMETER_STORE>/gestion_contractual_crud/db/password`.

### Ejecución del Proyecto

```shell
#1. Clonar el repositorio
git clone https://github.com/udistrital/gestion_contractual_crud

#2. Moverse a la carpeta del repositorio
cd gestion_contractual_crud

#3. Descargar las dependencias del proyecto
go mod tidy

#4. Instalar Bee CLI (si no está instalado)
go install github.com/beego/bee/v2@v2.3.0

#5. Crear el esquema y las tablas en la base de datos
psql -h [host] -p [puerto] -U [usuario] -d [base de datos] -f database/gestion_contractual.sql

#6. Alimentar todas las variables de entorno que utiliza el proyecto y ejecutar
GESTION_CONTRACTUAL_CRUD_HTTP_PORT=[puerto] GESTION_CONTRACTUAL_CRUD_RUN_MODE=[dev|prod] GESTION_CONTRACTUAL_CRUD_PGHOST=[host] GESTION_CONTRACTUAL_CRUD_PGPORT=[puerto] GESTION_CONTRACTUAL_CRUD_PGUSER=[usuario] GESTION_CONTRACTUAL_CRUD_PGPASS=[password] GESTION_CONTRACTUAL_CRUD_PGDB=[base de datos] GESTION_CONTRACTUAL_CRUD_PGSCHEMA=[esquema] bee run -downdoc=true -gendoc=true

```

En modo `dev` la documentación Swagger queda disponible en `http://localhost:[puerto]/swagger/`.

### Ejecución Dockerfile

```shell
# Compilar el binario (el Dockerfile copia el ejecutable "main" y conf/app.conf)
GOOS=linux GOARCH=amd64 go build -o main

# Construir la imagen
docker build --tag=gestion_contractual_crud . --no-cache

# Ejecutar el contenedor
docker run -p 8080:8080 --env-file .env gestion_contractual_crud
```

### Ejecución docker-compose

```shell
#1. Clonar el repositorio
git clone https://github.com/udistrital/gestion_contractual_crud

#2. Moverse a la carpeta del repositorio
cd gestion_contractual_crud

#3. Crear un fichero con el nombre **.env** a partir del ejemplo
# y agregar GESTION_CONTRACTUAL_CRUD_SERVICE_NAME, GESTION_CONTRACTUAL_CRUD_API_BASE_DIR y GESTION_CONTRACTUAL_CRUD_API_NAME
# En windows ejecutar: copy .env.example .env
cp .env.example .env

#4. Crear la network **back_end** para los contenedores
docker network create back_end

#5. Ejecutar el compose del contenedor
docker compose up --build

#6. Comprobar que los contenedores estén en ejecución
docker ps
```

El compose levanta dos contenedores: el API (`golang:1.25` ejecutando `bee run`) y PostgreSQL 10, que al iniciar por primera vez crea el esquema y las tablas con `database/gestion_contractual.sql`.

### Ejecución Pruebas

Pruebas unitarias (no requieren base de datos):

```shell
go test ./... -v
```

Pruebas de integración (requieren PostgreSQL con `database/gestion_contractual.sql` aplicado):

```shell
 go test ./... -v
```

Cobertura:

```shell
go test ./... -coverpkg=./... -coverprofile=coverage.out
go tool cover -func=coverage.out

# Reporte en el navegador
go tool cover -html=coverage.out
```

## Licencia

This file is part of gestion_contractual_crud.

gestion_contractual_crud is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

gestion_contractual_crud is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with gestion_contractual_crud. If not, see https://www.gnu.org/licenses/.