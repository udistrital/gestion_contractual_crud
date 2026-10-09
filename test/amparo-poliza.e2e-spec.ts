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
 * e2e reales de /amparos-polizas (HTTP + ValidationPipe global + reglas de
 * negocio). Traduce el flujo de test/funcionales-poliza.sh a casos Jest
 * ejecutables sin depender de la app ni de Postgres corriendo.
 */
describe('AmparoPolizaController (e2e)', () => {
  let app: INestApplication;
  let polizaRepo: FakeRepository<Poliza>;
  let amparoRepo: FakeRepository<AmparoPoliza>;
  let contratoRepo: FakeRepository<ContratoGeneral>;

  const amparoColumns = [
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
  ];
  const polizaColumns = [
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
  ];

  beforeEach(async () => {
    polizaRepo = new FakeRepository<Poliza>({
      columns: polizaColumns,
      relations: ['contrato_general', 'amparos'],
    });
    amparoRepo = new FakeRepository<AmparoPoliza>({
      columns: amparoColumns,
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

  const amparo1 = {
    contrato_general_id: 1,
    amparo_id: 1,
    tipo_valor_amparo_id: 1,
    suficiencia: 20,
    valor: 17000000,
    descripcion: 'Amparo de cumplimiento',
    fecha_inicio: '2026-01-15',
    fecha_fin: '2026-12-15',
  };
  const amparo2 = { ...amparo1, amparo_id: 2, descripcion: 'Amparo de calidad' };

  it('POST /amparos-polizas crea el lote sin poliza_id (201)', async () => {
    const res = await request(app.getHttpServer())
      .post('/amparos-polizas')
      .send([amparo1, amparo2])
      .expect(201);

    expect(res.body.Data).toHaveLength(2);
    expect(res.body.Data[0].poliza_id).toBeUndefined();
  });

  it('POST /amparos-polizas responde 206 con Data:{creados,errores} en un lote parcial', async () => {
    const res = await request(app.getHttpServer())
      .post('/amparos-polizas')
      .send([amparo1, { ...amparo1, amparo_id: 4, contrato_general_id: 9999 }])
      .expect(206);

    expect(res.body.Success).toBe(false);
    expect(res.body.Data.creados).toHaveLength(1);
    expect(res.body.Data.errores).toHaveLength(1);
  });

  it('GET /amparos-polizas lista los amparos creados', async () => {
    await request(app.getHttpServer())
      .post('/amparos-polizas')
      .send([amparo1, amparo2]);

    const res = await request(app.getHttpServer())
      .get('/amparos-polizas')
      .expect(200);

    expect(res.body.Data).toHaveLength(2);
  });

  it('GET /amparos-polizas/:id devuelve el amparo', async () => {
    await request(app.getHttpServer()).post('/amparos-polizas').send([amparo1]);

    const res = await request(app.getHttpServer())
      .get('/amparos-polizas/1')
      .expect(200);

    expect(res.body.Data.amparo_id).toBe(1);
  });

  it('GET /amparos-polizas/:id responde 404 si no existe', async () => {
    await request(app.getHttpServer())
      .get('/amparos-polizas/9999')
      .expect(404);
  });

  describe('flujo completo: registrar amparos, expedir póliza y asociarlos', () => {
    it('asocia los amparos a la póliza expedida y los refleja en polizas/:id/amparos', async () => {
      await request(app.getHttpServer())
        .post('/amparos-polizas')
        .send([amparo1, amparo2])
        .expect(201);

      const polizaRes = await request(app.getHttpServer())
        .post('/polizas')
        .send({
          numero_poliza: 'POL-2026-0001',
          entidad_aseguradora_id: 3,
          contrato_general_id: 1,
          fecha_inicio: '2026-01-15',
          fecha_fin: '2026-12-15',
        })
        .expect(201);
      const polizaId = polizaRes.body.Data.id;

      await request(app.getHttpServer())
        .put('/amparos-polizas/1')
        .send({ poliza_id: polizaId })
        .expect(200);
      await request(app.getHttpServer())
        .put('/amparos-polizas/2')
        .send({ poliza_id: polizaId })
        .expect(200);

      const res = await request(app.getHttpServer())
        .get(`/polizas/${polizaId}/amparos`)
        .expect(200);
      expect(res.body.Data).toHaveLength(2);
    });

    it('rechaza asociar un amparo del contrato 1 a una póliza del contrato 2 (400)', async () => {
      await request(app.getHttpServer())
        .post('/amparos-polizas')
        .send([amparo1])
        .expect(201);

      const polizaContrato2 = await request(app.getHttpServer())
        .post('/polizas')
        .send({
          numero_poliza: 'POL-2026-0002',
          contrato_general_id: 2,
          fecha_inicio: '2026-02-01',
          fecha_fin: '2026-11-30',
        })
        .expect(201);

      await request(app.getHttpServer())
        .put('/amparos-polizas/1')
        .send({ poliza_id: polizaContrato2.body.Data.id })
        .expect(400);
    });

    it('permite desvincular un amparo de su póliza con poliza_id: null', async () => {
      await request(app.getHttpServer())
        .post('/amparos-polizas')
        .send([amparo1])
        .expect(201);
      const polizaRes = await request(app.getHttpServer())
        .post('/polizas')
        .send({
          numero_poliza: 'POL-2026-0001',
          contrato_general_id: 1,
          fecha_inicio: '2026-01-15',
          fecha_fin: '2026-12-15',
        })
        .expect(201);
      await request(app.getHttpServer())
        .put('/amparos-polizas/1')
        .send({ poliza_id: polizaRes.body.Data.id })
        .expect(200);

      const res = await request(app.getHttpServer())
        .put('/amparos-polizas/1')
        .send({ poliza_id: null })
        .expect(200);

      expect(res.body.Data.poliza_id).toBeNull();
    });
  });

  describe('borrado lógico', () => {
    it('DELETE /amparos-polizas/:id marca activo:false y el registro sigue existiendo', async () => {
      await request(app.getHttpServer())
        .post('/amparos-polizas')
        .send([amparo1])
        .expect(201);

      await request(app.getHttpServer())
        .delete('/amparos-polizas/1')
        .expect(200);

      const res = await request(app.getHttpServer())
        .get('/amparos-polizas/1')
        .expect(200);
      expect(res.body.Data.activo).toBe(false);
    });
  });

  describe('ValidationPipe global (whitelist/forbidNonWhitelisted)', () => {
    it('PUT /amparos-polizas/:id responde 400 si trae un campo no declarado (sí pasa por el ValidationPipe global)', async () => {
      await request(app.getHttpServer())
        .post('/amparos-polizas')
        .send([amparo1])
        .expect(201);

      await request(app.getHttpServer())
        .put('/amparos-polizas/1')
        .send({ poliza_id: 1, campoInventado: 'x' })
        .expect(400);
    });

    /**
     * Hallazgo: a diferencia de PUT (que usa @Body() y sí pasa por el
     * ValidationPipe global), POST /amparos-polizas usa @Body(new
     * ParseArrayPipe({items: CrearAmparoPolizaDto})) — un pipe local que NO
     * hereda whitelist/forbidNonWhitelisted del ValidationPipe global. Un
     * campo no declarado en el body del arreglo NO se rechaza hoy. Se
     * documenta el comportamiento actual (fuera de alcance corregirlo: sería
     * un cambio de producción no solicitado).
     */
    it('POST /amparos-polizas NO rechaza hoy un campo no declarado en el arreglo (comportamiento actual, no deseable)', async () => {
      await request(app.getHttpServer())
        .post('/amparos-polizas')
        .send([{ ...amparo1, campoInventado: 'x' }])
        .expect(201);
    });
  });
});
