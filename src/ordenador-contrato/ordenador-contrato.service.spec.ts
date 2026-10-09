import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdenadorContratoService } from './ordenador-contrato.service';
import { OrdenadorContrato } from './entities/ordenador-contrato.entity';
import { ContratoGeneral } from '../contrato-general/entities/contrato-general.entity';

describe('OrdenadorContratoService', () => {
  let service: OrdenadorContratoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdenadorContratoService,
        { provide: getRepositoryToken(OrdenadorContrato), useValue: {} },
        { provide: getRepositoryToken(ContratoGeneral), useValue: {} },
      ],
    }).compile();

    service = module.get<OrdenadorContratoService>(OrdenadorContratoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
