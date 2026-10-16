import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { HuellaNavegadorService } from './huella-navegador.service';
import { HuellaNavegador } from './entities/huella-navegador.entity';
import { CreateHuellaNavegadorDto } from './dto/create-huella-navegador.dto';

describe('HuellaNavegadorService', () => {
  let service: HuellaNavegadorService;

  const mockHuellaNavegadorRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const dtoValido: CreateHuellaNavegadorDto = {
    huella: '4f2a9c1e8b7d6a5f3e2d1c0b9a8f7e6d',
    libreria: 'fingerprintjs',
    version_libreria: '5.0.1',
    confianza: 0.4,
    componentes: {
      canvas: { hash: 'a1b2c3d4e5f60718', duracion_ms: 12, error: false },
    },
    direccion_ip: '190.25.0.1',
    user_agent: 'Mozilla/5.0',
    usuario_id: 123,
    usuario_rol: 'ASISTENTE_JURIDICA',
    microcliente: 'gestion_contractual_mf',
    ruta: '/gestion-contractual/consulta-contrato',
    fecha_captura: new Date('2026-10-16T15:00:00.000Z'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HuellaNavegadorService,
        {
          provide: getRepositoryToken(HuellaNavegador),
          useValue: mockHuellaNavegadorRepository,
        },
      ],
    }).compile();

    service = module.get<HuellaNavegadorService>(HuellaNavegadorService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería guardar la huella con la IP vista por el servidor', async () => {
      const creada = { ...dtoValido, direccion_ip_servidor: '10.0.0.8' };
      mockHuellaNavegadorRepository.create.mockReturnValue(creada);
      mockHuellaNavegadorRepository.save.mockResolvedValue({
        id: 1,
        ...creada,
      });

      const resultado = await service.create(dtoValido, '10.0.0.8');

      expect(mockHuellaNavegadorRepository.create).toHaveBeenCalledWith({
        ...dtoValido,
        direccion_ip_servidor: '10.0.0.8',
      });
      expect(mockHuellaNavegadorRepository.save).toHaveBeenCalledWith(creada);
      expect(resultado.id).toBe(1);
      expect(resultado.direccion_ip_servidor).toBe('10.0.0.8');
    });

    it('debería guardar null cuando no se conoce la IP del servidor', async () => {
      mockHuellaNavegadorRepository.create.mockImplementation((v) => v);
      mockHuellaNavegadorRepository.save.mockImplementation(async (v) => v);

      const resultado = await service.create(dtoValido, null);

      expect(resultado.direccion_ip_servidor).toBeNull();
    });
  });

  describe('findOne', () => {
    it('debería devolver la huella cuando existe', async () => {
      const huella = { id: 7, ...dtoValido };
      mockHuellaNavegadorRepository.findOne.mockResolvedValue(huella);

      await expect(service.findOne(7)).resolves.toEqual(huella);
      expect(mockHuellaNavegadorRepository.findOne).toHaveBeenCalledWith({
        where: { id: 7 },
      });
    });

    it('debería lanzar NotFoundException cuando no existe', async () => {
      mockHuellaNavegadorRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });
});
