import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CdpService } from './cdp.service';
import { Cdp } from './entities/cdp.entity';
import { ContratoGeneral } from '../contrato-general/entities/contrato-general.entity';

describe('CdpService', () => {
  let service: CdpService;
  let cdpRepository: Repository<Cdp>;
  let contratoGeneralRepository: Repository<ContratoGeneral>;

  const mockCdp = {
    id: 1,
    numero_cdp_id: 1001,
    fecha_registro: new Date('2023-01-15'),
    vigencia_cdp: 2023,
    activo: true,
    fecha_creacion: new Date('2023-01-15T08:00:00'),
    fecha_modificacion: new Date('2023-01-15T08:00:00'),
    contrato_general_id: { id: 1 },
  };

  const mockContratoGeneral = {
    id: 1,
    // ... otros campos del contrato general
  };

  const mockCdpRepository = {
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
        CdpService,
        {
          provide: getRepositoryToken(Cdp),
          useValue: mockCdpRepository,
        },
        {
          provide: getRepositoryToken(ContratoGeneral),
          useValue: mockContratoGeneralRepository,
        },
      ],
    }).compile();

    service = module.get<CdpService>(CdpService);
    cdpRepository = module.get<Repository<Cdp>>(getRepositoryToken(Cdp));
    contratoGeneralRepository = module.get<Repository<ContratoGeneral>>(
      getRepositoryToken(ContratoGeneral),
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCdpDto = {
      numero_cdp_id: 1001,
      fecha_registro: new Date('2023-01-15'),
      vigencia_cdp: 2023,
      contrato_general_id: 1,
      activo: true,
    };

    it('debería crear un CDP exitosamente', async () => {
      mockContratoGeneralRepository.findOne.mockResolvedValue(mockContratoGeneral);
      mockCdpRepository.create.mockReturnValue(mockCdp);
      mockCdpRepository.save.mockResolvedValue(mockCdp);

      const resultado = await service.create(createCdpDto);

      expect(mockContratoGeneralRepository.findOne).toHaveBeenCalledWith({
        where: { id: createCdpDto.contrato_general_id },
      });
      expect(mockCdpRepository.create).toHaveBeenCalled();
      expect(mockCdpRepository.save).toHaveBeenCalled();
      expect(resultado).toEqual(mockCdp);
    });

    it('debería lanzar un error si no se encuentra el contrato general', async () => {
      mockContratoGeneralRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createCdpDto)).rejects.toThrow(
        `ContratoGeneral con ID "${createCdpDto.contrato_general_id}" no encontrado`,
      );
    });
  });

  describe('findAll', () => {
    it('debería devolver un array de CDPs', async () => {
      const mockCdps = [mockCdp];
      mockCdpRepository.find.mockResolvedValue(mockCdps);

      const resultado = await service.findAll();

      expect(mockCdpRepository.find).toHaveBeenCalled();
      expect(resultado).toEqual(mockCdps);
    });
  });

  describe('findOne', () => {
    it('debería devolver un CDP por id', async () => {
      mockCdpRepository.findOne.mockResolvedValue(mockCdp);

      const resultado = await service.findOne(1);

      expect(mockCdpRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(resultado).toEqual(mockCdp);
    });

    it('debería lanzar un error si no se encuentra el CDP', async () => {
      mockCdpRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(
        'CDP con ID "1" no encontrado',
      );
    });
  });

  describe('update', () => {
    const updateCdpDto = {
      activo: false,
      contrato_general_id: 2,
    };

    it('debería actualizar un CDP exitosamente', async () => {
      const cdpActualizado = { ...mockCdp, ...updateCdpDto };
      mockCdpRepository.findOne.mockResolvedValue(mockCdp);
      mockContratoGeneralRepository.findOne.mockResolvedValue({ id: 2 });
      mockCdpRepository.save.mockResolvedValue(cdpActualizado);

      const resultado = await service.update(1, { ...updateCdpDto });

      expect(mockCdpRepository.findOne).toHaveBeenCalled();
      expect(mockContratoGeneralRepository.findOne).toHaveBeenCalled();
      expect(mockCdpRepository.save).toHaveBeenCalled();
      expect(resultado).toEqual(cdpActualizado);
    });

    it('debería lanzar un error si no se encuentra el CDP', async () => {
      mockCdpRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, { ...updateCdpDto })).rejects.toThrow(
        'CDP con ID "1" no encontrado',
      );
    });

    it('debería lanzar un error si no se encuentra el nuevo contrato general', async () => {
      mockCdpRepository.findOne.mockResolvedValue(mockCdp);
      mockContratoGeneralRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, { ...updateCdpDto })).rejects.toThrow(
        'ContratoGeneral con ID "2" no encontrado',
      );
    });
  });

  describe('remove', () => {
    it('debería eliminar un CDP exitosamente', async () => {
      mockCdpRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockCdpRepository.delete).toHaveBeenCalledWith(1);
    });

    it('debería lanzar un error si no se encuentra el CDP a eliminar', async () => {
      mockCdpRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(1)).rejects.toThrow(
        'CDP con ID "1" no encontrado',
      );
    });
  });

  describe('findByContratoGeneralId', () => {
    it('debería devolver CDPs para un id de contrato general dado', async () => {
      const mockCdps = [mockCdp];
      mockCdpRepository.find.mockResolvedValue(mockCdps);

      const resultado = await service.findByContratoGeneralId(1);

      expect(mockCdpRepository.find).toHaveBeenCalledWith({
        where: { contrato_general: { id: 1 } },
      });
      expect(resultado).toEqual(mockCdps);
    });

    it('debería lanzar un error si no se encuentran CDPs para el id de contrato general', async () => {
      mockCdpRepository.find.mockResolvedValue([]);

      await expect(service.findByContratoGeneralId(1)).rejects.toThrow(
        'No se encontraron CDPs para el contrato con id "1"',
      );
    });
  });
});