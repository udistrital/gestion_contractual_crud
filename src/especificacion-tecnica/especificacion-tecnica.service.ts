import { Injectable, NotFoundException } from '@nestjs/common';
import { CrearEspecificacionTecnicaDto } from './dto/crear-especificacion-tecnica.dto';
import { EspecificacionTecnica } from './entities/especificacion-tecnica.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ActualizarEspecificacionTecnicaDto } from './dto/actualizar-especificacion-tecnica';
import { BaseQueryParamsDto } from 'src/shared/dto/query-params.base.dto';
import { ResponseMetadata } from 'src/utils/response-metadata.interface';
import { BaseCrudService } from '../shared/services/base-crud.service';

@Injectable()
export class EspecificacionTecnicaService extends BaseCrudService<EspecificacionTecnica> {
  constructor(
    @InjectRepository(EspecificacionTecnica)
    private especificacionTecnicaRepository: Repository<EspecificacionTecnica>,
  ) {
    super(especificacionTecnicaRepository);
  }

  async findAll(
    queryParams: BaseQueryParamsDto,
  ): Promise<[EspecificacionTecnica[], ResponseMetadata]> {
    return this.findAllWithFilters(queryParams);
  }

  async findOne(id: number): Promise<EspecificacionTecnica> {
    const especificacion = await this.especificacionTecnicaRepository.findOne({
      where: { id },
    });
    if (!especificacion) {
      throw new NotFoundException(
        `EspecificacionTecnica con ID "${id}" no encontrada`,
      );
    }
    return especificacion;
  }

  async create(
    especificacionTecnicaDto: CrearEspecificacionTecnicaDto,
  ): Promise<EspecificacionTecnica> {
    especificacionTecnicaDto.activo = true;
    especificacionTecnicaDto.fecha_creacion = new Date();
    especificacionTecnicaDto.fecha_modificacion = new Date();
    const especificacion = this.especificacionTecnicaRepository.create(
      especificacionTecnicaDto,
    );
    return this.especificacionTecnicaRepository.save(especificacion);
  }

  async update(
    id: number,
    especificacionTecnicaDto: ActualizarEspecificacionTecnicaDto,
  ): Promise<EspecificacionTecnica> {
    await this.especificacionTecnicaRepository.update(
      id,
      especificacionTecnicaDto,
    );
    return this.findOne(id);
  }

  async remove(id: number): Promise<EspecificacionTecnica> {
    const especificacion = await this.findOne(id);

    if (!especificacion) {
      throw new NotFoundException(
        `EspecificacionTecnica con ID "${id}" no encontrada`,
      );
    }

    especificacion.activo = false;
    especificacion.fecha_modificacion = new Date();

    return this.especificacionTecnicaRepository.save(especificacion);
  }
}
