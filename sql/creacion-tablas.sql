-- Tabla principal de contratos
CREATE TABLE contrato_general (
    id SERIAL PRIMARY KEY,
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
    unidad_ejecutora_id INTEGER,
    tipo_moneda_id INTEGER,
    valor_pesos NUMERIC(16,2),
    tipo_gasto_id INTEGER,
    origen_recursos_id INTEGER,
    origen_presupuesto_id INTEGER,
    tema_gasto_inversion_id INTEGER,
    valor_contrato_me NUMERIC(16,3),
    valor_tasa_cambio NUMERIC(16,10),
    medio_pago_id INTEGER,
    clausula_registro_presupuestal BOOLEAN,
    modo_pago VARCHAR,
    objeto VARCHAR,
    justificacion VARCHAR,
    actividades VARCHAR,
    condiciones VARCHAR,
    observaciones VARCHAR(1000),
    vigencia VARCHAR(4),
    consecutivo_elaboracion VARCHAR(50),
    fecha_inicial DATE,
    fecha_final DATE,
    usuario_legado VARCHAR(15),
    numero_contrato VARCHAR(50),
    unidad_ejecucion_id INTEGER,
    activo BOOLEAN NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_modificacion TIMESTAMP NOT NULL
);

COMMENT ON TABLE contrato_general IS 'Tabla principal que almacena la información básica de los contratos';
COMMENT ON COLUMN contrato_general.tipo_compromiso_id IS 'Identificador del tipo de compromiso en Parámetros CRUD';
COMMENT ON COLUMN contrato_general.tipo_contrato_id IS 'Identificador del tipo de contrato en Parámetros CRUD';
COMMENT ON COLUMN contrato_general.perfil_contratista_id IS 'Identificador del perfil del contratista en Parámetros CRUD';
COMMENT ON COLUMN contrato_general.fecha_suscripcion_estudio IS 'Fecha de suscripcion de estudio documento previo';
COMMENT ON COLUMN contrato_general.aplica_poliza IS 'Campo que indica si Aplica Póliza para la orden de compra o servicio';
COMMENT ON COLUMN contrato_general.modalidad_seleccion_id IS 'Identificador de modalidad de selección en Parámetros CRUD';
COMMENT ON COLUMN contrato_general.tipo_control_id IS 'Identificador de tipo de control en Parámetros CRUD';
COMMENT ON COLUMN contrato_general.tipologia_especifica_id IS 'Identificador de tipología específica en Parámetros CRUD';
COMMENT ON COLUMN contrato_general.regimen_contratacion_id IS 'Identificador de regimen de contratación en Parámetros CRUD';
COMMENT ON COLUMN contrato_general.procedimiento_id IS 'Identificador de prodedimiento en Parámetros CRUD';
COMMENT ON COLUMN contrato_general.plazo_ejecucion IS 'Numero relacionado con Unidad Ejecución Id para determinar duración del contrato (1,2,4 MES, DIA, AÑo)';
COMMENT ON COLUMN contrato_general.unidad_ejecutora_id IS 'Id Unidad Ejecutora en Parámetros CRUD (Rectoría, IDEXUD)';
COMMENT ON COLUMN contrato_general.tipo_moneda_id IS 'Identificador de tipo de moneda en Parámetros CRUD';
COMMENT ON COLUMN contrato_general.valor_pesos IS 'Valor del contrato en Pesos';
COMMENT ON COLUMN contrato_general.tipo_gasto_id IS 'Identificador de tipo de gasto en Parámetros CRUD';
COMMENT ON COLUMN contrato_general.origen_recursos_id IS 'Identificador de origen de recursos en Parámetros CRUD';
COMMENT ON COLUMN contrato_general.origen_presupuesto_id IS 'Identificador de origen de presupuesto en Parámetros CRUD';
COMMENT ON COLUMN contrato_general.tema_gasto_inversion_id IS 'Identificador de tema gasto inversión en Parámetros CRUD';
COMMENT ON COLUMN contrato_general.valor_contrato_me IS 'Valor del contrato en Moneda Extranjera';
COMMENT ON COLUMN contrato_general.valor_tasa_cambio IS 'Valor de Tasa de Cambio asociado al contrato';
COMMENT ON COLUMN contrato_general.medio_pago_id IS 'Identificador de medio de pago en Parámetros CRUD';
COMMENT ON COLUMN contrato_general.clausula_registro_presupuestal IS 'Booleano que determina si el contrato requiere cláusula adicional de registro presupuestal';
COMMENT ON COLUMN contrato_general.modo_pago IS 'Campo para especificar el modo de pago asociado al contrato';
COMMENT ON COLUMN contrato_general.objeto IS 'Campo para especificar el objeto del contrato';
COMMENT ON COLUMN contrato_general.justificacion IS 'Campo para especificar la justificacion del contrato';
COMMENT ON COLUMN contrato_general.actividades IS 'Campo para especificar las actividades del contrato, se mantienen en un campo dado que desde la fuente están unificadas';
COMMENT ON COLUMN contrato_general.condiciones IS 'Campo para especificar las condiciones del contrato';
COMMENT ON COLUMN contrato_general.observaciones IS 'Campo para especificar las observaciones del contrato';
COMMENT ON COLUMN contrato_general.vigencia IS 'Año vigencia del contato (2024, 2025, etc)';
COMMENT ON COLUMN contrato_general.consecutivo_elaboracion IS 'Campo Legado, usado para compatibilidad con la migración de ARGO v1';
COMMENT ON COLUMN contrato_general.fecha_inicial IS 'Fecha Inicio del Contrato';
COMMENT ON COLUMN contrato_general.fecha_final IS 'Fecha Finalización del Contrato';
COMMENT ON COLUMN contrato_general.usuario_legado IS 'Campo Legado, usado para compatibilidad con la migración de ARGO v1';
COMMENT ON COLUMN contrato_general.numero_contrato IS 'Campo Legado, usado para compatibilidad con la migración de ARGO v1';
COMMENT ON COLUMN contrato_general.unidad_ejecucion_id IS 'Identificador de unidad de ejecución (Dia, Mes, Año) en Parámetros CRUD';


-- Tabla de documentos del contrato
CREATE TABLE documento_contrato (
    id SERIAL PRIMARY KEY,
    tipo_documento_id INTEGER,
    contrato_general_id INTEGER NOT NULL REFERENCES contrato_general(id),
    documento_enlace VARCHAR(50),
    documento_id INTEGER,
    activo BOOLEAN NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_modificacion TIMESTAMP NOT NULL
);

COMMENT ON TABLE documento_contrato IS 'Almacena los documentos asociados a cada contrato';
COMMENT ON COLUMN documento_contrato.tipo_documento_id IS 'Tipo de documento (p.ej. minuta, otros) según Parámetros CRUD';
COMMENT ON COLUMN documento_contrato.contrato_general_id IS 'Referencia del contrato general';
COMMENT ON COLUMN documento_contrato.documento_enlace IS 'Enlace asociado al Gestor Documental';
COMMENT ON COLUMN documento_contrato.documento_id IS 'Id asociado al Gestor Documental';

-- Tabla de estados del contrato
CREATE TABLE estado_contrato (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    motivo VARCHAR(250),
    contrato_general_id INTEGER NOT NULL REFERENCES contrato_general(id),
    estado_parametro_id INTEGER,
    estado_interno_parametro_id INTEGER,
    actual BOOLEAN NOT NULL,
    usuario_rol VARCHAR(40),
    fecha_evento DATE,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW() NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE estado_contrato IS 'Registra el historial de estados por los que pasa un contrato';
COMMENT ON COLUMN estado_contrato.motivo IS 'Razón del cambio de estado del contrato';
COMMENT ON COLUMN estado_contrato.contrato_general_id IS 'Referencia del contrato general';
COMMENT ON COLUMN estado_contrato.estado_parametro_id IS 'Tipo de cambio de estado según Parámetros CRUD';
COMMENT ON COLUMN estado_contrato.estado_interno_parametro_id IS 'Tipo de cambio de estado interno (Estados propios de ARGO) según Parámetros CRUD';
COMMENT ON COLUMN estado_contrato.actual IS 'Campo que permite buscar el estado actual de un contrato';
COMMENT ON COLUMN estado_contrato.usuario_rol IS 'Rol del Usuario que Efectua el cambio de estado';
COMMENT ON COLUMN estado_contrato.fecha_evento IS 'Fecha en la que se asocia el cambio de estado';

-- Tabla de solicitantes
CREATE TABLE solicitante (
    id SERIAL PRIMARY KEY,
    dependencia_solicitante_id INTEGER NOT NULL,
    sede_solicitante_id INTEGER NOT NULL,
    contrato_general_id INTEGER NOT NULL REFERENCES contrato_general(id),
    activo BOOLEAN NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_modificacion TIMESTAMP
);

COMMENT ON TABLE solicitante IS 'Información de la dependencia o área que solicita el contrato';
COMMENT ON COLUMN solicitante.dependencia_solicitante_id IS 'Identificador de la dependencia que solicita el contrato, referencia OIKOS';
COMMENT ON COLUMN solicitante.sede_solicitante_id IS 'Identificador de la sede donde se origina la solicitud, referencia OIKOS';
COMMENT ON COLUMN solicitante.contrato_general_id IS 'Referencia del contrato general';

-- Tabla de lugares de ejecución
CREATE TABLE lugar_ejecucion (
    id SERIAL PRIMARY KEY,
    pais_id INTEGER,
    ciudad_id INTEGER,
    municipio_id INTEGER,
    dependencia_id INTEGER,
    sede_id INTEGER,
    direccion VARCHAR(150),
    contrato_general_id INTEGER REFERENCES contrato_general(id),
    activo BOOLEAN NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_modificacion TIMESTAMP
);

COMMENT ON TABLE lugar_ejecucion IS 'Especifica la ubicación donde se ejecutará el contrato';
COMMENT ON COLUMN lugar_ejecucion.pais_id IS 'País donde se ejecutará el contrato';
COMMENT ON COLUMN lugar_ejecucion.ciudad_id IS 'Ciudad donde se ejecutará el contrato';
COMMENT ON COLUMN lugar_ejecucion.municipio_id IS 'Municipio donde se ejecutará el contrato';
COMMENT ON COLUMN lugar_ejecucion.dependencia_id IS 'Identificador de la dependencia del lugar de ejecución, referencia OIKOS';
COMMENT ON COLUMN lugar_ejecucion.sede_id IS 'Identificador de la sede del lugar de ejecución, referencia OIKOS';
COMMENT ON COLUMN lugar_ejecucion.direccion IS 'Dirección física donde se ejecutará el contrato';

-- Tabla de supervisores de contrato
CREATE TABLE supervisor_contrato (
    id SERIAL PRIMARY KEY,
    contrato_general_id INTEGER NOT NULL REFERENCES contrato_general(id),
    supervisor_id INTEGER,
    sede_legado VARCHAR(50),
    dependencia_legado VARCHAR(50),
    cargo_legado VARCHAR,
    cargo_id INTEGER,
    documento INTEGER,
    digito_verificacion INTEGER,
    sede_id INTEGER NOT NULL,
    dependencia_id INTEGER NOT NULL,
    activo BOOLEAN NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_modificacion TIMESTAMP
);

COMMENT ON TABLE supervisor_contrato IS 'Registro de supervisores asignados a cada contrato';
COMMENT ON COLUMN supervisor_contrato.supervisor_id IS 'Identificador del funcionario que ejerce como supervisor en terceros crud';
COMMENT ON COLUMN supervisor_contrato.sede_legado IS 'Identificador de la sede de la tabla de sedes_SIC del ARGO v1';
COMMENT ON COLUMN supervisor_contrato.dependencia_legado IS 'Identificador de la dependencia de la tabla de dependencias_SIC del ARGO v1';
COMMENT ON COLUMN supervisor_contrato.cargo_legado IS 'Identificador del cargo de la tabla de supervisores del ARGO v1';
COMMENT ON COLUMN supervisor_contrato.cargo_id IS 'Identificador del cargo de paramétros crud';
COMMENT ON COLUMN supervisor_contrato.documento IS 'Documento del funcionario que ejerce como supervisor';
COMMENT ON COLUMN supervisor_contrato.digito_verificacion IS 'Dígito de verificación del funcionario que ejerce como supervisor';
COMMENT ON COLUMN supervisor_contrato.sede_id IS 'Identificador de la sede en OIKOS';
COMMENT ON COLUMN supervisor_contrato.dependencia_id IS 'Identificador de la dependencia en OIKOS';

-- Tabla CDP (Certificado de Disponibilidad Presupuestal)
CREATE TABLE disponibilidad_presupuestal (
    id SERIAL PRIMARY KEY,
    numero_cdp_id INTEGER,
    fecha_registro DATE,
    vigencia_cdp INTEGER,
    contrato_general_id INTEGER NOT NULL REFERENCES contrato_general(id),
    activo BOOLEAN NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_modificacion TIMESTAMP NOT NULL
);

COMMENT ON TABLE disponibilidad_presupuestal IS 'Certificados de Disponibilidad Presupuestal asociados a los contratos';
COMMENT ON COLUMN disponibilidad_presupuestal.numero_cdp_id IS 'Número único del CDP';
COMMENT ON COLUMN disponibilidad_presupuestal.vigencia_cdp IS 'Año de vigencia del CDP';

-- Tabla de registros presupuestales
CREATE TABLE registro_presupuestal (
    id SERIAL PRIMARY KEY,
    registro_presupuestal INTEGER,
    fecha_registro DATE,
    vigencia_rp INTEGER,
    cdp_id INTEGER NOT NULL REFERENCES disponibilidad_presupuestal(id),
    activo BOOLEAN NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_modificacion TIMESTAMP NOT NULL
);

COMMENT ON TABLE registro_presupuestal IS 'Registros presupuestales asociados a los CDP';
COMMENT ON COLUMN registro_presupuestal.registro_presupuestal IS 'Número de disponibilidad presupuestal';
COMMENT ON COLUMN registro_presupuestal.vigencia_rp IS 'Año de vigencia del registro presupuestal';
COMMENT ON COLUMN registro_presupuestal.fecha_registro IS 'Fecha registro RP';

-- Tabla de contratos de arrendamiento
CREATE TABLE contrato_arrendamiento (
    id SERIAL PRIMARY KEY,
    destinacion VARCHAR,
    plazo_pago_mensual INTEGER,
    reajuste VARCHAR(255),
    plazo_administracion INTEGER,
    valor_administracion NUMERIC(16,2),
    plazo_entrega INTEGER,
    valor_arrendamiento NUMERIC(16,2),
    contrato_general_id INTEGER NOT NULL UNIQUE REFERENCES contrato_general(id),
    activo BOOLEAN NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_modificacion TIMESTAMP NOT NULL
);

COMMENT ON TABLE contrato_arrendamiento IS 'Información específica para contratos de tipo arrendamiento, principalmente para migración';
COMMENT ON COLUMN contrato_arrendamiento.destinacion IS 'Uso previsto del inmueble arrendado';
COMMENT ON COLUMN contrato_arrendamiento.plazo_pago_mensual IS 'Día del mes establecido para el pago';
COMMENT ON COLUMN contrato_arrendamiento.valor_arrendamiento IS 'Valor mensual del arrendamiento';

-- Tabla de contratistas
CREATE TABLE contratista (
    id SERIAL PRIMARY KEY,
    numero_documento VARCHAR(20),
    tipo_persona_id INTEGER,
    contrato_general_id INTEGER REFERENCES contrato_general(id),
    clase_contratista_id INTEGER,
    activo BOOLEAN NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_modificacion TIMESTAMP
);

COMMENT ON TABLE contratista IS 'Información de los contratistas';
COMMENT ON COLUMN contratista.numero_documento IS 'Número de identificación del contratista';
COMMENT ON COLUMN contratista.tipo_persona_id IS 'Tipo de persona (natural o jurídica)';

-- Tabla de convenios
CREATE TABLE convenio (
    id SERIAL PRIMARY KEY,
    vigencia INTEGER,
    nombre VARCHAR(250),
    tipo_convenio_id INTEGER,
    contrato_general_id INTEGER NOT NULL REFERENCES contrato_general(id),
    activo BOOLEAN NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_modificacion TIMESTAMP NOT NULL
);

COMMENT ON TABLE convenio IS 'Información específica para contratos de tipo convenio';
COMMENT ON COLUMN convenio.vigencia IS 'Año de vigencia del convenio';
COMMENT ON COLUMN convenio.tipo_convenio_id IS 'Tipo de convenio (marco, específico, etc.)';

-- Tabla de especificaciones técnicas
CREATE TABLE especificacion_tecnica (
    id SERIAL PRIMARY KEY,
    descripcion VARCHAR,
    cantidad INTEGER NOT NULL,
    valor_unitario NUMERIC(16,2),
    valor_total NUMERIC(16,2),
    contrato_general_id INTEGER REFERENCES contrato_general(id),
    activo BOOLEAN NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_modificacion TIMESTAMP NOT NULL
);

COMMENT ON TABLE especificacion_tecnica IS 'Detalles técnicos y económicos de los items del contrato';
COMMENT ON COLUMN especificacion_tecnica.descripcion IS 'Descripción detallada del item o servicio';
COMMENT ON COLUMN especificacion_tecnica.cantidad IS 'Cantidad de items';
COMMENT ON COLUMN especificacion_tecnica.valor_unitario IS 'Valor unitario del item';
COMMENT ON COLUMN especificacion_tecnica.valor_total IS 'Valor total del item';

-- Tabla de actas de inicio
CREATE TABLE acta_inicio (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER,
    usuario_legado VARCHAR(15),
    descripcion VARCHAR,
    fecha_inicio DATE,
    fecha_fin DATE,
    contrato_general_id INTEGER NOT NULL REFERENCES contrato_general(id),
    activo BOOLEAN NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_modificacion TIMESTAMP NOT NULL
);

COMMENT ON TABLE acta_inicio IS 'Registro de las actas de inicio de los contratos';
COMMENT ON COLUMN acta_inicio.descripcion IS 'Descripción del acta de inicio';
COMMENT ON COLUMN acta_inicio.fecha_inicio IS 'Fecha de inicio de ejecución del contrato';
COMMENT ON COLUMN acta_inicio.fecha_fin IS 'Fecha prevista de finalización del contrato';

-- Tabla de ordenadores de contrato
CREATE TABLE ordenador_contrato (
    id SERIAL PRIMARY KEY,
    tercero_id INTEGER,
    ordenador_argo_id INTEGER,
    ordenador_sicapital_id INTEGER,
    resolucion VARCHAR,
    documento_identidad VARCHAR,
    cargo_id INTEGER,
    contrato_general_id INTEGER NOT NULL REFERENCES contrato_general(id),
    activo BOOLEAN NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_modificacion TIMESTAMP
);

COMMENT ON TABLE ordenador_contrato IS 'Información de los ordenadores de gasto para cada contrato';
COMMENT ON COLUMN ordenador_contrato.tercero_id IS 'Identificador del tercero que actúa como ordenador, referencia a terceros crud';
COMMENT ON COLUMN ordenador_contrato.ordenador_argo_id IS 'Referencia al id PK de la tabla ordenadores ARGO v1';
COMMENT ON COLUMN ordenador_contrato.ordenador_sicapital_id IS 'Referencia al id_ordenador de la tabla ordenadores ARGO v1';
COMMENT ON COLUMN ordenador_contrato.resolucion IS 'Número de resolución que autoriza al ordenador';
COMMENT ON COLUMN ordenador_contrato.documento_identidad IS 'Número de documento de identidad del ordenador';
COMMENT ON COLUMN ordenador_contrato.cargo_id IS 'Cargo del ordenador';

-- Tabla de pólizas
CREATE TABLE poliza (
    id SERIAL PRIMARY KEY,
    numero_poliza VARCHAR(50),
    entidad_aseguradora_id INTEGER,
    contrato_general_id INTEGER NOT NULL REFERENCES contrato_general(id),
    descripcion VARCHAR(255),
    fecha_inicio DATE,
    fecha_fin DATE,
    fecha_expedicion DATE,
    fecha_aprobacion DATE,
    usuario_id INTEGER,
    usuario_legado VARCHAR(15),
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW() NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE poliza IS 'Pólizas expedidas para el cumplimiento de las garantías de un contrato';
COMMENT ON COLUMN poliza.numero_poliza IS 'Número con el que la aseguradora identifica la póliza';
COMMENT ON COLUMN poliza.entidad_aseguradora_id IS 'Identificador de la entidad aseguradora en Parámetros CRUD';
COMMENT ON COLUMN poliza.contrato_general_id IS 'Referencia del contrato general que ampara la póliza';
COMMENT ON COLUMN poliza.descripcion IS 'Descripción de la póliza';
COMMENT ON COLUMN poliza.fecha_inicio IS 'Fecha de inicio de vigencia de la póliza';
COMMENT ON COLUMN poliza.fecha_fin IS 'Fecha de finalización de vigencia de la póliza';
COMMENT ON COLUMN poliza.fecha_expedicion IS 'Fecha en la que la aseguradora expide la póliza';
COMMENT ON COLUMN poliza.fecha_aprobacion IS 'Fecha en la que la Universidad aprueba la póliza';
COMMENT ON COLUMN poliza.usuario_id IS 'Identificador del usuario que registra la póliza';
COMMENT ON COLUMN poliza.usuario_legado IS 'Campo Legado, usado para compatibilidad con la migración de ARGO v1';

-- Tabla de amparos de póliza
CREATE TABLE amparo_poliza (
    id SERIAL PRIMARY KEY,
    contrato_general_id INTEGER NOT NULL REFERENCES contrato_general(id),
    poliza_id INTEGER REFERENCES poliza(id),
    amparo_id INTEGER NOT NULL,
    tipo_valor_amparo_id INTEGER,
    suficiencia NUMERIC(20,7),
    valor NUMERIC(20,7),
    descripcion VARCHAR(255),
    fecha_inicio DATE,
    fecha_fin DATE,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW() NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE amparo_poliza IS 'Amparos que cubren un contrato. Se registran durante la elaboración de la minuta y posteriormente se asocian a la póliza expedida';
COMMENT ON COLUMN amparo_poliza.contrato_general_id IS 'Referencia del contrato general al que pertenece el amparo. Se registra antes de que exista la póliza';
COMMENT ON COLUMN amparo_poliza.poliza_id IS 'Referencia de la póliza que cubre el amparo. Es nula hasta que la póliza es expedida y asociada';
COMMENT ON COLUMN amparo_poliza.amparo_id IS 'Tipo de amparo según Parámetros CRUD';
COMMENT ON COLUMN amparo_poliza.tipo_valor_amparo_id IS 'Tipo de valor de la suficiencia según Parámetros CRUD (porcentaje, SMLV, etc.)';
COMMENT ON COLUMN amparo_poliza.suficiencia IS 'Valor numérico de la suficiencia del amparo. Se interpreta según tipo_valor_amparo_id (porcentaje o SMLV), por lo que no usa la escala de porcentaje del lineamiento';
COMMENT ON COLUMN amparo_poliza.valor IS 'Valor asegurado del amparo';
COMMENT ON COLUMN amparo_poliza.descripcion IS 'Descripción del amparo';
COMMENT ON COLUMN amparo_poliza.fecha_inicio IS 'Fecha de inicio de vigencia del amparo';
COMMENT ON COLUMN amparo_poliza.fecha_fin IS 'Fecha de finalización de vigencia del amparo';

-- Índices
CREATE INDEX idx_contrato_general_tipo_contrato ON contrato_general(tipo_contrato_id);
CREATE INDEX idx_documento_contrato_contrato ON documento_contrato(contrato_general_id);
CREATE INDEX idx_estado_contrato_contrato ON estado_contrato(contrato_general_id);
CREATE INDEX idx_supervisor_contrato_supervisor ON supervisor_contrato(supervisor_id);
CREATE INDEX idx_disponibilidad_presupuestal_contrato ON disponibilidad_presupuestal(contrato_general_id);
CREATE INDEX idx_poliza_contrato_general ON poliza(contrato_general_id);
CREATE INDEX idx_amparo_poliza_contrato_general ON amparo_poliza(contrato_general_id);
CREATE INDEX idx_amparo_poliza_poliza ON amparo_poliza(poliza_id);

COMMENT ON INDEX idx_contrato_general_tipo_contrato IS 'Índice para optimizar búsquedas por tipo de contrato';
COMMENT ON INDEX idx_documento_contrato_contrato IS 'Índice para optimizar la relación entre documentos y contratos';
COMMENT ON INDEX idx_estado_contrato_contrato IS 'Índice para optimizar consultas de estado de contratos';
COMMENT ON INDEX idx_supervisor_contrato_supervisor IS 'Índice para optimizar búsquedas por supervisor';
COMMENT ON INDEX idx_disponibilidad_presupuestal_contrato IS 'Índice para optimizar la relación entre CDP (disponibilidad presupuestal) y contratos';
COMMENT ON INDEX idx_poliza_contrato_general IS 'Índice para optimizar la consulta de pólizas por contrato';
COMMENT ON INDEX idx_amparo_poliza_contrato_general IS 'Índice para optimizar la consulta de amparos por contrato';
COMMENT ON INDEX idx_amparo_poliza_poliza IS 'Índice para optimizar la consulta de amparos por póliza';
