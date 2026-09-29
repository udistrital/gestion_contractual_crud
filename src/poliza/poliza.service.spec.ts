import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PolizaService } from './poliza.service';
import { Poliza } from './entities/poliza.entity';
import { AmparoPoliza } from '../amparo-poliza/entities/amparo-poliza.entity';
import { ContratoGeneral } from '../contrato-general/entities/contrato-general.entity';
import { CrearPolizaDto } from './dto/crear-poliza.dto';

describe('PolizaService', () => {
  let service: PolizaService;

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

  const mockPolizaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    metadata: {
      columns: [
        { propertyName: 'id' },
        { propertyName: 'numero_poliza' },
        { propertyName: 'contrato_general_id' },
        { propertyName: 'fecha_inicio' },
        { propertyName: 'fecha_fin' },
        { propertyName: 'activo' },
        { propertyName: 'fecha_creacion' },
        { propertyName: 'fecha_modificacion' },
      ],
      relations: [{ propertyName: 'contrato_general' }, { propertyName: 'amparos' }],
      findRelationWithPropertyPath: jest.fn(),
    },
  };

  const mockAmparoPolizaRepository = {
    find: jest.fn(),
  };

  const mockContratoGeneralRepository = {
    findOne: jest.fn(),
  };

  const dtoValido: CrearPolizaDto = {
    numero_poliza: 'POL-2026-0001',
    entidad_aseguradora_id: 3,
    contrato_general_id: 1,
    descripcion: 'Póliza de cumplimiento',
    fecha_inicio: '2026-01-15',
    fecha_fin: '2026-12-15',
    fecha_expedicion: '2026-01-10',
    fecha_aprobacion: '2026-01-12',
    usuario_id: 101,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PolizaService,
        { provide: getRepositoryToken(Poliza), useValue: mockPolizaRepository },
        {
          provide: getRepositoryToken(AmparoPoliza),
          useValue: mockAmparoPolizaRepository,
        },
        {
          provide: getRepositoryToken(ContratoGeneral),
          useValue: mockContratoGeneralRepository,
        },
      ],
    }).compile();

    service = module.get<PolizaService>(PolizaService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería lanzar NotFoundException si el contrato general no existe', async () => {
      mockContratoGeneralRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dtoValido)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPolizaRepository.save).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si fecha_inicio es mayor o igual a fecha_fin', async () => {
      mockContratoGeneralRepository.findOne.mockResolvedValue({ id: 1 });

      const dtoFechasInvalidas: CrearPolizaDto = {
        ...dtoValido,
        fecha_inicio: '2026-12-15',
        fecha_fin: '2026-01-15',
      };

      await expect(service.create(dtoFechasInvalidas)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPolizaRepository.save).not.toHaveBeenCalled();
    });

    it('debería asignar activo en true y las fechas de auditoría al crear', async () => {
      mockContratoGeneralRepository.findOne.mockResolvedValue({ id: 1 });
      mockPolizaRepository.create.mockImplementation((p) => p);
      mockPolizaRepository.save.mockImplementation((p) =>
        Promise.resolve({ id: 1, ...p }),
      );

      const resultado = await service.create(dtoValido);

      const creado = mockPolizaRepository.create.mock.calls[0][0];
      expect(creado.activo).toBe(true);
      expect(creado.fecha_creacion).toBeInstanceOf(Date);
      expect(creado.fecha_modificacion).toBeInstanceOf(Date);
      expect(resultado.id).toBe(1);
    });

    it('debería permitir crear sin fecha_inicio ni fecha_fin (validarFechas no aplica si faltan)', async () => {
      mockContratoGeneralRepository.findOne.mockResolvedValue({ id: 1 });
      mockPolizaRepository.create.mockImplementation((p) => p);
      mockPolizaRepository.save.mockImplementation((p) =>
        Promise.resolve({ id: 1, ...p }),
      );

      const { fecha_inicio, fecha_fin, ...sinFechas } = dtoValido;

      await expect(service.create(sinFechas)).resolves.toEqual(
        expect.objectContaining({ id: 1 }),
      );
    });

    it('debería envolver un error inesperado del repositorio al guardar en un InternalServerErrorException sin filtrar el mensaje crudo', async () => {
      mockContratoGeneralRepository.findOne.mockResolvedValue({ id: 1 });
      mockPolizaRepository.create.mockImplementation((p) => p);
      mockPolizaRepository.save.mockRejectedValue(new Error('conexión perdida'));

      try {
        await service.create(dtoValido);
        fail('debería haber lanzado una excepción');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Error al crear la póliza');
        expect(error.getStatus()).toBe(500);
      }
    });
  });

  describe('findAll', () => {
    it('debería devolver pólizas con metadata delegando en findAllWithFilters', async () => {
      const polizas = [{ id: 1 }, { id: 2 }];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([polizas, 2]);

      const [resultado, metadata] = await service.findAll({});

      expect(resultado).toEqual(polizas);
      expect(metadata.total).toBe(2);
      expect(mockPolizaRepository.createQueryBuilder).toHaveBeenCalledWith(
        'poliza',
      );
    });
  });

  describe('findOne', () => {
    it('debería lanzar NotFoundException si la póliza no existe', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    it('debería devolver la póliza cuando existe', async () => {
      const poliza = { id: 1, numero_poliza: 'POL-2026-0001' };
      mockQueryBuilder.getOne.mockResolvedValue(poliza);

      await expect(service.findOne(1)).resolves.toEqual(poliza);
    });

    it('debería aplicar las relaciones pedidas en queryParams.include', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({ id: 1 });

      await service.findOne(1, { include: 'amparos' });

      expect(mockPolizaRepository.createQueryBuilder).toHaveBeenCalledWith(
        'poliza',
      );
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith(
        'poliza.amparos',
        'amparos',
      );
    });

    it('debería envolver un error inesperado del query builder en un InternalServerErrorException sin filtrar el mensaje crudo', async () => {
      mockQueryBuilder.getOne.mockRejectedValue(new Error('conexión perdida'));

      try {
        await service.findOne(1);
        fail('debería haber lanzado una excepción');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Error al buscar la póliza');
        expect(error.getStatus()).toBe(500);
      }
    });
  });

  describe('findAmparos', () => {
    it('debería devolver los amparos asociados a la póliza', async () => {
      const amparos = [
        { id: 1, poliza_id: 1, amparo_id: 1 },
        { id: 2, poliza_id: 1, amparo_id: 2 },
      ];
      mockQueryBuilder.getOne.mockResolvedValue({ id: 1 });
      mockAmparoPolizaRepository.find.mockResolvedValue(amparos);

      const resultado = await service.findAmparos(1);

      expect(resultado).toEqual(amparos);
      expect(mockAmparoPolizaRepository.find).toHaveBeenCalledWith({
        where: { poliza_id: 1 },
        order: { id: 'ASC' },
      });
    });
  });

  describe('update', () => {
    it('no revalida el contrato si contrato_general_id no viene en el DTO', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        fecha_inicio: '2026-01-15',
        fecha_fin: '2026-12-15',
      });
      mockPolizaRepository.update.mockResolvedValue({ affected: 1 });

      await service.update(1, { descripcion: 'Actualizada' });

      expect(mockContratoGeneralRepository.findOne).not.toHaveBeenCalled();
      expect(mockPolizaRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ descripcion: 'Actualizada' }),
      );
    });

    it('debería lanzar NotFoundException si el nuevo contrato_general_id no existe', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        fecha_inicio: '2026-01-15',
        fecha_fin: '2026-12-15',
      });
      mockContratoGeneralRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(1, { contrato_general_id: 99 }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPolizaRepository.update).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si la nueva fecha_fin queda antes de la fecha_inicio existente', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        fecha_inicio: '2026-06-01',
        fecha_fin: '2026-12-15',
      });

      await expect(
        service.update(1, { fecha_fin: '2026-01-01' }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPolizaRepository.update).not.toHaveBeenCalled();
    });

    it('debería permitir actualizar solo fecha_inicio cuando sigue siendo válida contra la fecha_fin existente', async () => {
      mockQueryBuilder.getOne
        .mockResolvedValueOnce({
          id: 1,
          fecha_inicio: '2026-01-15',
          fecha_fin: '2026-12-15',
        })
        .mockResolvedValueOnce({
          id: 1,
          fecha_inicio: '2026-02-01',
          fecha_fin: '2026-12-15',
        });
      mockPolizaRepository.update.mockResolvedValue({ affected: 1 });

      const resultado = await service.update(1, { fecha_inicio: '2026-02-01' });

      expect(mockPolizaRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ fecha_inicio: '2026-02-01' }),
      );
      expect(resultado.fecha_inicio).toBe('2026-02-01');
    });

    it('debería envolver un error inesperado del repositorio al actualizar en un InternalServerErrorException sin filtrar el mensaje crudo', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        fecha_inicio: '2026-01-15',
        fecha_fin: '2026-12-15',
      });
      mockPolizaRepository.update.mockRejectedValue(
        new Error('conexión perdida'),
      );

      try {
        await service.update(1, { descripcion: 'x' });
        fail('debería haber lanzado una excepción');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Error al actualizar la póliza');
        expect(error.getStatus()).toBe(500);
      }
    });
  });

  describe('remove', () => {
    it('debería hacer borrado lógico marcando activo en false', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({ id: 1, activo: true });
      mockPolizaRepository.update.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockPolizaRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ activo: false }),
      );
      expect(mockPolizaRepository.delete).not.toHaveBeenCalled();
      expect(mockPolizaRepository.remove).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si la póliza a eliminar no existe', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(mockPolizaRepository.update).not.toHaveBeenCalled();
    });

    it('debería envolver un error inesperado del repositorio al eliminar en un InternalServerErrorException sin filtrar el mensaje crudo', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({ id: 1, activo: true });
      mockPolizaRepository.update.mockRejectedValue(
        new Error('conexión perdida'),
      );

      try {
        await service.remove(1);
        fail('debería haber lanzado una excepción');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Error al eliminar la póliza');
        expect(error.getStatus()).toBe(500);
      }
    });
  });
});
