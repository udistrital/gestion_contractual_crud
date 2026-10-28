-- Modelo de datos ARGO v2 (issue udistrital/argo_documentacion#384) para gestion_contractual_crud.
-- Implementa database/gestion_contractual.dbml, que es la fuente de verdad del modelo.
-- Las tablas se crean en el esquema contratacion (GESTION_CONTRACTUAL_CRUD_PGSCHEMA).
-- Las referencias a Parámetros CRUD, Terceros, OIKOS, SiCapital, Ágora y al Gestor Documental
-- son integer sin FK física.

CREATE SCHEMA IF NOT EXISTS contratacion;
SET search_path TO contratacion;

CREATE TABLE contrato_general (
    id SERIAL PRIMARY KEY,
    numero_contrato VARCHAR(50),
    vigencia_id INTEGER,
    consecutivo_elaboracion VARCHAR(50),
    unidad_ejecutora_id INTEGER NOT NULL,
    tipo_compromiso_id INTEGER,
    tipo_contrato_id INTEGER,
    perfil_contratista_id INTEGER,
    fecha_suscripcion_estudio DATE,
    aplica_poliza BOOLEAN,
    modalidad_seleccion_id INTEGER,
    tipo_control_id INTEGER,
    tipologia_especifica_id INTEGER,
    regimen_contratacion_id INTEGER,
    procedimiento_id INTEGER,
    plazo_ejecucion INTEGER,
    unidad_ejecucion_id INTEGER,
    tipo_moneda_id INTEGER,
    valor_pesos NUMERIC(20,7),
    valor_contrato_me NUMERIC(20,7),
    valor_tasa_cambio NUMERIC(20,7),
    tipo_gasto_id INTEGER,
    origen_recursos_id INTEGER,
    origen_presupuesto_id INTEGER,
    tema_gasto_inversion_id INTEGER,
    medio_pago_id INTEGER,
    clausula_registro_presupuestal BOOLEAN,
    modo_pago VARCHAR(1000),
    objeto VARCHAR(2000),
    justificacion VARCHAR(4000),
    actividades VARCHAR(8000),
    condiciones VARCHAR(4000),
    observaciones VARCHAR(1000),
    fecha_inicial DATE,
    fecha_final DATE,
    fecha_suscripcion DATE,
    proveedor_numero_documento VARCHAR(20),
    tipo_persona_id INTEGER,
    clase_proveedor_id INTEGER,
    dependencia_solicitante_id INTEGER,
    sede_solicitante_id INTEGER,
    dependencia_solicitante_legado_id INTEGER,
    sede_solicitante_legado_id INTEGER,
    usuario_id INTEGER,
    usuario_rol VARCHAR(40),
    usuario_legado VARCHAR(15),
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW() NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_numero_contrato_vigencia_id_contrato_general UNIQUE (numero_contrato, vigencia_id)
);

COMMENT ON TABLE contrato_general IS 'Contrato y su información básica. Absorbe los datos 1 a 1 del proveedor (antes contratista) y del lugar de ejecución';
COMMENT ON COLUMN contrato_general.numero_contrato IS 'Número oficial del contrato. Se genera con la RN de generación cuando el contrato pasa a SUSCRITO; en ARGO v1 viene migrado. Nulo hasta la suscripción (A14)';
COMMENT ON COLUMN contrato_general.vigencia_id IS 'Parámetros CRUD, tipo de parámetro Vigencia (tipo por confirmar). Año de vigencia del contrato';
COMMENT ON COLUMN contrato_general.consecutivo_elaboracion IS 'Consecutivo de elaboración, previo a la suscripción';
COMMENT ON COLUMN contrato_general.unidad_ejecutora_id IS 'Parámetros CRUD, tipo 146 Unidad Ejecutora (6818 Rectoría, 6819 IDEXUD)';
COMMENT ON COLUMN contrato_general.tipo_compromiso_id IS 'Parámetros CRUD, tipo 111 Compromiso';
COMMENT ON COLUMN contrato_general.tipo_contrato_id IS 'Parámetros CRUD, tipo 112 Contrato';
COMMENT ON COLUMN contrato_general.perfil_contratista_id IS 'Parámetros CRUD, tipo 113 Perfil del Contratista (perfil profesional, no la entidad proveedor)';
COMMENT ON COLUMN contrato_general.fecha_suscripcion_estudio IS 'Fecha de suscripción del estudio o documento previo';
COMMENT ON COLUMN contrato_general.aplica_poliza IS 'Indica si el contrato exige póliza';
COMMENT ON COLUMN contrato_general.modalidad_seleccion_id IS 'Parámetros CRUD, tipo 115 Modalidad de Selección';
COMMENT ON COLUMN contrato_general.tipo_control_id IS 'Parámetros CRUD, tipo 119 Tipo de Control';
COMMENT ON COLUMN contrato_general.tipologia_especifica_id IS 'Parámetros CRUD, tipo 114 Tipología Específica';
COMMENT ON COLUMN contrato_general.regimen_contratacion_id IS 'Parámetros CRUD, tipo 116 Régimen de Contratación. Negocio propuso retirarlo; se mantiene nullable (supuesto S1)';
COMMENT ON COLUMN contrato_general.procedimiento_id IS 'Parámetros CRUD, tipo 117 Procedimiento';
COMMENT ON COLUMN contrato_general.plazo_ejecucion IS 'Duración del contrato, expresada en la unidad de unidad_ejecucion_id';
COMMENT ON COLUMN contrato_general.unidad_ejecucion_id IS 'Parámetros CRUD, tipo 7 Tiempo (días, meses, años). No confundir con unidad_ejecutora_id';
COMMENT ON COLUMN contrato_general.tipo_moneda_id IS 'Parámetros CRUD, tipo 122 Tipo de Moneda';
COMMENT ON COLUMN contrato_general.valor_pesos IS 'Valor del contrato en pesos';
COMMENT ON COLUMN contrato_general.valor_contrato_me IS 'Valor del contrato en moneda extranjera';
COMMENT ON COLUMN contrato_general.valor_tasa_cambio IS 'Tasa de cambio aplicada al valor en moneda extranjera';
COMMENT ON COLUMN contrato_general.tipo_gasto_id IS 'Parámetros CRUD, tipo 123 Tipo de Gasto';
COMMENT ON COLUMN contrato_general.origen_recursos_id IS 'Parámetros CRUD, tipo 124 Origen Recursos';
COMMENT ON COLUMN contrato_general.origen_presupuesto_id IS 'Parámetros CRUD, tipo 125 Origen Presupuesto';
COMMENT ON COLUMN contrato_general.tema_gasto_inversion_id IS 'Parámetros CRUD, tipo 126 Tema Gasto Inversión. Negocio propuso retirarlo; se mantiene nullable (supuesto S1)';
COMMENT ON COLUMN contrato_general.medio_pago_id IS 'Parámetros CRUD, tipo 127 Medio de Pago';
COMMENT ON COLUMN contrato_general.clausula_registro_presupuestal IS 'Indica si el contrato requiere la cláusula adicional de registro presupuestal';
COMMENT ON COLUMN contrato_general.modo_pago IS 'Modo de pago del contrato';
COMMENT ON COLUMN contrato_general.objeto IS 'Objeto del contrato';
COMMENT ON COLUMN contrato_general.justificacion IS 'Justificación del contrato';
COMMENT ON COLUMN contrato_general.actividades IS 'Actividades del contrato, en un solo campo porque la fuente las entrega unificadas';
COMMENT ON COLUMN contrato_general.condiciones IS 'Condiciones del contrato';
COMMENT ON COLUMN contrato_general.observaciones IS 'Observaciones del contrato';
COMMENT ON COLUMN contrato_general.fecha_inicial IS 'Fecha de inicio del contrato';
COMMENT ON COLUMN contrato_general.fecha_final IS 'Fecha de finalización del contrato';
COMMENT ON COLUMN contrato_general.fecha_suscripcion IS 'Fecha en que se suscribe el contrato (A6). También queda en los estados del contrato; aquí permite filtrar y trazar';
COMMENT ON COLUMN contrato_general.proveedor_numero_documento IS 'Número de documento del proveedor. Antes contratista.numero_documento (ítem 16). El proveedor se consulta en Ágora por este número';
COMMENT ON COLUMN contrato_general.tipo_persona_id IS 'Parámetros CRUD, tipo 132 Tipo Persona (natural o jurídica) del proveedor. Antes contratista.tipo_persona_id';
COMMENT ON COLUMN contrato_general.clase_proveedor_id IS 'Parámetros CRUD, tipo 120 Clase Contratista (único o sociedad temporal). Antes contratista.clase_contratista_id';
COMMENT ON COLUMN contrato_general.dependencia_solicitante_id IS 'OIKOS, dependencia que solicita el contrato.';
COMMENT ON COLUMN contrato_general.sede_solicitante_id IS 'OIKOS, sede donde se origina la solicitud.';
COMMENT ON COLUMN contrato_general.dependencia_solicitante_legado_id IS 'OIKOS, dependencia que solicita el contrato legado.';
COMMENT ON COLUMN contrato_general.sede_solicitante_legado_id IS 'OIKOS, sede donde se origina la solicitud legado.';
COMMENT ON COLUMN contrato_general.usuario_id IS 'Identificador del usuario que registra o modifica el contrato';
COMMENT ON COLUMN contrato_general.usuario_rol IS 'Rol del usuario que registra o modifica el contrato';
COMMENT ON COLUMN contrato_general.usuario_legado IS 'Usuario de ARGO v1, para compatibilidad con la migración';

CREATE INDEX idx_contrato_general_unidad_ejecutora_id ON contrato_general(unidad_ejecutora_id);
CREATE INDEX idx_contrato_general_tipo_contrato_id ON contrato_general(tipo_contrato_id);

CREATE TABLE estado_contrato (
    id SERIAL PRIMARY KEY,
    contrato_general_id INTEGER NOT NULL,
    estado_parametro_id INTEGER,
    estado_interno_parametro_id INTEGER,
    actual BOOLEAN NOT NULL,
    motivo VARCHAR(250),
    fecha_evento DATE,
    usuario_id INTEGER NOT NULL,
    usuario_rol VARCHAR(40),
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW() NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_estado_contrato_contrato_general FOREIGN KEY (contrato_general_id) REFERENCES contrato_general(id)
);

COMMENT ON TABLE estado_contrato IS 'Historial de estados del contrato (general e interno)';
COMMENT ON COLUMN estado_contrato.estado_parametro_id IS 'Parámetros CRUD, tipo 137 Estados del contrato (estado general)';
COMMENT ON COLUMN estado_contrato.estado_interno_parametro_id IS 'Parámetros CRUD, tipo 141 Estados internos del contrato';
COMMENT ON COLUMN estado_contrato.actual IS 'Marca el estado vigente del contrato';
COMMENT ON COLUMN estado_contrato.motivo IS 'Razón del cambio de estado';
COMMENT ON COLUMN estado_contrato.fecha_evento IS 'Fecha del cambio de estado';
COMMENT ON COLUMN estado_contrato.usuario_id IS 'Identificador del usuario que efectúa el cambio de estado';
COMMENT ON COLUMN estado_contrato.usuario_rol IS 'Rol del usuario que efectúa el cambio de estado';

CREATE INDEX idx_estado_contrato_contrato_general_id ON estado_contrato(contrato_general_id);

CREATE TABLE supervisor_contrato (
    id SERIAL PRIMARY KEY,
    contrato_general_id INTEGER NOT NULL,
    supervisor_id INTEGER,
    documento INTEGER,
    digito_verificacion INTEGER,
    cargo_id INTEGER,
    sede_id INTEGER NOT NULL,
    dependencia_id INTEGER NOT NULL,
    sede_legado VARCHAR(50),
    dependencia_legado VARCHAR(50),
    cargo_legado VARCHAR(250),
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW() NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_supervisor_contrato_contrato_general FOREIGN KEY (contrato_general_id) REFERENCES contrato_general(id)
);

COMMENT ON TABLE supervisor_contrato IS 'Supervisores asignados al contrato';
COMMENT ON COLUMN supervisor_contrato.supervisor_id IS 'Terceros, tercero que ejerce como supervisor';
COMMENT ON COLUMN supervisor_contrato.documento IS 'Documento del supervisor';
COMMENT ON COLUMN supervisor_contrato.digito_verificacion IS 'Dígito de verificación del documento del supervisor';
COMMENT ON COLUMN supervisor_contrato.cargo_id IS 'Parámetros CRUD, cargo del supervisor';
COMMENT ON COLUMN supervisor_contrato.sede_id IS 'OIKOS, sede del supervisor';
COMMENT ON COLUMN supervisor_contrato.dependencia_id IS 'OIKOS, dependencia del supervisor';
COMMENT ON COLUMN supervisor_contrato.sede_legado IS 'Sede en sedes_SIC de ARGO v1';
COMMENT ON COLUMN supervisor_contrato.dependencia_legado IS 'Dependencia en dependencias_SIC de ARGO v1';
COMMENT ON COLUMN supervisor_contrato.cargo_legado IS 'Cargo en la tabla de supervisores de ARGO v1';

CREATE INDEX idx_supervisor_contrato_contrato_general_id ON supervisor_contrato(contrato_general_id);
CREATE INDEX idx_supervisor_contrato_supervisor_id ON supervisor_contrato(supervisor_id);

CREATE TABLE ordenador_contrato (
    id SERIAL PRIMARY KEY,
    contrato_general_id INTEGER NOT NULL,
    tercero_id INTEGER,
    cargo_id INTEGER,
    documento_identidad VARCHAR(20),
    resolucion VARCHAR(250),
    ordenador_argo_id INTEGER,
    ordenador_sicapital_id INTEGER,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW() NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_ordenador_contrato_contrato_general FOREIGN KEY (contrato_general_id) REFERENCES contrato_general(id)
);

COMMENT ON TABLE ordenador_contrato IS 'Ordenador del gasto del contrato. Validar soporte de migración ARGO v1. Confirmar si un contrato puede tener varios ordenadores (A12)';
COMMENT ON COLUMN ordenador_contrato.tercero_id IS 'Terceros, tercero que actúa como ordenador del gasto';
COMMENT ON COLUMN ordenador_contrato.cargo_id IS 'Parámetros CRUD, cargo del ordenador';
COMMENT ON COLUMN ordenador_contrato.documento_identidad IS 'Documento de identidad del ordenador';
COMMENT ON COLUMN ordenador_contrato.resolucion IS 'Resolución que autoriza al ordenador';
COMMENT ON COLUMN ordenador_contrato.ordenador_argo_id IS 'ARGO v1, PK de la tabla ordenadores';
COMMENT ON COLUMN ordenador_contrato.ordenador_sicapital_id IS 'ARGO v1, id_ordenador de la tabla ordenadores (SiCapital)';

CREATE INDEX idx_ordenador_contrato_contrato_general_id ON ordenador_contrato(contrato_general_id);

CREATE TABLE contrato_arrendamiento (
    id SERIAL PRIMARY KEY,
    contrato_general_id INTEGER NOT NULL,
    destinacion VARCHAR(1000),
    plazo_pago_mensual INTEGER,
    reajuste VARCHAR(255),
    plazo_administracion INTEGER,
    valor_administracion NUMERIC(20,7),
    plazo_entrega INTEGER,
    valor_arrendamiento NUMERIC(20,7),
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW() NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_contrato_general_id_contrato_arrendamiento UNIQUE (contrato_general_id),
    CONSTRAINT fk_contrato_arrendamiento_contrato_general FOREIGN KEY (contrato_general_id) REFERENCES contrato_general(id)
);

COMMENT ON TABLE contrato_arrendamiento IS 'Datos propios de un contrato de arrendamiento (1 a 1 con el contrato)';
COMMENT ON COLUMN contrato_arrendamiento.destinacion IS 'Uso previsto del inmueble arrendado';
COMMENT ON COLUMN contrato_arrendamiento.plazo_pago_mensual IS 'Día del mes establecido para el pago';
COMMENT ON COLUMN contrato_arrendamiento.reajuste IS 'Condición de reajuste del canon';
COMMENT ON COLUMN contrato_arrendamiento.plazo_administracion IS 'Plazo de pago de la administración';
COMMENT ON COLUMN contrato_arrendamiento.valor_administracion IS 'Valor de la administración';
COMMENT ON COLUMN contrato_arrendamiento.plazo_entrega IS 'Plazo de entrega del inmueble';
COMMENT ON COLUMN contrato_arrendamiento.valor_arrendamiento IS 'Valor mensual del arrendamiento';

CREATE TABLE convenio (
    id SERIAL PRIMARY KEY,
    contrato_general_id INTEGER NOT NULL,
    nombre VARCHAR(250),
    vigencia INTEGER,
    tipo_convenio_id INTEGER,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW() NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_convenio_contrato_general FOREIGN KEY (contrato_general_id) REFERENCES contrato_general(id)
);

COMMENT ON TABLE convenio IS 'Convenio en el que se enmarca el contrato';
COMMENT ON COLUMN convenio.nombre IS 'Nombre del convenio';
COMMENT ON COLUMN convenio.vigencia IS 'Año de vigencia del convenio';
COMMENT ON COLUMN convenio.tipo_convenio_id IS 'Parámetros CRUD, tipo de convenio (tipo de parámetro por confirmar)';

CREATE INDEX idx_convenio_contrato_general_id ON convenio(contrato_general_id);

CREATE TABLE especificacion_tecnica (
    id SERIAL PRIMARY KEY,
    contrato_general_id INTEGER,
    descripcion VARCHAR(2000),
    cantidad INTEGER NOT NULL,
    valor_unitario NUMERIC(20,7),
    valor_total NUMERIC(20,7),
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW() NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_especificacion_tecnica_contrato_general FOREIGN KEY (contrato_general_id) REFERENCES contrato_general(id)
);

COMMENT ON TABLE especificacion_tecnica IS 'Ítems técnicos y económicos del contrato';
COMMENT ON COLUMN especificacion_tecnica.descripcion IS 'Descripción del ítem o servicio';
COMMENT ON COLUMN especificacion_tecnica.cantidad IS 'Cantidad de ítems';
COMMENT ON COLUMN especificacion_tecnica.valor_unitario IS 'Valor unitario del ítem';
COMMENT ON COLUMN especificacion_tecnica.valor_total IS 'Valor total del ítem';

CREATE INDEX idx_especificacion_tecnica_contrato_general_id ON especificacion_tecnica(contrato_general_id);

CREATE TABLE disponibilidad_presupuestal (
    id SERIAL PRIMARY KEY,
    contrato_general_id INTEGER NOT NULL,
    numero_cdp_id INTEGER,
    vigencia_cdp_id INTEGER,
    fecha_registro DATE,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW() NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_disponibilidad_presupuestal_contrato_general FOREIGN KEY (contrato_general_id) REFERENCES contrato_general(id)
);

COMMENT ON TABLE disponibilidad_presupuestal IS 'Certificados de disponibilidad presupuestal (CDP) del contrato';
COMMENT ON COLUMN disponibilidad_presupuestal.numero_cdp_id IS 'SiCapital, número del CDP con el que se consulta la fuente';
COMMENT ON COLUMN disponibilidad_presupuestal.vigencia_cdp_id IS 'Año de vigencia del CDP';
COMMENT ON COLUMN disponibilidad_presupuestal.fecha_registro IS 'Fecha de registro del CDP';

CREATE INDEX idx_disponibilidad_presupuestal_contrato_general_id ON disponibilidad_presupuestal(contrato_general_id);

CREATE TABLE registro_presupuestal (
    id SERIAL PRIMARY KEY,
    disponibilidad_presupuestal_id INTEGER NOT NULL,
    numero_registro_presupuestal INTEGER,
    vigencia_rp_id INTEGER,
    fecha_registro DATE,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW() NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_registro_presupuestal_disponibilidad_presupuestal FOREIGN KEY (disponibilidad_presupuestal_id) REFERENCES disponibilidad_presupuestal(id)
);

COMMENT ON TABLE registro_presupuestal IS 'Registros presupuestales (RP) expedidos sobre un CDP';
COMMENT ON COLUMN registro_presupuestal.disponibilidad_presupuestal_id IS 'Antes cdp_id';
COMMENT ON COLUMN registro_presupuestal.numero_registro_presupuestal IS 'Número del registro presupuestal (RP). Antes registro_presupuestal';
COMMENT ON COLUMN registro_presupuestal.vigencia_rp_id IS 'Año de vigencia del RP';
COMMENT ON COLUMN registro_presupuestal.fecha_registro IS 'Fecha de registro del RP';

CREATE INDEX idx_registro_presupuestal_disponibilidad_presupuestal_id ON registro_presupuestal(disponibilidad_presupuestal_id);

CREATE TABLE poliza (
    id SERIAL PRIMARY KEY,
    contrato_general_id INTEGER NOT NULL,
    numero_poliza VARCHAR(50),
    entidad_aseguradora_id INTEGER,
    descripcion VARCHAR(255),
    fecha_inicio DATE,
    fecha_fin DATE,
    fecha_expedicion DATE,
    fecha_aprobacion DATE,
    usuario_id INTEGER,
    usuario_rol VARCHAR(40),
    usuario_legado VARCHAR(15),
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW() NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_poliza_contrato_general FOREIGN KEY (contrato_general_id) REFERENCES contrato_general(id)
);

COMMENT ON TABLE poliza IS 'Pólizas expedidas para las garantías del contrato';
COMMENT ON COLUMN poliza.numero_poliza IS 'Número con el que la aseguradora identifica la póliza. Sin restricción de unicidad (#351)';
COMMENT ON COLUMN poliza.entidad_aseguradora_id IS 'Parámetros CRUD, entidad aseguradora (tipo de parámetro por confirmar)';
COMMENT ON COLUMN poliza.descripcion IS 'Descripción de la póliza';
COMMENT ON COLUMN poliza.fecha_inicio IS 'Inicio de vigencia de la póliza';
COMMENT ON COLUMN poliza.fecha_fin IS 'Fin de vigencia de la póliza';
COMMENT ON COLUMN poliza.fecha_expedicion IS 'Fecha en que la aseguradora expide la póliza';
COMMENT ON COLUMN poliza.fecha_aprobacion IS 'Fecha en que la Universidad aprueba la póliza';
COMMENT ON COLUMN poliza.usuario_id IS 'Identificador del usuario que registra o modifica la póliza';
COMMENT ON COLUMN poliza.usuario_rol IS 'Rol del usuario que registra o modifica la póliza';
COMMENT ON COLUMN poliza.usuario_legado IS 'Usuario de ARGO v1, para compatibilidad con la migración';

CREATE INDEX idx_poliza_contrato_general_id ON poliza(contrato_general_id);

CREATE TABLE estado_poliza (
    id SERIAL PRIMARY KEY,
    poliza_id INTEGER NOT NULL,
    estado_parametro_id INTEGER NOT NULL,
    motivo VARCHAR(250),
    usuario_id INTEGER NOT NULL,
    usuario_rol VARCHAR(40),
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW() NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_estado_poliza_poliza FOREIGN KEY (poliza_id) REFERENCES poliza(id)
);

COMMENT ON TABLE estado_poliza IS 'Historial de estados de la póliza. El estado vigente es el registro más reciente';
COMMENT ON COLUMN estado_poliza.estado_parametro_id IS 'Parámetros CRUD, estado de la póliza (tipo de parámetro por confirmar; estados por definir con la Analista)';
COMMENT ON COLUMN estado_poliza.motivo IS 'Razón del cambio de estado';
COMMENT ON COLUMN estado_poliza.usuario_id IS 'Identificador del usuario que efectúa el cambio de estado';
COMMENT ON COLUMN estado_poliza.usuario_rol IS 'Rol del usuario que efectúa el cambio de estado';

CREATE INDEX idx_estado_poliza_poliza_id ON estado_poliza(poliza_id);

CREATE TABLE amparo_poliza (
    id SERIAL PRIMARY KEY,
    contrato_general_id INTEGER NOT NULL,
    poliza_id INTEGER,
    amparo_id INTEGER NOT NULL,
    tipo_valor_amparo_id INTEGER,
    suficiencia NUMERIC(20,7),
    valor NUMERIC(20,7),
    descripcion VARCHAR(255),
    fecha_inicio DATE,
    fecha_fin DATE,
    usuario_id INTEGER,
    usuario_rol VARCHAR(40),
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW() NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_amparo_poliza_contrato_general FOREIGN KEY (contrato_general_id) REFERENCES contrato_general(id),
    CONSTRAINT fk_amparo_poliza_poliza FOREIGN KEY (poliza_id) REFERENCES poliza(id)
);

COMMENT ON TABLE amparo_poliza IS 'Amparos exigidos al contrato y cubiertos luego por la póliza';
COMMENT ON COLUMN amparo_poliza.contrato_general_id IS 'El amparo se registra con la minuta, antes de que exista la póliza (#351)';
COMMENT ON COLUMN amparo_poliza.poliza_id IS 'Nulo hasta que la póliza se expide y se asocia';
COMMENT ON COLUMN amparo_poliza.amparo_id IS 'Parámetros CRUD, tipo 118 Amparo';
COMMENT ON COLUMN amparo_poliza.tipo_valor_amparo_id IS 'Parámetros CRUD, tipo de valor de la suficiencia (porcentaje o SMLV; tipo de parámetro por confirmar)';
COMMENT ON COLUMN amparo_poliza.suficiencia IS 'Suficiencia del amparo. Se interpreta según tipo_valor_amparo_id; excepción a numeric(5,4) documentada en la #351';
COMMENT ON COLUMN amparo_poliza.valor IS 'Valor asegurado del amparo';
COMMENT ON COLUMN amparo_poliza.descripcion IS 'Descripción del amparo';
COMMENT ON COLUMN amparo_poliza.fecha_inicio IS 'Inicio de vigencia del amparo';
COMMENT ON COLUMN amparo_poliza.fecha_fin IS 'Fin de vigencia del amparo';
COMMENT ON COLUMN amparo_poliza.usuario_id IS 'Identificador del usuario que registra o modifica el amparo';
COMMENT ON COLUMN amparo_poliza.usuario_rol IS 'Rol del usuario que registra o modifica el amparo';

CREATE INDEX idx_amparo_poliza_contrato_general_id ON amparo_poliza(contrato_general_id);
CREATE INDEX idx_amparo_poliza_poliza_id ON amparo_poliza(poliza_id);

CREATE TABLE documento_contrato (
    id SERIAL PRIMARY KEY,
    entidad_tipo VARCHAR(50) NOT NULL,
    entidad_id INTEGER NOT NULL,
    tipo_documento_id INTEGER,
    documento_id INTEGER,
    documento_enlace VARCHAR(50),
    usuario_id INTEGER,
    usuario_rol VARCHAR(40),
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW() NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE documento_contrato IS 'Documentos del contrato en una sola tabla, sin estados (A9 "con ajustes"; supuesto S6). Relación polimórfica: un documento pertenece a un contrato_general, una poliza o un acta_inicio';
COMMENT ON COLUMN documento_contrato.entidad_tipo IS 'Tabla a la que pertenece el documento: contrato_general, poliza o acta_inicio';
COMMENT ON COLUMN documento_contrato.entidad_id IS 'Identificador del registro en la tabla indicada por entidad_tipo (sin FK física)';
COMMENT ON COLUMN documento_contrato.tipo_documento_id IS 'Parámetros CRUD, tipo de documento (tipo 133 Documentos Contrato)';
COMMENT ON COLUMN documento_contrato.documento_id IS 'Gestor Documental, identificador del documento';
COMMENT ON COLUMN documento_contrato.documento_enlace IS 'Gestor Documental, enlace del documento';
COMMENT ON COLUMN documento_contrato.usuario_id IS 'Identificador del usuario que registra el documento';
COMMENT ON COLUMN documento_contrato.usuario_rol IS 'Rol del usuario que registra el documento';

CREATE INDEX idx_documento_contrato_entidad_tipo_entidad_id ON documento_contrato(entidad_tipo, entidad_id);

CREATE TABLE acta_inicio (
    id SERIAL PRIMARY KEY,
    contrato_general_id INTEGER NOT NULL,
    descripcion VARCHAR(2000),
    fecha_inicio DATE,
    fecha_fin DATE,
    fecha_suscripcion DATE,
    numero_acta VARCHAR(50),
    valor_disponibilidad NUMERIC(20,7),
    numero_registro_presupuestal VARCHAR(50),
    valor_registro_presupuestal NUMERIC(20,7),
    valor_anticipo NUMERIC(20,7),
    nombre_interventor VARCHAR(250),
    usuario_id INTEGER,
    usuario_rol VARCHAR(40),
    usuario_legado VARCHAR(15),
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW() NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_acta_inicio_contrato_general FOREIGN KEY (contrato_general_id) REFERENCES contrato_general(id)
);

COMMENT ON TABLE acta_inicio IS 'Acta con la que inicia la ejecución del contrato';
COMMENT ON COLUMN acta_inicio.descripcion IS 'Descripción del acta de inicio';
COMMENT ON COLUMN acta_inicio.fecha_inicio IS 'Fecha de inicio de ejecución del contrato';
COMMENT ON COLUMN acta_inicio.fecha_fin IS 'Fecha prevista de finalización del contrato';
COMMENT ON COLUMN acta_inicio.fecha_suscripcion IS 'Fecha de suscripción del acta de inicio (no la del contrato). Supuesto S2';
COMMENT ON COLUMN acta_inicio.numero_acta IS 'Número del acta de inicio. Supuesto S2';
COMMENT ON COLUMN acta_inicio.valor_disponibilidad IS 'Valor del CDP registrado en el acta. Duplica información de disponibilidad_presupuestal (supuesto S2)';
COMMENT ON COLUMN acta_inicio.numero_registro_presupuestal IS 'Número del RP digitado en el acta. Duplica información de registro_presupuestal (supuesto S2)';
COMMENT ON COLUMN acta_inicio.valor_registro_presupuestal IS 'Valor del RP registrado en el acta. Supuesto S2';
COMMENT ON COLUMN acta_inicio.valor_anticipo IS 'Valor del anticipo del contrato. Supuesto S2';
COMMENT ON COLUMN acta_inicio.nombre_interventor IS 'Nombre del interventor, cuando aplica. Supuesto S2';
COMMENT ON COLUMN acta_inicio.usuario_id IS 'Identificador del usuario que registra el acta';
COMMENT ON COLUMN acta_inicio.usuario_rol IS 'Rol del usuario que registra el acta';
COMMENT ON COLUMN acta_inicio.usuario_legado IS 'Usuario de ARGO v1, para compatibilidad con la migración';

CREATE INDEX idx_acta_inicio_contrato_general_id ON acta_inicio(contrato_general_id);
