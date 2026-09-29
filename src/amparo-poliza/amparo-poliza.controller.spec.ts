import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { AmparoPolizaController } from './amparo-poliza.controller';
import { AmparoPolizaService } from './amparo-poliza.service';

/**
 * El controlador captura la excepción y arma la respuesta a mano. Antes
 * devolvía siempre 404, ocultando el 400 de las reglas de negocio; estas
 * pruebas fijan ese comportamiento para que no se repita.
 */
describe('AmparoPolizaController', () => {
  let controller: AmparoPolizaController;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    createMultiple: jest.fn(),
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
      controllers: [AmparoPolizaController],
      providers: [{ provide: AmparoPolizaService, useValue: mockService }],
    }).compile();

    controller = module.get<AmparoPolizaController>(AmparoPolizaController);
  });

  describe('findAll', () => {
    it('debería responder 200 con Data y Metadata', async () => {
      const amparos = [{ id: 1 }, { id: 2 }];
      const metadata = { total: 2 };
      mockService.findAll.mockResolvedValue([amparos, metadata]);
      const res = crearRes();

      await controller.findAll({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const cuerpo = (res.json as jest.Mock).mock.calls[0][0];
      expect(cuerpo.Data).toEqual(amparos);
      expect(cuerpo.Metadata).toEqual(metadata);
    });

    it('debería responder 500 ante un error inesperado del servicio', async () => {
      mockService.findAll.mockRejectedValue(new Error('fallo de conexión'));
      const res = crearRes();

      await controller.findAll({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
      const cuerpo = (res.json as jest.Mock).mock.calls[0][0];
      expect(cuerpo.Success).toBe(false);
      expect(cuerpo.Message).toBe('Error al obtener los amparos');
    });
  });

  describe('findOne', () => {
    it('debería responder 200 con el amparo', async () => {
      const amparo = { id: 1 };
      mockService.findOne.mockResolvedValue(amparo);
      const res = crearRes();

      await controller.findOne(res, '1', {});

      expect(res.status).toHaveBeenCalledWith(200);
      const cuerpo = (res.json as jest.Mock).mock.calls[0][0];
      expect(cuerpo.Data).toEqual(amparo);
    });

    it('debería responder 404 cuando el amparo no existe', async () => {
      mockService.findOne.mockRejectedValue(
        new NotFoundException('AmparoPoliza con ID "99" no encontrado'),
      );
      const res = crearRes();

      await controller.findOne(res, '99', {});

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('create', () => {
    it('debería responder 201 cuando todo el lote se crea sin errores', async () => {
      const creados = [{ id: 1 }, { id: 2 }];
      mockService.createMultiple.mockResolvedValue({ creados, errores: [] });
      const res = crearRes();

      await controller.create(res, [] as any);

      expect(res.status).toHaveBeenCalledWith(201);
      const cuerpo = (res.json as jest.Mock).mock.calls[0][0];
      expect(cuerpo.Success).toBe(true);
      expect(cuerpo.Data).toEqual(creados);
      expect(cuerpo.Metadata).toEqual({ total: creados.length });
    });

    it('debería responder 206 con Data:{creados,errores} cuando el lote es parcial', async () => {
      const creados = [{ id: 1 }];
      const errores = [
        { amparo: { contrato_general_id: 99 }, error: 'no encontrado' },
      ];
      mockService.createMultiple.mockResolvedValue({ creados, errores });
      const res = crearRes();

      await controller.create(res, [] as any);

      expect(res.status).toHaveBeenCalledWith(206);
      const cuerpo = (res.json as jest.Mock).mock.calls[0][0];
      expect(cuerpo.Success).toBe(false);
      expect(cuerpo.Status).toBe(206);
      expect(cuerpo.Data).toEqual({ creados, errores });
    });

    it('debería responder 500 si el servicio lanza un error inesperado (no de negocio)', async () => {
      mockService.createMultiple.mockRejectedValue(
        new Error('fallo de conexión'),
      );
      const res = crearRes();

      await controller.create(res, [] as any);

      expect(res.status).toHaveBeenCalledWith(500);
      const cuerpo = (res.json as jest.Mock).mock.calls[0][0];
      expect(cuerpo.Success).toBe(false);
    });
  });

  describe('update', () => {
    it('debería responder 400 cuando la póliza pertenece a otro contrato', async () => {
      const motivo =
        'La póliza con ID "2" pertenece al contrato "2" y no al contrato "1" del amparo';
      mockService.update.mockRejectedValue(new BadRequestException(motivo));
      const res = crearRes();

      await controller.update(res, '1', { poliza_id: 2 });

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status).not.toHaveBeenCalledWith(404);

      const cuerpo = (res.json as jest.Mock).mock.calls[0][0];
      expect(cuerpo.Success).toBe(false);
      expect(cuerpo.Status).toBe(400);
      expect(cuerpo.Message).toBe(motivo);
    });

    it('debería seguir respondiendo 404 cuando el amparo no existe', async () => {
      mockService.update.mockRejectedValue(
        new NotFoundException('AmparoPoliza con ID "99" no encontrado'),
      );
      const res = crearRes();

      await controller.update(res, '99', { poliza_id: 1 });

      expect(res.status).toHaveBeenCalledWith(404);

      const cuerpo = (res.json as jest.Mock).mock.calls[0][0];
      expect(cuerpo.Status).toBe(404);
    });

    it('debería responder 200 cuando la asociación es válida', async () => {
      const amparo = { id: 1, contrato_general_id: 1, poliza_id: 1 };
      mockService.update.mockResolvedValue(amparo);
      const res = crearRes();

      await controller.update(res, '1', { poliza_id: 1 });

      expect(res.status).toHaveBeenCalledWith(200);

      const cuerpo = (res.json as jest.Mock).mock.calls[0][0];
      expect(cuerpo.Success).toBe(true);
      expect(cuerpo.Data).toEqual(amparo);
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

    it('debería responder 404 cuando el amparo no existe', async () => {
      mockService.remove.mockRejectedValue(
        new NotFoundException('AmparoPoliza con ID "99" no encontrado'),
      );
      const res = crearRes();

      await controller.remove(res, '99');

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
