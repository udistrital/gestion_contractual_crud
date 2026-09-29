import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
    leftJoin: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getManyAndCount: jest.fn(),
    expressionMap: { joinAttributes: [], selects: [] },
  };

  const mockAmparoPolizaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    metadata: {
      columns: [
        { propertyName: 'id' },
        { propertyName: 'contrato_general_id' },
        { propertyName: 'poliza_id' },
        { propertyName: 'amparo_id' },
        { propertyName: 'fecha_inicio' },
        { propertyName: 'fecha_fin' },
        { propertyName: 'activo' },
        { propertyName: 'fecha_creacion' },
        { propertyName: 'fecha_modificacion' },
      ],
      relations: [{ propertyName: 'contrato_general' }, { propertyName: 'poliza' }],
      findRelationWithPropertyPath: jest.fn(),
    },
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

  describe('findAll', () => {
    it('debería devolver amparos con metadata delegando en findAllWithFilters', async () => {
      const amparos = [{ id: 1 }, { id: 2 }];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([amparos, 2]);

      const [resultado, metadata] = await service.findAll({});

      expect(resultado).toEqual(amparos);
      expect(metadata.total).toBe(2);
      expect(mockAmparoPolizaRepository.createQueryBuilder).toHaveBeenCalledWith(
        'amparo',
      );
    });
  });

  describe('findOne', () => {
    it('debería lanzar NotFoundException si el amparo no existe', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    it('debería devolver el amparo cuando existe', async () => {
      const amparo = { id: 1, amparo_id: 1 };
      mockQueryBuilder.getOne.mockResolvedValue(amparo);

      await expect(service.findOne(1)).resolves.toEqual(amparo);
    });

    it('debería aplicar las relaciones pedidas en queryParams.include', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({ id: 1 });

      await service.findOne(1, { include: 'poliza' });

      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith(
        'amparo.poliza',
        'poliza',
      );
    });

    it('debería envolver un error inesperado del query builder en un InternalServerErrorException sin filtrar el mensaje crudo', async () => {
      mockQueryBuilder.getOne.mockRejectedValue(new Error('conexión perdida'));

      try {
        await service.findOne(1);
        fail('debería haber lanzado una excepción');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Error al buscar el amparo');
        expect(error.getStatus()).toBe(500);
      }
    });
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

    it('debería reportar en errores (sin abortar el lote) una fila con fecha_inicio >= fecha_fin', async () => {
      mockContratoGeneralRepository.findOne.mockResolvedValue({ id: 1 });
      mockAmparoPolizaRepository.create.mockImplementation((a) => a);
      mockAmparoPolizaRepository.save.mockImplementation((a) =>
        Promise.resolve({ id: 1, ...a }),
      );

      const { creados, errores } = await service.createMultiple([
        amparoBase,
        {
          ...amparoBase,
          amparo_id: 4,
          fecha_inicio: '2026-12-15',
          fecha_fin: '2026-01-15',
        },
      ]);

      expect(creados).toHaveLength(1);
      expect(errores).toHaveLength(1);
      expect(errores[0].error).toContain('fecha de inicio');
    });

    it('debería reportar en errores una fila cuya poliza_id pertenece a otro contrato', async () => {
      mockContratoGeneralRepository.findOne.mockResolvedValue({ id: 1 });
      mockPolizaRepository.findOne.mockResolvedValue({
        id: 5,
        contrato_general_id: 2,
      });
      mockAmparoPolizaRepository.create.mockImplementation((a) => a);
      mockAmparoPolizaRepository.save.mockImplementation((a) =>
        Promise.resolve({ id: 1, ...a }),
      );

      const { creados, errores } = await service.createMultiple([
        { ...amparoBase, poliza_id: 5 },
      ]);

      expect(creados).toHaveLength(0);
      expect(errores).toHaveLength(1);
      expect(errores[0].error).toContain('pertenece al contrato "2"');
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

    it('debería permitir desvincular la póliza con poliza_id: null sin validar contra el repositorio de pólizas', async () => {
      mockQueryBuilder.getOne
        .mockResolvedValueOnce({
          id: 1,
          contrato_general_id: 1,
          poliza_id: 1,
        })
        .mockResolvedValueOnce({
          id: 1,
          contrato_general_id: 1,
          poliza_id: null,
        });
      mockAmparoPolizaRepository.update.mockResolvedValue({ affected: 1 });

      const resultado = await service.update(1, { poliza_id: null });

      expect(mockPolizaRepository.findOne).not.toHaveBeenCalled();
      expect(mockAmparoPolizaRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ poliza_id: null }),
      );
      expect(resultado.poliza_id).toBeNull();
    });

    it('debería validar la póliza contra el contrato_general_id nuevo cuando se cambian ambos a la vez', async () => {
      mockQueryBuilder.getOne
        .mockResolvedValueOnce({
          id: 1,
          contrato_general_id: 1,
          poliza_id: null,
        })
        .mockResolvedValueOnce({
          id: 1,
          contrato_general_id: 2,
          poliza_id: 7,
        });
      mockContratoGeneralRepository.findOne.mockResolvedValue({ id: 2 });
      // La póliza 7 pertenece al contrato nuevo (2), no al actual (1).
      mockPolizaRepository.findOne.mockResolvedValue({
        id: 7,
        contrato_general_id: 2,
      });
      mockAmparoPolizaRepository.update.mockResolvedValue({ affected: 1 });

      const resultado = await service.update(1, {
        contrato_general_id: 2,
        poliza_id: 7,
      });

      expect(mockPolizaRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 7 } }),
      );
      expect(resultado.contrato_general_id).toBe(2);
    });

    it('debería rechazar la póliza que no pertenece al contrato_general_id nuevo', async () => {
      mockQueryBuilder.getOne.mockResolvedValueOnce({
        id: 1,
        contrato_general_id: 1,
        poliza_id: null,
      });
      mockContratoGeneralRepository.findOne.mockResolvedValue({ id: 2 });
      // La póliza 7 sigue perteneciendo al contrato 1, no al nuevo contrato 2.
      mockPolizaRepository.findOne.mockResolvedValue({
        id: 7,
        contrato_general_id: 1,
      });

      await expect(
        service.update(1, { contrato_general_id: 2, poliza_id: 7 }),
      ).rejects.toThrow(BadRequestException);
      expect(mockAmparoPolizaRepository.update).not.toHaveBeenCalled();
    });

    it('debería envolver un error inesperado del repositorio al actualizar en un InternalServerErrorException sin filtrar el mensaje crudo', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        contrato_general_id: 1,
      });
      mockAmparoPolizaRepository.update.mockRejectedValue(
        new Error('conexión perdida'),
      );

      try {
        await service.update(1, {});
        fail('debería haber lanzado una excepción');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Error al actualizar el amparo');
        expect(error.getStatus()).toBe(500);
      }
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

    it('debería lanzar NotFoundException si el amparo a eliminar no existe', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });

    it('debería envolver un error inesperado del repositorio al eliminar en un InternalServerErrorException sin filtrar el mensaje crudo', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({ id: 1, activo: true });
      mockAmparoPolizaRepository.update.mockRejectedValue(
        new Error('conexión perdida'),
      );

      try {
        await service.remove(1);
        fail('debería haber lanzado una excepción');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Error al eliminar el amparo');
        expect(error.getStatus()).toBe(500);
      }
    });
  });
});
