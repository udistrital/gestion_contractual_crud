import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { PolizaModule } from '../src/poliza/poliza.module';
import { AmparoPolizaModule } from '../src/amparo-poliza/amparo-poliza.module';
import { Poliza } from '../src/poliza/entities/poliza.entity';
import { AmparoPoliza } from '../src/amparo-poliza/entities/amparo-poliza.entity';
import { ContratoGeneral } from '../src/contrato-general/entities/contrato-general.entity';
import { FakeRepository } from './utils/fake-repository.helper';

/**
 * e2e reales de /polizas (HTTP + ValidationPipe global + reglas de negocio),
 * con los 3 repositorios TypeORM sobreescritos por un fake en memoria (no hay
 * sqlite/testcontainers en el repo). Replica el ValidationPipe de src/main.ts,
 * que no se aplica solo por levantar el módulo con Test.createTestingModule.
 */
describe('PolizaController (e2e)', () => {
  let app: INestApplication;
  let polizaRepo: FakeRepository<Poliza>;
  let amparoRepo: FakeRepository<AmparoPoliza>;
  let contratoRepo: FakeRepository<ContratoGeneral>;

  beforeEach(async () => {
    polizaRepo = new FakeRepository<Poliza>({
      columns: [
        'id',
        'numero_poliza',
        'entidad_aseguradora_id',
        'contrato_general_id',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'fecha_expedicion',
        'fecha_aprobacion',
        'usuario_id',
        'usuario_legado',
        'activo',
        'fecha_creacion',
        'fecha_modificacion',
      ],
      relations: ['contrato_general', 'amparos'],
    });
    amparoRepo = new FakeRepository<AmparoPoliza>({
      columns: [
        'id',
        'contrato_general_id',
        'poliza_id',
        'amparo_id',
        'tipo_valor_amparo_id',
        'suficiencia',
        'valor',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'activo',
        'fecha_creacion',
        'fecha_modificacion',
      ],
      relations: ['contrato_general', 'poliza'],
    });
    contratoRepo = new FakeRepository<ContratoGeneral>({ columns: ['id'] });
    contratoRepo.seed([{ id: 1 } as ContratoGeneral, { id: 2 } as ContratoGeneral]);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PolizaModule, AmparoPolizaModule],
    })
      .overrideProvider(getRepositoryToken(Poliza))
      .useValue(polizaRepo)
      .overrideProvider(getRepositoryToken(AmparoPoliza))
      .useValue(amparoRepo)
      .overrideProvider(getRepositoryToken(ContratoGeneral))
      .useValue(contratoRepo)
      .compile();

    app = moduleFixture.createNestApplication();
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

  afterEach(async () => {
    await app.close();
  });

  const polizaValida = {
    numero_poliza: 'POL-2026-0001',
    entidad_aseguradora_id: 3,
    contrato_general_id: 1,
    descripcion: 'Póliza de cumplimiento CTO-2026-001',
    fecha_inicio: '2026-01-15',
    fecha_fin: '2026-12-15',
    fecha_expedicion: '2026-01-10',
    fecha_aprobacion: '2026-01-12',
    usuario_id: 101,
  };

  it('POST /polizas crea la póliza (201)', async () => {
    const res = await request(app.getHttpServer())
      .post('/polizas')
      .send(polizaValida)
      .expect(201);

    expect(res.body.Success).toBe(true);
    expect(res.body.Data.id).toBeDefined();
    expect(res.body.Data.activo).toBe(true);
  });

  it('GET /polizas lista las pólizas creadas', async () => {
    await request(app.getHttpServer()).post('/polizas').send(polizaValida);

    const res = await request(app.getHttpServer()).get('/polizas').expect(200);

    expect(res.body.Data).toHaveLength(1);
    expect(res.body.Metadata.total).toBe(1);
  });

  it('GET /polizas?query filtra por contrato_general_id', async () => {
    await request(app.getHttpServer()).post('/polizas').send(polizaValida);
    await request(app.getHttpServer())
      .post('/polizas')
      .send({ ...polizaValida, numero_poliza: 'POL-2026-0002', contrato_general_id: 2 });

    const res = await request(app.getHttpServer())
      .get('/polizas')
      .query({ query: JSON.stringify({ contrato_general_id: 1 }) })
      .expect(200);

    expect(res.body.Data).toHaveLength(1);
    expect(res.body.Data[0].contrato_general_id).toBe(1);
  });

  it('GET /polizas/:id devuelve la póliza creada', async () => {
    const creada = await request(app.getHttpServer())
      .post('/polizas')
      .send(polizaValida);

    const res = await request(app.getHttpServer())
      .get(`/polizas/${creada.body.Data.id}`)
      .expect(200);

    expect(res.body.Data.numero_poliza).toBe('POL-2026-0001');
  });

  it('GET /polizas/:id responde 404 si no existe', async () => {
    const res = await request(app.getHttpServer())
      .get('/polizas/9999')
      .expect(404);

    expect(res.body.Success).toBe(false);
  });

  it('PUT /polizas/:id actualiza la póliza (200)', async () => {
    const creada = await request(app.getHttpServer())
      .post('/polizas')
      .send(polizaValida);

    const res = await request(app.getHttpServer())
      .put(`/polizas/${creada.body.Data.id}`)
      .send({ descripcion: 'Actualizada' })
      .expect(200);

    expect(res.body.Data.descripcion).toBe('Actualizada');
  });

  it('DELETE /polizas/:id hace borrado lógico (activo:false) sin eliminar el registro', async () => {
    const creada = await request(app.getHttpServer())
      .post('/polizas')
      .send(polizaValida);
    const id = creada.body.Data.id;

    await request(app.getHttpServer()).delete(`/polizas/${id}`).expect(200);

    const res = await request(app.getHttpServer())
      .get(`/polizas/${id}`)
      .expect(200);
    expect(res.body.Data.activo).toBe(false);
  });

  it('GET /polizas/:id/amparos devuelve los amparos asociados a la póliza', async () => {
    const creada = await request(app.getHttpServer())
      .post('/polizas')
      .send(polizaValida);
    const polizaId = creada.body.Data.id;

    await request(app.getHttpServer())
      .post('/amparos-polizas')
      .send([
        {
          contrato_general_id: 1,
          amparo_id: 1,
          tipo_valor_amparo_id: 1,
          suficiencia: 20,
          valor: 17000000,
          fecha_inicio: '2026-01-15',
          fecha_fin: '2026-12-15',
        },
      ]);
    await request(app.getHttpServer())
      .put('/amparos-polizas/1')
      .send({ poliza_id: polizaId });

    const res = await request(app.getHttpServer())
      .get(`/polizas/${polizaId}/amparos`)
      .expect(200);

    expect(res.body.Data).toHaveLength(1);
    expect(res.body.Metadata.total).toBe(1);
  });

  describe('rechazos de negocio', () => {
    it('POST /polizas responde 404 si el contrato general no existe', async () => {
      const res = await request(app.getHttpServer())
        .post('/polizas')
        .send({ ...polizaValida, contrato_general_id: 9999 })
        .expect(404);

      expect(res.body.Success).toBe(false);
    });

    it('POST /polizas responde 400 si fecha_inicio >= fecha_fin', async () => {
      const res = await request(app.getHttpServer())
        .post('/polizas')
        .send({
          ...polizaValida,
          fecha_inicio: '2026-12-15',
          fecha_fin: '2026-01-15',
        })
        .expect(400);

      expect(res.body.Success).toBe(false);
    });
  });

  describe('ValidationPipe global (whitelist/forbidNonWhitelisted)', () => {
    it('POST /polizas responde 400 si trae un campo no declarado en el DTO', async () => {
      await request(app.getHttpServer())
        .post('/polizas')
        .send({ ...polizaValida, campoInventado: 'x' })
        .expect(400);
    });

    it('GET /polizas responde 400 si trae un parámetro de query no declarado', async () => {
      await request(app.getHttpServer())
        .get('/polizas')
        .query({ paramInventado: 1 })
        .expect(400);
    });
  });
});
