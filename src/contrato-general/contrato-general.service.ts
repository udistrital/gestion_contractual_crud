import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrearContratoGeneralDto } from './dto/crear-contrato-general.dto';
import { ActualizarContratoGeneralDto } from './dto/actualizar-contrato-general.dto';
import { ContratoGeneral } from './entities/contrato-general.entity';
import { ResponseMetadata } from '../utils/response-metadata.interface';
import { BaseCrudService } from '../shared/services/base-crud.service';
import { BaseQueryParamsDto } from '../shared/dto/query-params.base.dto';

@Injectable()
export class ContratoGeneralService extends BaseCrudService<ContratoGeneral> {
  private readonly LOGGER = new Logger(ContratoGeneralService.name);

  constructor(
    @InjectRepository(ContratoGeneral)
    private contratoGeneralRepository: Repository<ContratoGeneral>,
  ) {
    super(contratoGeneralRepository, 'contrato');
  }

  async findAll(
    queryParams: BaseQueryParamsDto,
  ): Promise<[ContratoGeneral[], ResponseMetadata]> {
    return this.findAllWithFilters(queryParams);
  }

  async findOne(
    id: number,
    queryParams?: BaseQueryParamsDto,
  ): Promise<ContratoGeneral> {
    try {
      const queryBuilder = this.contratoGeneralRepository.createQueryBuilder(
        this.alias,
      );

      if (queryParams?.include) {
        this.applyRelations(queryBuilder, queryParams.include);
      }

      queryBuilder.where(`${this.alias}.id = :id`, { id });

      const found = await queryBuilder.getOne();

      if (!found) {
        throw new NotFoundException(
          `ContratoGeneral con ID "${id}" no encontrado`,
        );
      }

      return found;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.LOGGER.error(
        `Error al buscar el contrato general: ${error.message}`,
      );
      throw new Error(`Error al buscar el contrato general: ${error.message}`);
    }
  }

  async create(
    contratoGeneral: CrearContratoGeneralDto,
  ): Promise<ContratoGeneral> {
    try {
      const now = new Date();
      const newContratoGeneral = this.contratoGeneralRepository.create({
        ...contratoGeneral,
        activo: true,
        fecha_creacion: now,
        fecha_modificacion: now,
      });
      return await this.contratoGeneralRepository.save(newContratoGeneral);
    } catch (error) {
      throw new Error(`Error al crear el contrato general: ${error.message}`);
    }
  }

  async update(
    id: number,
    contratoGeneral: ActualizarContratoGeneralDto,
  ): Promise<ContratoGeneral> {
    try {
      await this.findOne(id);
      await this.contratoGeneralRepository.update(id, {
        ...contratoGeneral,
        fecha_modificacion: new Date(),
      });
      return this.findOne(id);
    } catch (error) {
      throw new Error(
        `Error al actualizar el contrato general: ${error.message}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const found = await this.findOne(id);
      if (!found) {
        throw new NotFoundException(
          `ContratoGeneral con ID "${id}" no encontrado`,
        );
      }

      await this.contratoGeneralRepository.update(id, {
        activo: false,
        fecha_modificacion: new Date(),
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Error al eliminar el contrato general: ${error.message}`,
      );
    }
  }

  // Conteo de contratos por unidad ejecutora (obtener consecutivo del contrato)
  async contarConsecutivo(body: any): Promise<number> {
    try {
      const { unidad_ejecutora_id } = body;
      return this.contratoGeneralRepository.count({
        where: { unidad_ejecutora_id },
      });
    } catch (error) {
      throw new Error(
        `Error al realizar el conteo de los contratos: ${error.message}`,
      );
    }
  }

  // Conteo de contratos por unidad ejecutora, vigencia y estado en SUSCRITO (obtener número de contrato)
  async contarNumeroContrato(body: any): Promise<number> {
    try {
      const { unidad_ejecutora_id, vigencia, estado } = body;
      const resultado = await this.contratoGeneralRepository
        .createQueryBuilder('cg')
        .innerJoin('estado_contrato', 'ec', 'ec.contrato_general_id = cg.id')
        .where('cg.unidad_ejecutora_id = :unidad_ejecutora_id', {
          unidad_ejecutora_id,
        })
        .andWhere('cg.vigencia = :vigencia', { vigencia })
        .andWhere('ec.estado_parametro_id = :estado', { estado: estado })
        .select('COUNT(DISTINCT cg.id)', 'total')
        .getRawOne();

      return resultado ? parseInt(resultado?.total) : null;
    } catch (error) {
      throw new Error(
        `Error al realizar el conteo de los contratos: ${error.message}`,
      );
    }
  }

  async findIdsByVigencia(vigencia: string): Promise<number[]> {
    try {
      const result = await this.contratoGeneralRepository
        .createQueryBuilder(this.alias)
        .select(`${this.alias}.id`)
        .where(`${this.alias}.vigencia = :vigencia`, { vigencia })
        .andWhere(`${this.alias}.activo = :activo`, { activo: true })
        .orderBy(`${this.alias}.id`, 'ASC')
        .getMany();

      return result.map((contrato) => contrato.id);
    } catch (error) {
      this.LOGGER.error(`Error al buscar ids por vigencia: ${error.message}`);
      throw new Error(`Error al buscar ids por vigencia: ${error.message}`);
    }
  }
}
