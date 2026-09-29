import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContratistaService } from './contratista.service';
import { Contratista } from './entities/contratista.entity';
import { ContratoGeneral } from '../contrato-general/entities/contrato-general.entity';
import { CreateContratistaDto } from './dto/create-contratista.dto';
import { UpdateContratistaDto } from './dto/update-contratista.dto';

describe('ContratistaService', () => {
  let service: ContratistaService;
  let contratistaRepository: Repository<Contratista>;
  let contratoGeneralRepository: Repository<ContratoGeneral>;

  const mockContratistaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockContratoGeneralRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContratistaService,
        {
          provide: getRepositoryToken(Contratista),
          useValue: mockContratistaRepository,
        },
        {
          provide: getRepositoryToken(ContratoGeneral),
          useValue: mockContratoGeneralRepository,
        },
      ],
    }).compile();

    service = module.get<ContratistaService>(ContratistaService);
    contratistaRepository = module.get<Repository<Contratista>>(
      getRepositoryToken(Contratista),
    );
    contratoGeneralRepository = module.get<Repository<ContratoGeneral>>(
      getRepositoryToken(ContratoGeneral),
    );
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear un nuevo contratista', async () => {
      const createDto: CreateContratistaDto = {
        numero_documento: '123',
        tipo_persona_id: 1,
        clase_contratista_id: 1,
        contrato_general_id: 1,
      };
      const contratoGeneral = { id: 1 };
      const createdContratista = {
        id: '1',
        ...createDto,
        contrato_general_id: contratoGeneral,
      };

      mockContratistaRepository.findOne.mockResolvedValue(null);
      mockContratoGeneralRepository.findOne.mockResolvedValue(contratoGeneral);
      mockContratistaRepository.create.mockReturnValue(createdContratista);
      mockContratistaRepository.save.mockResolvedValue(createdContratista);

      const result = await service.create(createDto);

      expect(result).toEqual(createdContratista);
      expect(mockContratoGeneralRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockContratistaRepository.findOne).toHaveBeenCalledWith({
        where: { contrato_general_id: 1 },
      });
      expect(mockContratistaRepository.create).toHaveBeenCalledWith({
        numero_documento: '123',
        tipo_persona_id: 1,
        clase_contratista_id: 1,
      });
      expect(mockContratistaRepository.save).toHaveBeenCalledWith(
        createdContratista,
      );
    });

    it('debería lanzar un error si no se encuentra el ContratoGeneral', async () => {
      const createDto: CreateContratistaDto = {
        numero_documento: '123',
        tipo_persona_id: 1,
        clase_contratista_id: 1,
        contrato_general_id: 1,
      };

      mockContratistaRepository.findOne.mockResolvedValue(null);
      mockContratoGeneralRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        'ContratoGeneral con ID "1" no encontrado',
      );
    });

    it('debería lanzar ConflictException si ya existe un contratista para el contrato', async () => {
      const createDto: CreateContratistaDto = {
        numero_documento: '123',
        tipo_persona_id: 1,
        clase_contratista_id: 1,
        contrato_general_id: 1,
      };
      mockContratistaRepository.findOne.mockResolvedValue({ id: 1 });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockContratistaRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debería devolver un array de contratistas', async () => {
      const contratistas = [
        { id: '1', nombre: 'Contratista 1' },
        { id: '2', nombre: 'Contratista 2' },
      ];
      mockContratistaRepository.find.mockResolvedValue(contratistas);

      const result = await service.findAll();

      expect(result).toEqual(contratistas);
      expect(mockContratistaRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debería devolver un contratista por número de documento', async () => {
      const contratista = { numero_documento: '123', nombre: 'Contratista 1' };
      mockContratistaRepository.findOne.mockResolvedValue(contratista);

      const result = await service.findOne('123');

      expect(result).toEqual(contratista);
      expect(mockContratistaRepository.findOne).toHaveBeenCalledWith({
        where: { numero_documento: '123' },
      });
    });

    it('debería lanzar un error si no se encuentra el contratista', async () => {
      mockContratistaRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('123')).rejects.toThrow(
        'Contratista con numero de documento "123" no fue encontrado',
      );
    });
  });

  describe('update', () => {
    it('debería actualizar un contratista', async () => {
      const updateDto: UpdateContratistaDto = {
        tipo_persona_id: 2,
      };
      const existingContratista = {
        numero_documento: '123',
        nombre: 'Contratista Original',
      };
      const updatedContratista = { ...existingContratista, ...updateDto };

      mockContratistaRepository.findOne.mockResolvedValue(existingContratista);
      mockContratistaRepository.save.mockResolvedValue(updatedContratista);

      const result = await service.update('123', updateDto);

      expect(result).toEqual(updatedContratista);
      expect(mockContratistaRepository.findOne).toHaveBeenCalledWith({
        where: { numero_documento: '123' },
      });
      expect(mockContratistaRepository.save).toHaveBeenCalledWith(
        updatedContratista,
      );
    });

    it('debería actualizar el ContratoGeneral si se proporciona', async () => {
      const updateDto: UpdateContratistaDto = {
        contrato_general_id: 2,
      };
      const existingContratista = {
        numero_documento: '123',
        nombre: 'Contratista Original',
        contrato_general_id: { id: 1 },
      };
      const newContratoGeneral = { id: 2 };
      const updatedContratista = {
        ...existingContratista,
        contrato_general_id: newContratoGeneral,
      };

      mockContratistaRepository.findOne.mockResolvedValue(existingContratista);
      mockContratoGeneralRepository.findOne.mockResolvedValue(
        newContratoGeneral,
      );
      mockContratistaRepository.save.mockResolvedValue(updatedContratista);

      const result = await service.update('123', updateDto);

      expect(result).toEqual(updatedContratista);
      expect(mockContratoGeneralRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
      });
    });

    it('debería lanzar un error si no se encuentra el ContratoGeneral al actualizar', async () => {
      const updateDto: UpdateContratistaDto = { contrato_general_id: 2 };
      const existingContratista = {
        numero_documento: '123',
        nombre: 'Contratista Original',
        contrato_general_id: { id: 1 },
      };

      mockContratistaRepository.findOne.mockResolvedValue(existingContratista);
      mockContratoGeneralRepository.findOne.mockResolvedValue(null);

      await expect(service.update('123', updateDto)).rejects.toThrow(
        'ContratoGeneral con ID "2" no encontrado',
      );
    });
  });

  describe('remove', () => {
    it('debería eliminar un contratista', async () => {
      mockContratistaRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('123');

      expect(mockContratistaRepository.delete).toHaveBeenCalledWith('123');
    });

    it('debería lanzar un error si no se encuentra el contratista a eliminar', async () => {
      mockContratistaRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('123')).rejects.toThrow(
        'Contratista con ID "123" no encontrado',
      );
    });
  });

  describe('findByContratoGeneralId', () => {
    it('debería encontrar un contratista por el id del contrato general', async () => {
      const contratista = {
        id: '1',
        nombre: 'Contratista 1',
        contrato_general_id: { id: 1 },
      };
      mockContratistaRepository.findOne.mockResolvedValue(contratista);

      const result = await service.findByContratoGeneralId(1);

      expect(result).toEqual(contratista);
      expect(mockContratistaRepository.findOne).toHaveBeenCalledWith({
        where: { contrato_general: { id: 1 } },
      });
    });

    it('debería lanzar un error si no se encuentra el contratista para el contrato general', async () => {
      mockContratistaRepository.findOne.mockResolvedValue(null);

      await expect(service.findByContratoGeneralId(1)).rejects.toThrow(
        'No se encontró un contratista para el contrato con id "1"',
      );
    });
  });
});
