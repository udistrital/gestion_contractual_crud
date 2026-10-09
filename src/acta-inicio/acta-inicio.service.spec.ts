import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActaInicioService } from './acta-inicio.service';
import { CrearActaInicioDto } from './dto/crear-acta-inicio.dto';
import { ActualizarActaInicioDto } from './dto/actualizar-acta-inicio.dto';
import { ActaInicio } from './entities/acta-inicio-entity';
import { ContratoGeneral } from '../contrato-general/entities/contrato-general.entity';

describe('ActaInicioService', () => {
  let service: ActaInicioService;
  let repository: Repository<ActaInicio>;

  const mockQueryBuilder: any = {
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockRepository = {
    metadata: { columns: [], relations: [] },
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    create: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockContratoGeneralRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActaInicioService,
        {
          provide: getRepositoryToken(ActaInicio),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ContratoGeneral),
          useValue: mockContratoGeneralRepository,
        },
      ],
    }).compile();

    service = module.get<ActaInicioService>(ActaInicioService);
    repository = module.get<Repository<ActaInicio>>(
      getRepositoryToken(ActaInicio),
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debería devolver un array de actas de inicio', async () => {
      const result = [{ id: 1 }, { id: 2 }];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([result, 2]);

      const [data, metadata] = await service.findAll({});

      expect(data).toBe(result);
      expect(metadata.total).toBe(2);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debería devolver un acta de inicio por id', async () => {
      const result = { id: 1 };
      mockRepository.findOne.mockResolvedValue(result);

      expect(await service.findOne(1)).toBe(result);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('create', () => {
    it('debería crear un nuevo acta de inicio', async () => {
      const dto: CrearActaInicioDto = {
        usuario_id: 1,
        usuario_legado: 'usuario_legado',
        descripcion: 'Acta inicial de prueba',
        fecha_inicio: '2023-10-24',
        fecha_fin: '2023-11-24',
        contrato_general_id: 1,
        activo: true,
      };
      const result = {
        id: 1,
        ...dto,
        fecha_creacion: new Date(),
        fecha_modificacion: new Date(),
      };
      const entity = { ...dto };
      mockContratoGeneralRepository.findOne.mockResolvedValue({ id: 1 });
      mockRepository.create.mockReturnValue(entity);
      mockRepository.save.mockResolvedValue(result);

      expect(await service.create(dto)).toBe(result);
      expect(mockContratoGeneralRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.contrato_general_id },
        select: ['id'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(entity);
    });

    it('debería lanzar un error si el contrato general no existe', async () => {
      mockContratoGeneralRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          usuario_id: 1,
          usuario_legado: 'usuario_legado',
          descripcion: 'Acta inicial de prueba',
          fecha_inicio: '2023-10-24',
          fecha_fin: '2023-11-24',
          contrato_general_id: 99,
          activo: true,
        }),
      ).rejects.toThrow('ContratoGeneral con ID "99" no encontrado');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('debería actualizar un acta de inicio', async () => {
      const id = 1;
      const dto: ActualizarActaInicioDto = {
        usuario_id: 1,
        usuario_legado: 'user prueba',
        descripcion: 'Acta modificada',
        fecha_inicio: '2023-10-24',
        fecha_fin: '2023-11-24',
        activo: false,
      };
      mockRepository.findOne.mockResolvedValue({ id });
      mockRepository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.update(id, dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(
        expect.objectContaining({
          id,
          usuario_id: dto.usuario_id,
          usuario_legado: dto.usuario_legado,
          descripcion: dto.descripcion,
          activo: false,
          fecha_inicio: new Date(dto.fecha_inicio),
          fecha_fin: new Date(dto.fecha_fin),
        }),
      );
    });
  });

  describe('remove', () => {
    it('debería marcar como inactivo un acta de inicio', async () => {
      const id = 1;
      const mockActa = { id, activo: true };
      mockRepository.findOne.mockResolvedValue(mockActa);
      mockRepository.save.mockImplementation((entity) => Promise.resolve(entity));

      await service.remove(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id,
          activo: false,
          fecha_modificacion: expect.any(Date),
        }),
      );
    });

    it('debería lanzar un error si el acta de inicio no se encuentra', async () => {
      const id = 1;
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(
        `ActaInicio con ID "${id}" no encontrada`,
      );
    });
  });
});
