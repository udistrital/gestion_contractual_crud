TRUNCATE TABLE contrato_general CASCADE;
TRUNCATE TABLE convenio CASCADE;
TRUNCATE TABLE contratista CASCADE;
TRUNCATE TABLE contrato_arrendamiento CASCADE;
TRUNCATE TABLE cdp CASCADE;
TRUNCATE TABLE registro_presupuestal CASCADE;
TRUNCATE TABLE supervisor_contrato CASCADE;
TRUNCATE TABLE lugar_ejecucion CASCADE;
TRUNCATE TABLE acta_inicio CASCADE;
TRUNCATE TABLE especificacion_tecnica CASCADE;
TRUNCATE TABLE estado_contrato CASCADE;
TRUNCATE TABLE documento_contrato CASCADE;
TRUNCATE TABLE solicitante CASCADE;
TRUNCATE TABLE amparo_poliza CASCADE;
TRUNCATE TABLE poliza CASCADE;

INSERT INTO contrato_general (
    id,
    tipo_compromiso_id,
    tipo_contrato_id,
    perfil_contratista_id,
    fecha_suscripcion_estudios,
    aplica_poliza,
    ordenador_id,
    modalidad_seleccion_id,
    tipo_control_id,
    tipologia_especifica_id,
    regimen_contratacion_id,
    procedimiento_id,
    plazo_ejecucion,
    unidad_ejecutora_id,
    numero_constancia,
    tipo_moneda_id,
    valor_pesos,
    tipo_gasto_id,
    origen_recursos_id,
    origen_presupuesto_id,
    tema_gasto_inversion_id,
    valor_contrato_me,
    valor_tasa_cambio,
    medio_pago_id,
    clausula_registro_presupuestal,
    modo_pago,
    observaciones,
    vigencia,
    consecutivo_elaboracion,
    fecha_inicial,
    fecha_final,
    usuario_legado,
    numero_contrato,
    unidad_ejecucion_id,
    activo
) VALUES
      (1, 101, 201, 301, '2024-01-15', true, 401, 501, 1, 601, 701, 801, 180, 901, 10001, 1, 45000000.00, 1101, 1201, 1301, 1401, 0.000, 1.0000000000, 1501, true, 'Mensual', 'Contrato inicial del área de TI', '2024', 'CONT-2024-001', '2024-01-15', '2024-07-15', 'USR001', 'CT-2024-001', 1601, true),

      (2, 102, 202, 302, '2024-01-20', true, 402, 502, 1, 602, 702, 802, 365, 902, 10002, 1, 120000000.00, 1102, 1202, 1302, 1402, 0.000, 1.0000000000, 1502, true, 'Bimestral', 'Contrato de consultoría estratégica', '2024', 'CONT-2024-002', '2024-02-01', '2025-01-31', 'USR002', 'CT-2024-002', 1602, true),

      (3, 103, 203, 303, '2024-02-01', false, 403, 503, 2, 603, 703, 803, 90, 903, 10003, 1, 25000000.00, 1103, 1203, 1303, 1403, 0.000, 1.0000000000, 1503, true, 'Único pago', 'Compra de equipos departamento TI', '2024', 'CONT-2024-003', '2024-02-15', '2024-05-15', 'USR003', 'CT-2024-003', 1603, true),

      (4, 104, 204, 304, '2024-02-15', true, 404, 504, 2, 604, 704, 804, 240, 904, 10004, 1, 180000000.00, 1104, 1204, 1304, 1404, 0.000, 1.0000000000, 1504, true, 'Trimestral', 'Auditoría general 2024', '2024', 'CONT-2024-004', '2024-03-01', '2024-10-31', 'USR004', 'CT-2024-004', 1604, true),

      (5, 105, 205, 305, '2024-03-01', true, 405, 505, 1, 605, 705, 805, 150, 905, 10005, 1, 55000000.00, 1105, 1205, 1305, 1405, 0.000, 1.0000000000, 1505, false, 'Mensual', 'Mantenimiento sede principal', '2024', 'CONT-2024-005', '2024-03-15', '2024-08-15', 'USR005', 'CT-2024-005', 1605, true),

      (6, 106, 206, 306, '2024-03-15', true, 406, 506, 2, 606, 706, 806, 300, 906, 10006, 1, 220000000.00, 1106, 1206, 1306, 1406, 0.000, 1.0000000000, 1506, true, 'Bimestral', 'Proyecto ERP fase 1', '2024', 'CONT-2024-006', '2024-04-01', '2024-12-31', 'USR006', 'CT-2024-006', 1606, true),

      (7, 107, 207, 307, '2024-04-01', false, 407, 507, 1, 607, 707, 807, 120, 907, 10007, 1, 35000000.00, 1107, 1207, 1307, 1407, 0.000, 1.0000000000, 1507, true, 'Mensual', 'Programa capacitación TI', '2024', 'CONT-2024-007', '2024-04-15', '2024-08-15', 'USR007', 'CT-2024-007', 1607, true),

      (8, 108, 208, 308, '2024-04-15', true, 408, 508, 2, 608, 708, 808, 270, 908, 10008, 1, 160000000.00, 1108, 1208, 1308, 1408, 0.000, 1.0000000000, 1508, true, 'Trimestral', 'Transformación digital 2024', '2024', 'CONT-2024-008', '2024-05-01', '2025-01-31', 'USR008', 'CT-2024-008', 1608, true),

      (9, 109, 209, 309, '2024-05-01', true, 409, 509, 1, 609, 709, 809, 60, 909, 10009, 1, 28000000.00, 1109, 1209, 1309, 1409, 0.000, 1.0000000000, 1509, false, 'Único pago', 'Licencias software 2024', '2024', 'CONT-2024-009', '2024-05-15', '2024-07-15', 'USR009', 'CT-2024-009', 1609, true),

      (10, 110, 210, 310, '2024-05-15', true, 410, 510, 2, 610, 710, 810, 330, 910, 10010, 1, 250000000.00, 1110, 1210, 1310, 1410, 0.000, 1.0000000000, 1510, true, 'Mensual', 'Seguridad IT 2024', '2024', 'CONT-2024-010', '2024-06-01', '2025-04-30', 'USR010', 'CT-2024-010', 1610, true);


INSERT INTO convenio (
    id,
    vigencia,
    nombre,
    tipo_convenio_id,
    contrato_general_id,
    activo,
    fecha_creacion,
    fecha_modificacion
) VALUES
      (1, 2024, 'Convenio desarrollo software empresarial', 1, 1, true, NOW(), NOW()),
      (2, 2024, 'Convenio consultoría estratégica', 2, 2, true, NOW(), NOW()),
      (3, 2024, 'Convenio actualización tecnológica', 1, 3, true, NOW(), NOW()),
      (4, 2024, 'Convenio auditoría sistemas', 2, 4, true, NOW(), NOW()),
      (5, 2024, 'Convenio mantenimiento infraestructura', 1, 5, true, NOW(), NOW()),
      (6, 2024, 'Convenio implementación ERP', 2, 6, true, NOW(), NOW()),
      (7, 2024, 'Convenio capacitación TI', 1, 7, true, NOW(), NOW()),
      (8, 2024, 'Convenio transformación digital', 2, 8, true, NOW(), NOW()),
      (9, 2024, 'Convenio licenciamiento software', 1, 9, true, NOW(), NOW()),
      (10, 2024, 'Convenio seguridad informática', 2, 10, true, NOW(), NOW());


INSERT INTO contratista (
    id,
    numero_documento,
    tipo_persona_id,
    contrato_general_id,
    clase_contratista_id,
    activo,
    fecha_creacion,
    fecha_modificacion
) VALUES
      (uuid_generate_v4(), '1098765432', 1, 1, 1001, true, NOW(), NOW()),
      (uuid_generate_v4(), '900123456-1', 2, 2, 1001, true, NOW(), NOW()),
      (uuid_generate_v4(), '1098765434', 1, 3, 1002, true, NOW(), NOW()),
      (uuid_generate_v4(), '900123458-3', 2, 4, 1002, true, NOW(), NOW()),
      (uuid_generate_v4(), '1098765436', 1, 5, 1002, true, NOW(), NOW()),
      (uuid_generate_v4(), '900123460-5', 2, 6, 1002, true, NOW(), NOW()),
      (uuid_generate_v4(), '1098765438', 1, 7, 1002, true, NOW(), NOW()),
      (uuid_generate_v4(), '900123462-7', 2, 8, 1002, true, NOW(), NOW()),
      (uuid_generate_v4(), '1098765440', 1, 9, 1001, true, NOW(), NOW()),
      (uuid_generate_v4(), '900123464-9', 2, 10, 1001, true, NOW(), NOW());


INSERT INTO contrato_arrendamiento (
    id,
    destinacion,
    plazo_pago_mensual,
    reajuste,
    plazo_administracion,
    valor_administracion,
    plazo_entrega,
    valor_arrendamiento,
    contrato_general_id,
    activo,
    fecha_creacion,
    fecha_modificacion
) VALUES
      (1, 'Oficinas administrativas', 30, 'IPC + 3%', 365, 500000.00, 15, 2500000.00, 1, true, NOW(), NOW()),
      (2, 'Centro de datos', 30, 'IPC + 2%', 365, 600000.00, 15, 3000000.00, 2, true, NOW(), NOW()),
      (3, 'Área de capacitación', 30, 'IPC + 2.5%', 365, 450000.00, 15, 2200000.00, 3, true, NOW(), NOW()),
      (4, 'Laboratorio IT', 30, 'IPC + 3%', 365, 550000.00, 15, 2800000.00, 4, true, NOW(), NOW()),
      (5, 'Almacén equipos', 30, 'IPC + 2%', 365, 400000.00, 15, 2000000.00, 5, true, NOW(), NOW());


INSERT INTO disponibilidad_presupuestal (
    id,
    numero_cdp_id,
    fecha_registro,
    vigencia_cdp,
    contrato_general_id,
    activo,
    fecha_creacion,
    fecha_modificacion
) VALUES
      (1, 20240001, '2024-01-10', 2024, 1, true, NOW(), NOW()),
      (2, 20240002, '2024-01-15', 2024, 1, true, NOW(), NOW()),
      (3, 20240003, '2024-01-20', 2024, 2, true, NOW(), NOW()),
      (4, 20240004, '2024-01-25', 2024, 2, true, NOW(), NOW()),
      (5, 20240005, '2024-02-01', 2024, 3, true, NOW(), NOW()),
      (6, 20240006, '2024-02-05', 2024, 3, true, NOW(), NOW()),
      (7, 20240007, '2024-02-10', 2024, 4, true, NOW(), NOW()),
      (8, 20240008, '2024-02-15', 2024, 4, true, NOW(), NOW()),
      (9, 20240009, '2024-02-20', 2024, 5, true, NOW(), NOW()),
      (10, 20240010, '2024-02-25', 2024, 5, true, NOW(), NOW());


INSERT INTO registro_presupuestal (
    id,
    registro_presupuestal,
    fecha_registro,
    vigencia_rp,
    cdp_id,
    activo,
    fecha_creacion,
    fecha_modificacion
) VALUES
      (1, 240001, '2024-01-12', 2024, 1, true, NOW(), NOW()),
      (2, 240002, '2024-01-17', 2024, 2, true, NOW(), NOW()),
      (3, 240003, '2024-01-22', 2024, 3, true, NOW(), NOW()),
      (4, 240004, '2024-01-27', 2024, 4, true, NOW(), NOW()),
      (5, 240005, '2024-02-03', 2024, 5, true, NOW(), NOW()),
      (6, 240006, '2024-02-07', 2024, 6, true, NOW(), NOW()),
      (7, 240007, '2024-02-12', 2024, 7, true, NOW(), NOW()),
      (8, 240008, '2024-02-17', 2024, 8, true, NOW(), NOW()),
      (9, 240009, '2024-02-22', 2024, 9, true, NOW(), NOW()),
      (10, 240010, '2024-02-27', 2024, 10, true, NOW(), NOW());


INSERT INTO supervisor_contrato (
    id,
    contrato_general_id,
    supervisor_id,
    sede_legado,
    dependencia_legado,
    cargo_legado,
    cargo_id,
    documento,
    digito_verificacion,
    sede_id,
    dependencia_id,
    activo,
    fecha_creacion,
    fecha_modificacion
) VALUES
      (1, 1, 101, 'SEDE-01', 'DEP-TI', 'COORD-TI', 201, 79123456, 1, 301, 401, true, NOW(), NOW()),
      (2, 1, 102, 'SEDE-01', 'DEP-TI', 'DIR-TI', 202, 79123457, 2, 301, 401, true, NOW(), NOW()),
      (3, 2, 103, 'SEDE-02', 'DEP-CONS', 'COORD-CONS', 203, 79123458, 3, 302, 402, true, NOW(), NOW()),
      (4, 2, 104, 'SEDE-02', 'DEP-CONS', 'DIR-CONS', 204, 79123459, 4, 302, 402, true, NOW(), NOW()),
      (5, 3, 105, 'SEDE-03', 'DEP-COMP', 'COORD-COMP', 205, 79123460, 5, 303, 403, true, NOW(), NOW()),
      (6, 3, 106, 'SEDE-03', 'DEP-COMP', 'DIR-COMP', 206, 79123461, 6, 303, 403, true, NOW(), NOW()),
      (7, 4, 107, 'SEDE-04', 'DEP-AUD', 'COORD-AUD', 207, 79123462, 7, 304, 404, true, NOW(), NOW()),
      (8, 4, 108, 'SEDE-04', 'DEP-AUD', 'DIR-AUD', 208, 79123463, 8, 304, 404, true, NOW(), NOW()),
      (9, 5, 109, 'SEDE-05', 'DEP-MANT', 'COORD-MANT', 209, 79123464, 9, 305, 405, true, NOW(), NOW()),
      (10, 5, 110, 'SEDE-05', 'DEP-MANT', 'DIR-MANT', 210, 79123465, 0, 305, 405, true, NOW(), NOW()),
      (11, 6, 111, 'SEDE-06', 'DEP-ERP', 'COORD-ERP', 211, 79123466, 1, 306, 406, true, NOW(), NOW()),
      (12, 6, 112, 'SEDE-06', 'DEP-ERP', 'DIR-ERP', 212, 79123467, 2, 306, 406, true, NOW(), NOW()),
      (13, 7, 113, 'SEDE-07', 'DEP-CAP', 'COORD-CAP', 213, 79123468, 3, 307, 407, true, NOW(), NOW()),
      (14, 7, 114, 'SEDE-07', 'DEP-CAP', 'DIR-CAP', 214, 79123469, 4, 307, 407, true, NOW(), NOW()),
      (15, 8, 115, 'SEDE-08', 'DEP-DIG', 'COORD-DIG', 215, 79123470, 5, 308, 408, true, NOW(), NOW()),
      (16, 8, 116, 'SEDE-08', 'DEP-DIG', 'DIR-DIG', 216, 79123471, 6, 308, 408, true, NOW(), NOW()),
      (17, 9, 117, 'SEDE-09', 'DEP-LIC', 'COORD-LIC', 217, 79123472, 7, 309, 409, true, NOW(), NOW()),
      (18, 9, 118, 'SEDE-09', 'DEP-LIC', 'DIR-LIC', 218, 79123473, 8, 309, 409, true, NOW(), NOW()),
      (19, 10, 119, 'SEDE-10', 'DEP-SEG', 'COORD-SEG', 219, 79123474, 9, 310, 410, true, NOW(), NOW()),
      (20, 10, 120, 'SEDE-10', 'DEP-SEG', 'DIR-SEG', 220, 79123475, 0, 310, 410, true, NOW(), NOW());


INSERT INTO lugar_ejecucion (
    id,
    pais_id,
    ciudad_id,
    municipio_id,
    dependencia_id,
    sede_id,
    direccion,
    contrato_general_id,
    activo,
    fecha_creacion,
    fecha_modificacion
) VALUES
      (1, 1, 11, 101, 201, 301, 'Calle 100 #15-20', 1, true, NOW(), NOW()),
      (2, 1, 12, 102, 202, 302, 'Carrera 7 #71-52', 2, true, NOW(), NOW()),
      (3, 1, 13, 103, 203, 303, 'Avenida El Dorado #68C-61', 3, true, NOW(), NOW()),
      (4, 1, 14, 104, 204, 304, 'Calle 72 #7-64', 4, true, NOW(), NOW()),
      (5, 1, 15, 105, 205, 305, 'Carrera 15 #93-60', 5, true, NOW(), NOW()),
      (6, 1, 16, 106, 206, 306, 'Calle 80 #11-42', 6, true, NOW(), NOW()),
      (7, 1, 17, 107, 207, 307, 'Avenida Suba #116-70', 7, true, NOW(), NOW()),
      (8, 1, 18, 108, 208, 308, 'Carrera 11 #82-76', 8, true, NOW(), NOW()),
      (9, 1, 19, 109, 209, 309, 'Calle 26 #59-51', 9, true, NOW(), NOW()),
      (10, 1, 20, 110, 210, 310, 'Carrera 13 #36-24', 10, true, NOW(), NOW());


INSERT INTO acta_inicio (
    id,
    usuario_id,
    usuario_legado,
    descripcion,
    fecha_inicio,
    fecha_fin,
    contrato_general_id,
    activo,
    fecha_creacion,
    fecha_modificacion
) VALUES
      (1, 201, 'USER001', 'Inicio proyecto desarrollo software - Fase I', '2024-01-20', '2024-07-20', 1, true, NOW(), NOW()),
      (2, 202, 'USER002', 'Inicio consultoría estratégica organizacional', '2024-02-05', '2025-02-04', 2, true, NOW(), NOW()),
      (3, 203, 'USER003', 'Inicio proceso actualización tecnológica', '2024-02-20', '2024-05-20', 3, true, NOW(), NOW()),
      (4, 204, 'USER004', 'Inicio auditoría sistemas y procesos', '2024-03-05', '2024-11-05', 4, true, NOW(), NOW()),
      (5, 205, 'USER005', 'Inicio mantenimiento infraestructura física', '2024-03-20', '2024-08-20', 5, true, NOW(), NOW()),
      (6, 206, 'USER006', 'Inicio implementación ERP empresarial', '2024-04-05', '2025-01-05', 6, true, NOW(), NOW()),
      (7, 207, 'USER007', 'Inicio programa capacitación TI', '2024-04-25', '2024-08-25', 7, true, NOW(), NOW()),
      (8, 208, 'USER008', 'Inicio proyecto transformación digital', '2024-05-10', '2025-02-10', 8, true, NOW(), NOW()),
      (9, 209, 'USER009', 'Inicio implementación nuevas licencias', '2024-05-25', '2024-07-25', 9, true, NOW(), NOW()),
      (10, 210, 'USER010', 'Inicio proyecto seguridad TI', '2024-06-10', '2025-05-10', 10, true, NOW(), NOW());


INSERT INTO especificacion_tecnica (
    id,
    descripcion,
    cantidad,
    valor_unitario,
    valor_total,
    contrato_general_id,
    activo,
    fecha_creacion,
    fecha_modificacion
) VALUES
      (1, 'Desarrollo de módulos backend en Node.js', 3, 5000000.00, 15000000.00, 1, true, NOW(), NOW()),
      (2, 'Desarrollo de interfaces frontend en Angular', 2, 4500000.00, 9000000.00, 1, true, NOW(), NOW()),
      (3, 'Consultoría en arquitectura empresarial', 4, 8000000.00, 32000000.00, 2, true, NOW(), NOW()),
      (4, 'Talleres de planeación estratégica', 3, 6000000.00, 18000000.00, 2, true, NOW(), NOW()),
      (5, 'Computadores portátiles i7 16GB RAM', 10, 4500000.00, 45000000.00, 3, true, NOW(), NOW()),
      (6, 'Servidores de desarrollo', 2, 15000000.00, 30000000.00, 3, true, NOW(), NOW()),
      (7, 'Auditoría de sistemas críticos', 5, 7000000.00, 35000000.00, 4, true, NOW(), NOW()),
      (8, 'Evaluación de seguridad informática', 3, 8000000.00, 24000000.00, 4, true, NOW(), NOW()),
      (9, 'Mantenimiento preventivo infraestructura', 12, 2500000.00, 30000000.00, 5, true, NOW(), NOW()),
      (10, 'Actualización sistemas eléctricos', 1, 25000000.00, 25000000.00, 5, true, NOW(), NOW()),
      (11, 'Implementación módulo financiero ERP', 1, 45000000.00, 45000000.00, 6, true, NOW(), NOW()),
      (12, 'Migración de datos legacy', 1, 35000000.00, 35000000.00, 6, true, NOW(), NOW()),
      (13, 'Curso certificación cloud computing', 15, 1200000.00, 18000000.00, 7, true, NOW(), NOW()),
      (14, 'Taller práctico DevOps', 10, 800000.00, 8000000.00, 7, true, NOW(), NOW()),
      (15, 'Consultoría transformación digital', 6, 7000000.00, 42000000.00, 8, true, NOW(), NOW()),
      (16, 'Implementación metodologías ágiles', 4, 6000000.00, 24000000.00, 8, true, NOW(), NOW()),
      (17, 'Licencias Microsoft 365 Enterprise', 50, 450000.00, 22500000.00, 9, true, NOW(), NOW()),
      (18, 'Licencias Adobe Creative Cloud', 10, 550000.00, 5500000.00, 9, true, NOW(), NOW()),
      (19, 'Implementación firewall nueva generación', 2, 35000000.00, 70000000.00, 10, true, NOW(), NOW()),
      (20, 'Sistema de monitoreo SIEM', 1, 45000000.00, 45000000.00, 10, true, NOW(), NOW());


INSERT INTO estado_contrato (
    id,
    usuario_id,
    motivo,
    contrato_general_id,
    estado_parametro_id,
    estado_interno_parametro_id,
    actual,
    usuario_rol,
    activo,
    fecha_creacion,
    fecha_modificacion
) VALUES
      (1, 301, 'Inicio de ejecución del contrato', 1, 101, 201, true, 'SUPERVISOR', true, NOW(), NOW()),
      (2, 301, 'Avance del 25% en desarrollo', 1, 102, 202, true, 'SUPERVISOR', true, NOW(), NOW()),
      (3, 302, 'Inicio fase de consultoría', 2, 101, 201, true, 'COORDINADOR', true, NOW(), NOW()),
      (4, 302, 'Entrega primer informe trimestral', 2, 102, 202, true, 'COORDINADOR', true, NOW(), NOW()),
      (5, 303, 'Inicio proceso de compra', 3, 101, 201, true, 'SUPERVISOR', true, NOW(), NOW()),
      (6, 303, 'Recepción de equipos', 3, 102, 202, true, 'SUPERVISOR', true, NOW(), NOW()),
      (7, 304, 'Inicio auditoría', 4, 101, 201, true, 'AUDITOR', true, NOW(), NOW()),
      (8, 304, 'Hallazgos preliminares', 4, 102, 202, true, 'AUDITOR', true, NOW(), NOW()),
      (9, 305, 'Inicio mantenimiento', 5, 101, 201, true, 'SUPERVISOR', true, NOW(), NOW()),
      (10, 305, 'Primera fase completada', 5, 102, 202, true, 'SUPERVISOR', true, NOW(), NOW()),
      (11, 306, 'Inicio desarrollo ERP', 6, 101, 201, true, 'COORDINADOR', true, NOW(), NOW()),
      (12, 306, 'Módulo financiero completado', 6, 102, 202, true, 'COORDINADOR', true, NOW(), NOW()),
      (13, 307, 'Inicio programa capacitación', 7, 101, 201, true, 'INSTRUCTOR', true, NOW(), NOW()),
      (14, 307, 'Primer módulo completado', 7, 102, 202, true, 'INSTRUCTOR', true, NOW(), NOW()),
      (15, 308, 'Inicio consultoría digital', 8, 101, 201, true, 'CONSULTOR', true, NOW(), NOW()),
      (16, 308, 'Diagnóstico inicial completado', 8, 102, 202, true, 'CONSULTOR', true, NOW(), NOW()),
      (17, 309, 'Inicio proceso licenciamiento', 9, 101, 201, true, 'SUPERVISOR', true, NOW(), NOW()),
      (18, 309, 'Activación de licencias', 9, 102, 202, true, 'SUPERVISOR', true, NOW(), NOW()),
      (19, 310, 'Inicio implementación seguridad', 10, 101, 201, true, 'COORDINADOR', true, NOW(), NOW()),
      (20, 310, 'Primera fase de seguridad', 10, 102, 202, true, 'COORDINADOR', true, NOW(), NOW());


INSERT INTO documento_contrato (
    id,
    tipo_documento_id,
    contrato_general_id,
    documento_enlace,
    documento_id,
    activo,
    fecha_creacion,
    fecha_modificacion
) VALUES
      (uuid_generate_v4(), 101, 1, 'DOC-2024-001', 501, true, NOW(), NOW()),
      (uuid_generate_v4(), 102, 1, 'DOC-2024-002', 502, true, NOW(), NOW()),
      (uuid_generate_v4(), 103, 2, 'DOC-2024-003', 503, true, NOW(), NOW()),
      (uuid_generate_v4(), 104, 2, 'DOC-2024-004', 504, true, NOW(), NOW()),
      (uuid_generate_v4(), 105, 3, 'DOC-2024-005', 505, true, NOW(), NOW()),
      (uuid_generate_v4(), 106, 3, 'DOC-2024-006', 506, true, NOW(), NOW()),
      (uuid_generate_v4(), 107, 4, 'DOC-2024-007', 507, true, NOW(), NOW()),
      (uuid_generate_v4(), 108, 4, 'DOC-2024-008', 508, true, NOW(), NOW()),
      (uuid_generate_v4(), 109, 5, 'DOC-2024-009', 509, true, NOW(), NOW()),
      (uuid_generate_v4(), 110, 5, 'DOC-2024-010', 510, true, NOW(), NOW()),
      (uuid_generate_v4(), 111, 6, 'DOC-2024-011', 511, true, NOW(), NOW()),
      (uuid_generate_v4(), 112, 6, 'DOC-2024-012', 512, true, NOW(), NOW()),
      (uuid_generate_v4(), 113, 7, 'DOC-2024-013', 513, true, NOW(), NOW()),
      (uuid_generate_v4(), 114, 7, 'DOC-2024-014', 514, true, NOW(), NOW()),
      (uuid_generate_v4(), 115, 8, 'DOC-2024-015', 515, true, NOW(), NOW()),
      (uuid_generate_v4(), 116, 8, 'DOC-2024-016', 516, true, NOW(), NOW()),
      (uuid_generate_v4(), 117, 9, 'DOC-2024-017', 517, true, NOW(), NOW()),
      (uuid_generate_v4(), 118, 9, 'DOC-2024-018', 518, true, NOW(), NOW()),
      (uuid_generate_v4(), 119, 10, 'DOC-2024-019', 519, true, NOW(), NOW()),
      (uuid_generate_v4(), 120, 10, 'DOC-2024-020', 520, true, NOW(), NOW());


INSERT INTO solicitante (
    id,
    dependencia_solicitante_id,
    sede_solicitante_id,
    contrato_general_id,
    activo,
    fecha_creacion,
    fecha_modificacion
) VALUES
      (1, 101, 201, 1, true, NOW(), NOW()),
      (2, 102, 202, 2, true, NOW(), NOW()),
      (3, 103, 203, 3, true, NOW(), NOW()),
      (4, 104, 204, 4, true, NOW(), NOW()),
      (5, 105, 205, 5, true, NOW(), NOW()),
      (6, 106, 206, 6, true, NOW(), NOW()),
      (7, 107, 207, 7, true, NOW(), NOW()),
      (8, 108, 208, 8, true, NOW(), NOW()),
      (9, 109, 209, 9, true, NOW(), NOW()),
      (10, 110, 210, 10, true, NOW(), NOW());


INSERT INTO poliza (
    id,
    numero_poliza,
    entidad_aseguradora_id,
    contrato_general_id,
    descripcion,
    fecha_inicio,
    fecha_fin,
    fecha_expedicion,
    fecha_aprobacion,
    usuario_id,
    usuario_legado,
    activo,
    fecha_creacion,
    fecha_modificacion
) VALUES
      (1, 'POL-2024-0001', 301, 1, 'Póliza de cumplimiento contrato 1', '2024-01-15', '2025-01-15', '2024-01-10', '2024-01-14', 1, 'usuario1', true, NOW(), NOW()),
      (2, 'POL-2024-0002', 302, 2, 'Póliza de cumplimiento contrato 2', '2024-02-01', '2025-02-01', '2024-01-28', '2024-01-31', 2, 'usuario2', true, NOW(), NOW()),
      (3, 'POL-2024-0003', 301, 3, 'Póliza de cumplimiento contrato 3', '2024-03-01', '2025-03-01', '2024-02-25', '2024-02-28', 3, 'usuario3', true, NOW(), NOW());

SELECT setval('poliza_id_seq', (SELECT MAX(id) FROM poliza));

-- Los amparos se registran con el contrato durante la elaboración de la minuta.
-- Los de los contratos 1, 2 y 3 ya fueron asociados a su póliza; los de los contratos 4 y 5 aún no tienen póliza expedida.
INSERT INTO amparo_poliza (
    id,
    contrato_general_id,
    poliza_id,
    amparo_id,
    tipo_valor_amparo_id,
    suficiencia,
    valor,
    descripcion,
    fecha_inicio,
    fecha_fin,
    activo,
    fecha_creacion,
    fecha_modificacion
) VALUES
      (1, 1, 1, 1181, 1, 20.0000000, 10000000.0000000, 'Cumplimiento del contrato', '2024-01-15', '2025-01-15', true, NOW(), NOW()),
      (2, 1, 1, 1182, 1, 10.0000000, 5000000.0000000, 'Calidad del servicio', '2024-01-15', '2025-01-15', true, NOW(), NOW()),
      (3, 2, 2, 1181, 1, 20.0000000, 12000000.0000000, 'Cumplimiento del contrato', '2024-02-01', '2025-02-01', true, NOW(), NOW()),
      (4, 2, 2, 1183, 2, 5.0000000, 6500000.0000000, 'Pago de salarios y prestaciones', '2024-02-01', '2025-02-01', true, NOW(), NOW()),
      (5, 3, 3, 1181, 1, 15.0000000, 8000000.0000000, 'Cumplimiento del contrato', '2024-03-01', '2025-03-01', true, NOW(), NOW()),
      (6, 4, NULL, 1181, 1, 20.0000000, 9000000.0000000, 'Cumplimiento del contrato', '2024-04-01', '2025-04-01', true, NOW(), NOW()),
      (7, 4, NULL, 1182, 1, 10.0000000, 4500000.0000000, 'Calidad del servicio', '2024-04-01', '2025-04-01', true, NOW(), NOW()),
      (8, 5, NULL, 1183, 2, 5.0000000, 7000000.0000000, 'Pago de salarios y prestaciones', '2024-05-01', '2025-05-01', true, NOW(), NOW());

SELECT setval('amparo_poliza_id_seq', (SELECT MAX(id) FROM amparo_poliza));
