import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HuellaNavegador } from './entities/huella-navegador.entity';
import { CreateHuellaNavegadorDto } from './dto/create-huella-navegador.dto';
import { BaseQueryParamsDto } from '../shared/dto/query-params.base.dto';
import { ResponseMetadata } from '../utils/response-metadata.interface';
import { BaseCrudService } from '../shared/services/base-crud.service';

@Injectable()
export class HuellaNavegadorService extends BaseCrudService<HuellaNavegador> {
  constructor(
    @InjectRepository(HuellaNavegador)
    private huellaNavegadorRepository: Repository<HuellaNavegador>,
  ) {
    super(huellaNavegadorRepository);
  }

  async create(
    createHuellaNavegadorDto: CreateHuellaNavegadorDto,
    direccionIpServidor: string | null,
  ): Promise<HuellaNavegador> {
    const huella = this.huellaNavegadorRepository.create({
      ...createHuellaNavegadorDto,
      direccion_ip_servidor: direccionIpServidor,
    });
    return await this.huellaNavegadorRepository.save(huella);
  }

  async findAll(
    queryParams: BaseQueryParamsDto,
  ): Promise<[HuellaNavegador[], ResponseMetadata]> {
    return this.findAllWithFilters(queryParams);
  }

  async findOne(id: number): Promise<HuellaNavegador> {
    const huella = await this.huellaNavegadorRepository.findOne({
      where: { id },
    });
    if (!huella) {
      throw new NotFoundException(`HuellaNavegador con ID ${id} no encontrada`);
    }
    return huella;
  }
}
