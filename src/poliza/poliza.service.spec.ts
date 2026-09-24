import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
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
    getOne: jest.fn(),
  };

  const mockPolizaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
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
  });
});
