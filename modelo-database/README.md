# Acta inicio

| **ARGO**                       | **ARGO V2**                                | **NOTAS**                                          |
|--------------------------------|--------------------------------------------|----------------------------------------------------|
| numero_contrato                | contrato_general_id                        | Se reemplaza por contrato_general_id               |
| vigencia                       | contrato_general_id                        | Se reemplaza por contrato_general_id               |
| usuario                        | usuario_legado                             | Almacena el dato del usuario para la migración     |
| ordenador_gasto                | ordenaodor_id                              | No parecen ser los datos de ID, revisar DB actual. |
| fecha_registro                 | fecha_creacion                             | Cambio a timestamp                                 |


## Contrato General

| **ARGO**                       | **ARGO V2**                                | **NOTAS**                                          |
|--------------------------------|--------------------------------------------|----------------------------------------------------|
| objeto_contrato                | objeto                                     |                                                    |
| plazo_ejecucion                | plazo_ejecucion                            |                                                    |
| forma_pago                     | medio_pago_id                              |                                                    |
| ordenador_gasto                | **tabla ordenador_contrato**               | Se crea una tabla nueva para ordenador             |
| clausula_registro_presupuestal | clausula_registro_presupuestal             |                                                    |
| sede_solicitante               | **solicitante**.sede_solicitante_id        | Se extrae a tabla solicitante.                     |
| dependencia_solicitante        | **solicitante**.dependencia_solicitante_id | Se extrae a tabla solicitante.                     |
| contratista                    | **contratista**.numero_documento           | Cambio de numeric(16) a varchar                    |
| unidad_ejecucion               | unidad_ejecucion_id                        |                                                    |
| valor_contrato                 | valor_pesos                                |                                                    |
| justificacion                  | justificacion                              |                                                    |
| descripcion_forma_pago         | modo_pago                                  |                                                    |
| condiciones                    | condiciones                                | Se mantiene en plural por contexto de los datos    |
| unidad_ejecutora               | unidad_ejecutora_id                        |                                                    |
| fecha_registro                 | fecha_creacion                             | Cambio a date a timestamp                          |
| tipologia_contrato             | tipologia_especifica_id                    |                                                    |
| tipo_compromiso                | tipo_compromiso_id                         |                                                    |
| modalidad_seleccion            | modalidad_seleccion_id                     |                                                    |
| procedimiento                  | procedimiento_id                           |                                                    |
| regimen_contratacion           | regimen_contratacion_id                    |                                                    |
| tipo_gasto                     | tipo_gasto_id                              |                                                    |
| tema_gasto_inversion           | tema_gasto_inversion_id                    |                                                    |
| origen_presupuesto             | origen_presupuesto_id                      |                                                    |
| origen_recursos                | origen_recursos_id                         |                                                    |
| tipo_moneda                    | tipo_moneda_id                             |                                                    |
| valor_contrato_me              | valor_contrato_me                          |                                                    |
| valor_tasa_cambio              | valor_tasa_cambio                          |                                                    |
| tipo_control                   | tipo_control_id                            |                                                    |
| observaciones                  | observaciones                              |                                                    |
| supervisor                     | **supervisor_contrato**.supervisor_id      |                                                    |
| clase_contratista              | **contratista**.clase_contratista_id       |                                                    |
| convenio                       |                                            | No se usa, depreciado.                             |
| numero_constancia              |                                            | No se usa, depreciado.                             |
| estado                         | activo                                     |                                                    |
| tipo_contrato                  | tipo_contrato_id                           |                                                    |
| lugar_ejecucion                | **tabla lugar ejecución**                  |                                                    |
| especificaciones_tecnicas      | **tabla especificacion_tecnica**           | Se crea una tabla nueva para ordenador             |
| clausulas_contractuales        |                                            | No se usa.                                         |
| actividades                    | actividades                                | Se mantiene en plural por contexto de los datos    |
| usuario                        | usuario_legado                             |                                                    |


## Contrato Arrendamiento

| **ARGO**             | **ARGO V2**          | **NOTAS**                          |
|----------------------|----------------------|------------------------------------|
| destinacion          | destinacion          |                                    |
| plazo_pago_mensual   | plazo_pago_mensual   |                                    |
| reajuste             | reajuste             |                                    |
| plazo_administracion | plazo_administracion |                                    |
| valor_administracion | valor_administracion |                                    |
| plazo_entrega        | plazo_entrega        |                                    |
| valor_arrendamiento  | valor_arrendamiento  |                                    |


# CDP - disponibilidad presupuestal (contrato disponibilidad)

| **ARGO**       | **ARGO V2**    | **NOTAS**            |
|----------------|----------------|----------------------|
| numero_cdp     | numero_cdp_id  | Se mantiene sigla cdp|
| estado         | activo         |                      |
| fecha_registro | fecha_registro |                      |
| vigencia_cdp   | vigencia_cdp   | Se mantiene sigla cdp|


# Registro presupuestal

| **ARGO**              | **ARGO V2**           | **NOTAS**            |
|-----------------------|-----------------------|----------------------|
| estado                | activo                |                      |
| fecha_registro        | fecha_registro        |                      |
| registro_presupuestal | registro_presupuestal |                      |
| vigencia_rp           | vigencia_rp           |                      |


# Especificación Técnica

| **ARGO**            | **ARGO V2** | **NOTAS**                    |
|---------------------|-------------|------------------------------|
| puc                 |             | No se usa                    |
| catalogo            |             | No se usa                    |
| solicitud_necesidad |             | No se usa                    |
| descripcion         | descripcion |                              |
| cantidad            | cantidad    |                              |
| unidad              |             | No se usa                    |
| valor               | valor_total |                              |
| iva                 |             | No se usa                    |


# Lugar Ejecucion

| **ARGO**    | **ARGO V2**    | **NOTAS**            |
|-------------|----------------|----------------------|
| direccion   | direccion      |                      |
| sede        | sede_id        |                      |
| dependencia | dependencia_id |                      |
| ciudad      | ciudad_id      |                      |





# Póliza

Migración del módulo de pólizas desde `poliza_crud` (issue #351).

| **poliza_crud**        | **ARGO V2 (gestion_contractual_crud)** | **NOTAS**                                                          |
|------------------------|----------------------------------------|--------------------------------------------------------------------|
| numero_poliza          | numero_poliza                          | Se define longitud explícita varchar(50). Sin restricción de unicidad |
| entidad_aseguradora_id | entidad_aseguradora_id                 | Referencia a Parámetros CRUD                                        |
| contrato_general_id    | contrato_general_id                    | Pasa a ser FK real contra `contrato_general`                        |
| descripcion            | descripcion                            | varchar(255)                                                        |
| fecha_inicio           | fecha_inicio                           |                                                                     |
| fecha_fin              | fecha_fin                              |                                                                     |
| fecha_expedicion       | fecha_expedicion                       |                                                                     |
| fecha_aprobacion       | fecha_aprobacion                       |                                                                     |
| usuario_id             | usuario_id                             |                                                                     |
| usuario_legacy         | usuario_legado                         | Se unifica el nombre con el resto del modelo                        |
| activo                 | activo                                 |                                                                     |
| fecha_creacion         | fecha_creacion                         | timestamp                                                           |
| fecha_modificacion     | fecha_modificacion                     | timestamp                                                           |

# Amparo Póliza

| **poliza_crud**      | **ARGO V2 (gestion_contractual_crud)** | **NOTAS**                                                                                       |
|----------------------|----------------------------------------|-------------------------------------------------------------------------------------------------|
| contrato_general_id  | contrato_general_id                    | Se conserva y pasa a FK NOT NULL: el amparo se registra con la minuta, antes de existir la póliza |
| poliza_id            | poliza_id                              | FK nullable. Se asigna cuando la póliza es expedida y se asocia al amparo                         |
| amparo_id            | amparo_id                              | Referencia a Parámetros CRUD                                                                      |
| tipo_valor_amparo_id | tipo_valor_amparo_id                   | Referencia a Parámetros CRUD. Determina cómo se interpreta `suficiencia`                          |
| suficiencia          | suficiencia                            | numeric(20,7). Almacena porcentaje o SMLV según `tipo_valor_amparo_id`                            |
| valor                | valor                                  | numeric(20,7) según lineamiento de montos                                                         |
| descripcion          | descripcion                            | varchar(255)                                                                                      |
| fecha_inicio         | fecha_inicio                           |                                                                                                   |
| fecha_final          | fecha_fin                              | Se unifica el nombre con `poliza` y `acta_inicio`                                                  |
| activo               | activo                                 |                                                                                                   |
| fecha_creacion       | fecha_creacion                         | timestamp                                                                                         |
| fecha_modificacion   | fecha_modificacion                     | timestamp                                                                                         |
