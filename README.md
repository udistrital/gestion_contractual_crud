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
```
pnpm test
```

Otros comandos disponibles:
```
pnpm run test:watch // Ejecución en modo watch
pnpm run test:cov // Reporte de cobertura
pnpm run test:e2e // Pruebas end to end
```

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
