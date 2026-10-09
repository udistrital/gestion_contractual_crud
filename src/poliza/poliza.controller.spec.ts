import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { PolizaController } from './poliza.controller';
import { PolizaService } from './poliza.service';

describe('PolizaController', () => {
  let controller: PolizaController;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findAmparos: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const crearRes = () =>
    ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }) as unknown as Response;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PolizaController],
      providers: [{ provide: PolizaService, useValue: mockService }],
    }).compile();

    controller = module.get<PolizaController>(PolizaController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('debería responder 200 con Data y Metadata', async () => {
      const polizas = [{ id: 1 }, { id: 2 }];
      const metadata = { total: 2 };
      mockService.findAll.mockResolvedValue([polizas, metadata]);
      const res = crearRes();

      await controller.findAll({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const cuerpo = (res.json as jest.Mock).mock.calls[0][0];
      expect(cuerpo.Data).toEqual(polizas);
      expect(cuerpo.Metadata).toEqual(metadata);
    });

    it('debería reflejar el status real del error (400 por query JSON malformado)', async () => {
      mockService.findAll.mockRejectedValue(
        new BadRequestException('Error en el formato del query JSON'),
      );
      const res = crearRes();

      await controller.findAll({ query: 'no-json' } as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      const cuerpo = (res.json as jest.Mock).mock.calls[0][0];
      expect(cuerpo.Status).toBe(400);
    });
  });

  describe('findOne', () => {
    it('debería responder 200 con la póliza', async () => {
      const poliza = { id: 1 };
      mockService.findOne.mockResolvedValue(poliza);
      const res = crearRes();

      await controller.findOne(res, '1', {});

      expect(res.status).toHaveBeenCalledWith(200);
      const cuerpo = (res.json as jest.Mock).mock.calls[0][0];
      expect(cuerpo.Data).toEqual(poliza);
    });

    it('debería responder 404 cuando la póliza no existe', async () => {
      mockService.findOne.mockRejectedValue(
        new NotFoundException('Poliza con ID "99" no encontrada'),
      );
      const res = crearRes();

      await controller.findOne(res, '99', {});

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('findAmparos', () => {
    it('debería responder 200 con los amparos y el total en Metadata', async () => {
      const amparos = [{ id: 1 }, { id: 2 }];
      mockService.findAmparos.mockResolvedValue(amparos);
      const res = crearRes();

      await controller.findAmparos(res, '1');

      expect(res.status).toHaveBeenCalledWith(200);
      const cuerpo = (res.json as jest.Mock).mock.calls[0][0];
      expect(cuerpo.Data).toEqual(amparos);
      expect(cuerpo.Metadata).toEqual({ total: 2 });
    });

    it('debería responder 404 cuando la póliza no existe', async () => {
      mockService.findAmparos.mockRejectedValue(
        new NotFoundException('Poliza con ID "99" no encontrada'),
      );
      const res = crearRes();

      await controller.findAmparos(res, '99');

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('create', () => {
    it('debería responder 201 con la póliza creada', async () => {
      const poliza = { id: 1 };
      mockService.create.mockResolvedValue(poliza);
      const res = crearRes();

      await controller.create(res, {} as any);

      expect(res.status).toHaveBeenCalledWith(201);
      const cuerpo = (res.json as jest.Mock).mock.calls[0][0];
      expect(cuerpo.Data).toEqual(poliza);
    });

    it('debería reflejar 400 cuando las fechas son inválidas', async () => {
      mockService.create.mockRejectedValue(
        new BadRequestException(
          'La fecha de inicio debe ser menor a la fecha de fin',
        ),
      );
      const res = crearRes();

      await controller.create(res, {} as any);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería reflejar 404 cuando el contrato general no existe', async () => {
      mockService.create.mockRejectedValue(
        new NotFoundException('ContratoGeneral con ID "99" no encontrado'),
      );
      const res = crearRes();

      await controller.create(res, {} as any);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('update', () => {
    it('debería responder 200 con la póliza actualizada', async () => {
      const poliza = { id: 1, descripcion: 'Actualizada' };
      mockService.update.mockResolvedValue(poliza);
      const res = crearRes();

      await controller.update(res, '1', {} as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const cuerpo = (res.json as jest.Mock).mock.calls[0][0];
      expect(cuerpo.Data).toEqual(poliza);
    });

    it('debería responder 404 cuando la póliza no existe', async () => {
      mockService.update.mockRejectedValue(
        new NotFoundException('Poliza con ID "99" no encontrada'),
      );
      const res = crearRes();

      await controller.update(res, '99', {} as any);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('remove', () => {
    it('debería responder 200 al eliminar', async () => {
      mockService.remove.mockResolvedValue(undefined);
      const res = crearRes();

      await controller.remove(res, '1');

      expect(res.status).toHaveBeenCalledWith(200);
      const cuerpo = (res.json as jest.Mock).mock.calls[0][0];
      expect(cuerpo.Success).toBe(true);
    });

    it('debería responder 404 cuando la póliza no existe', async () => {
      mockService.remove.mockRejectedValue(
        new NotFoundException('Poliza con ID "99" no encontrada'),
      );
      const res = crearRes();

      await controller.remove(res, '99');

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
