import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AmparoPolizaService } from './amparo-poliza.service';
import { AmparoPoliza } from './entities/amparo-poliza.entity';
import { Poliza } from '../poliza/entities/poliza.entity';
import { ContratoGeneral } from '../contrato-general/entities/contrato-general.entity';
import { CrearAmparoPolizaDto } from './dto/crear-amparo-poliza.dto';

describe('AmparoPolizaService', () => {
  let service: AmparoPolizaService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  const mockAmparoPolizaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockPolizaRepository = {
    findOne: jest.fn(),
  };

  const mockContratoGeneralRepository = {
    findOne: jest.fn(),
  };

  const amparoBase: CrearAmparoPolizaDto = {
    contrato_general_id: 1,
    amparo_id: 1,
    tipo_valor_amparo_id: 1,
    suficiencia: 20,
    valor: 17000000,
    descripcion: 'Amparo de cumplimiento',
    fecha_inicio: '2026-01-15',
    fecha_fin: '2026-12-15',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AmparoPolizaService,
        {
          provide: getRepositoryToken(AmparoPoliza),
          useValue: mockAmparoPolizaRepository,
        },
        { provide: getRepositoryToken(Poliza), useValue: mockPolizaRepository },
        {
          provide: getRepositoryToken(ContratoGeneral),
          useValue: mockContratoGeneralRepository,
        },
      ],
    }).compile();

    service = module.get<AmparoPolizaService>(AmparoPolizaService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('createMultiple', () => {
    it('debería crear todos los amparos cuando el lote es válido', async () => {
      mockContratoGeneralRepository.findOne.mockResolvedValue({ id: 1 });
      mockAmparoPolizaRepository.create.mockImplementation((a) => a);
      mockAmparoPolizaRepository.save.mockImplementation((a) =>
        Promise.resolve({ id: 1, ...a }),
      );

      const { creados, errores } = await service.createMultiple([
        amparoBase,
        { ...amparoBase, amparo_id: 2 },
      ]);

      expect(creados).toHaveLength(2);
      expect(errores).toHaveLength(0);
    });

    it('debería ser parcial: crea los válidos y reporta los inválidos sin abortar el lote', async () => {
      // El contrato 1 existe; el contrato 99 no.
      mockContratoGeneralRepository.findOne.mockImplementation(({ where }) =>
        Promise.resolve(where.id === 1 ? { id: 1 } : null),
      );
      mockAmparoPolizaRepository.create.mockImplementation((a) => a);
      mockAmparoPolizaRepository.save.mockImplementation((a) =>
        Promise.resolve({ id: 1, ...a }),
      );

      const { creados, errores } = await service.createMultiple([
        amparoBase,
        { ...amparoBase, contrato_general_id: 99 },
        { ...amparoBase, amparo_id: 3 },
      ]);

      expect(creados).toHaveLength(2);
      expect(errores).toHaveLength(1);
      expect(errores[0].amparo.contrato_general_id).toBe(99);
      expect(errores[0].error).toContain('99');
    });

    it('debería aceptar amparos sin poliza_id, que se asocia después', async () => {
      mockContratoGeneralRepository.findOne.mockResolvedValue({ id: 1 });
      mockAmparoPolizaRepository.create.mockImplementation((a) => a);
      mockAmparoPolizaRepository.save.mockImplementation((a) =>
        Promise.resolve({ id: 1, ...a }),
      );

      const { creados, errores } = await service.createMultiple([amparoBase]);

      expect(errores).toHaveLength(0);
      expect(creados).toHaveLength(1);
      expect(mockPolizaRepository.findOne).not.toHaveBeenCalled();
      expect(
        mockAmparoPolizaRepository.create.mock.calls[0][0].poliza_id,
      ).toBeUndefined();
    });
  });

  describe('update', () => {
    it('debería lanzar BadRequestException si la póliza pertenece a otro contrato', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        contrato_general_id: 1,
      });
      mockPolizaRepository.findOne.mockResolvedValue({
        id: 2,
        contrato_general_id: 2,
      });

      await expect(service.update(1, { poliza_id: 2 })).rejects.toThrow(
        BadRequestException,
      );
      expect(mockAmparoPolizaRepository.update).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si la póliza no existe', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        contrato_general_id: 1,
      });
      mockPolizaRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, { poliza_id: 99 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería asociar poliza_id cuando ambos pertenecen al mismo contrato', async () => {
      mockQueryBuilder.getOne
        .mockResolvedValueOnce({ id: 1, contrato_general_id: 1 })
        .mockResolvedValueOnce({ id: 1, contrato_general_id: 1, poliza_id: 1 });
      mockPolizaRepository.findOne.mockResolvedValue({
        id: 1,
        contrato_general_id: 1,
      });
      mockAmparoPolizaRepository.update.mockResolvedValue({ affected: 1 });

      const resultado = await service.update(1, { poliza_id: 1 });

      expect(mockAmparoPolizaRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ poliza_id: 1 }),
      );
      expect(resultado.poliza_id).toBe(1);
    });
  });

  describe('remove', () => {
    it('debería hacer borrado lógico marcando activo en false', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({ id: 1, activo: true });
      mockAmparoPolizaRepository.update.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockAmparoPolizaRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ activo: false }),
      );
      expect(mockAmparoPolizaRepository.delete).not.toHaveBeenCalled();
      expect(mockAmparoPolizaRepository.remove).not.toHaveBeenCalled();
    });
  });
});
