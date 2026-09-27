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
    update: jest.fn(),
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
});
