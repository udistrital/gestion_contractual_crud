import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { HuellaNavegadorController } from './huella-navegador.controller';
import { HuellaNavegadorService } from './huella-navegador.service';
import { CreateHuellaNavegadorDto } from './dto/create-huella-navegador.dto';

describe('HuellaNavegadorController', () => {
  let controller: HuellaNavegadorController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  const crearRes = () =>
    ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }) as unknown as Response;

  const crearReq = (
    headers: Record<string, string | string[]> = {},
    remoteAddress?: string,
  ) => ({ headers, socket: { remoteAddress } }) as unknown as Request;

  const dto: CreateHuellaNavegadorDto = {
    huella: '4f2a9c1e8b7d6a5f3e2d1c0b9a8f7e6d',
    libreria: 'fingerprintjs',
    version_libreria: '5.0.1',
    user_agent: 'Mozilla/5.0',
    microcliente: 'gestion_contractual_mf',
    fecha_captura: new Date('2026-10-16T15:00:00.000Z'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockService.create.mockImplementation(async (d, ip) => ({
      id: 1,
      ...d,
      direccion_ip_servidor: ip,
    }));

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HuellaNavegadorController],
      providers: [{ provide: HuellaNavegadorService, useValue: mockService }],
    }).compile();

    controller = module.get<HuellaNavegadorController>(
      HuellaNavegadorController,
    );
  });

  describe('create: IP vista por el servidor', () => {
    it('debería tomar el primer valor de X-Forwarded-For cuando hay varias IPs', async () => {
      const req = crearReq(
        { 'x-forwarded-for': ' 190.25.0.1 , 10.0.0.2, 10.0.0.3' },
        '10.0.0.3',
      );

      await controller.create(dto, req, crearRes());

      expect(mockService.create).toHaveBeenCalledWith(dto, '190.25.0.1');
    });

    it('debería usar la IP del socket cuando no viene X-Forwarded-For', async () => {
      await controller.create(dto, crearReq({}, '172.18.0.5'), crearRes());

      expect(mockService.create).toHaveBeenCalledWith(dto, '172.18.0.5');
    });

    it('debería quitar el prefijo ::ffff: de las IPv4 mapeadas a IPv6', async () => {
      await controller.create(
        dto,
        crearReq({}, '::ffff:127.0.0.1'),
        crearRes(),
      );

      expect(mockService.create).toHaveBeenCalledWith(dto, '127.0.0.1');
    });

    it('debería quitar el prefijo ::ffff: también en X-Forwarded-For', async () => {
      await controller.create(
        dto,
        crearReq({ 'x-forwarded-for': '::ffff:190.25.0.1' }),
        crearRes(),
      );

      expect(mockService.create).toHaveBeenCalledWith(dto, '190.25.0.1');
    });

    it('debería enviar null cuando no hay ninguna IP disponible', async () => {
      await controller.create(dto, crearReq({}), crearRes());

      expect(mockService.create).toHaveBeenCalledWith(dto, null);
    });

    it('debería cortar la IP a 45 caracteres', async () => {
      const larga = 'a'.repeat(60);

      await controller.create(
        dto,
        crearReq({ 'x-forwarded-for': larga }),
        crearRes(),
      );

      expect(mockService.create).toHaveBeenCalledWith(dto, 'a'.repeat(45));
    });
  });

  describe('create: respuesta', () => {
    it('debería responder 201 envuelto en StandardResponse', async () => {
      const res = crearRes();

      await controller.create(dto, crearReq({}, '127.0.0.1'), res);

      expect(res.status).toHaveBeenCalledWith(201);
      const cuerpo = (res.json as jest.Mock).mock.calls[0][0];
      expect(cuerpo).toEqual({
        Success: true,
        Status: 201,
        Message: 'Huella de navegador registrada',
        Data: { id: 1, ...dto, direccion_ip_servidor: '127.0.0.1' },
      });
    });

    it('debería responder 500 envuelto cuando falla el guardado', async () => {
      mockService.create.mockRejectedValue(new Error('conexión perdida'));
      const res = crearRes();

      await controller.create(dto, crearReq({}), res);

      expect(res.status).toHaveBeenCalledWith(500);
      const cuerpo = (res.json as jest.Mock).mock.calls[0][0];
      expect(cuerpo.Success).toBe(false);
      expect(cuerpo.Status).toBe(500);
      expect(cuerpo.Message).toBe('Error al registrar la huella de navegador');
    });
  });

  describe('findAll', () => {
    it('debería responder 200 con Data y Metadata', async () => {
      const metadata = { total: 1, limit: 10, offset: 0 };
      mockService.findAll.mockResolvedValue([[{ id: 1 }], metadata]);
      const res = crearRes();

      await controller.findAll({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const cuerpo = (res.json as jest.Mock).mock.calls[0][0];
      expect(cuerpo.Success).toBe(true);
      expect(cuerpo.Data).toEqual([{ id: 1 }]);
      expect(cuerpo.Metadata).toEqual(metadata);
    });
  });

  describe('findOne', () => {
    it('debería responder 200 con la huella', async () => {
      mockService.findOne.mockResolvedValue({ id: 7 });
      const res = crearRes();

      await controller.findOne('7', res);

      expect(mockService.findOne).toHaveBeenCalledWith(7);
      expect(res.status).toHaveBeenCalledWith(200);
      expect((res.json as jest.Mock).mock.calls[0][0].Data).toEqual({ id: 7 });
    });

    it('debería responder 404 envuelto cuando no existe', async () => {
      mockService.findOne.mockRejectedValue(
        new NotFoundException('HuellaNavegador con ID 99 no encontrada'),
      );
      const res = crearRes();

      await controller.findOne('99', res);

      expect(res.status).toHaveBeenCalledWith(404);
      const cuerpo = (res.json as jest.Mock).mock.calls[0][0];
      expect(cuerpo.Success).toBe(false);
      expect(cuerpo.Status).toBe(404);
      expect(cuerpo.Message).toBe('HuellaNavegador con ID 99 no encontrada');
    });
  });
});
