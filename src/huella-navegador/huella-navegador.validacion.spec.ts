import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { HuellaNavegadorController } from './huella-navegador.controller';
import { HuellaNavegadorService } from './huella-navegador.service';

/**
 * Prueba HTTP con el mismo ValidationPipe global de main.ts, para fijar que el
 * cliente no puede enviar los campos que calcula el servidor.
 */
describe('HuellaNavegador: validación del POST', () => {
  let app: INestApplication;

  const mockService = {
    create: jest.fn(async (dto, ip) => ({
      id: 1,
      ...dto,
      direccion_ip_servidor: ip,
    })),
  };

  const cuerpoValido = {
    huella: '4f2a9c1e8b7d6a5f3e2d1c0b9a8f7e6d',
    libreria: 'fingerprintjs',
    version_libreria: '5.0.1',
    confianza: 0.4,
    componentes: {
      canvas: { hash: 'a1b2c3d4e5f60718', duracion_ms: 12, error: false },
    },
    direccion_ip: '190.25.0.1',
    user_agent: 'Mozilla/5.0',
    usuario_id: 123,
    usuario_rol: 'ASISTENTE_JURIDICA',
    microcliente: 'gestion_contractual_mf',
    ruta: '/gestion-contractual/consulta-contrato',
    fecha_captura: '2026-10-16T15:00:00.000Z',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HuellaNavegadorController],
      providers: [{ provide: HuellaNavegadorService, useValue: mockService }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
        whitelist: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    mockService.create.mockClear();
  });

  it('debería aceptar un cuerpo válido y responder 201', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/huellas-navegador')
      .set('X-Forwarded-For', '190.25.0.1, 10.0.0.2')
      .send(cuerpoValido)
      .expect(201);

    expect(respuesta.body.Success).toBe(true);
    expect(respuesta.body.Data.direccion_ip_servidor).toBe('190.25.0.1');
    const [dtoRecibido] = mockService.create.mock.calls[0];
    expect(dtoRecibido.fecha_captura).toBeInstanceOf(Date);
  });

  it('debería aceptar direccion_ip nula u omitida', async () => {
    const sinIp: Record<string, unknown> = { ...cuerpoValido };
    delete sinIp.direccion_ip;

    await request(app.getHttpServer())
      .post('/huellas-navegador')
      .send(sinIp)
      .expect(201);
    await request(app.getHttpServer())
      .post('/huellas-navegador')
      .send({ ...cuerpoValido, direccion_ip: null })
      .expect(201);
  });

  it('debería responder 400 si el cliente envía direccion_ip_servidor', async () => {
    await request(app.getHttpServer())
      .post('/huellas-navegador')
      .send({ ...cuerpoValido, direccion_ip_servidor: '1.1.1.1' })
      .expect(400);

    expect(mockService.create).not.toHaveBeenCalled();
  });

  it('debería responder 400 si direccion_ip no es una IP', async () => {
    await request(app.getHttpServer())
      .post('/huellas-navegador')
      .send({ ...cuerpoValido, direccion_ip: '999.1.1.1' })
      .expect(400);

    expect(mockService.create).not.toHaveBeenCalled();
  });

  it('debería responder 400 si confianza está fuera de 0 a 1', async () => {
    await request(app.getHttpServer())
      .post('/huellas-navegador')
      .send({ ...cuerpoValido, confianza: 1.5 })
      .expect(400);
  });

  it('debería responder 400 si falta un campo obligatorio', async () => {
    const sinHuella: Record<string, unknown> = { ...cuerpoValido };
    delete sinHuella.huella;

    await request(app.getHttpServer())
      .post('/huellas-navegador')
      .send(sinHuella)
      .expect(400);
  });
});
