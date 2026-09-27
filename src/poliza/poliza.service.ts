import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poliza } from './entities/poliza.entity';
import { AmparoPoliza } from '../amparo-poliza/entities/amparo-poliza.entity';
import { ContratoGeneral } from '../contrato-general/entities/contrato-general.entity';
import { CrearPolizaDto } from './dto/crear-poliza.dto';
import { ActualizarPolizaDto } from './dto/actualizar-poliza.dto';
import { BaseCrudService } from '../shared/services/base-crud.service';
import { BaseQueryParamsDto } from '../shared/dto/query-params.base.dto';
import { ResponseMetadata } from '../utils/response-metadata.interface';

@Injectable()
export class PolizaService extends BaseCrudService<Poliza> {
  private readonly LOGGER = new Logger(PolizaService.name);

  constructor(
    @InjectRepository(Poliza)
    private polizaRepository: Repository<Poliza>,
    @InjectRepository(AmparoPoliza)
    private amparoPolizaRepository: Repository<AmparoPoliza>,
    @InjectRepository(ContratoGeneral)
    private contratoGeneralRepository: Repository<ContratoGeneral>,
  ) {
    super(polizaRepository, 'poliza');
  }

  async findAll(
    queryParams: BaseQueryParamsDto,
  ): Promise<[Poliza[], ResponseMetadata]> {
    return this.findAllWithFilters(queryParams);
  }

  async findOne(id: number, queryParams?: BaseQueryParamsDto): Promise<Poliza> {
    try {
      const queryBuilder = this.polizaRepository.createQueryBuilder(this.alias);

      if (queryParams?.include) {
        this.applyRelations(queryBuilder, queryParams.include);
      }

      queryBuilder.where(`${this.alias}.id = :id`, { id });

      const found = await queryBuilder.getOne();

      if (!found) {
        throw new NotFoundException(`Poliza con ID "${id}" no encontrada`);
      }

      return found;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.LOGGER.error(`Error al buscar la póliza: ${error.message}`);
      throw new Error(`Error al buscar la póliza: ${error.message}`);
    }
  }

  async findAmparos(id: number): Promise<AmparoPoliza[]> {
    await this.findOne(id);
    return this.amparoPolizaRepository.find({
      where: { poliza_id: id },
      order: { id: 'ASC' },
    });
  }

  async create(poliza: CrearPolizaDto): Promise<Poliza> {
    await this.validarContrato(poliza.contrato_general_id);
    this.validarFechas(poliza.fecha_inicio, poliza.fecha_fin);

    try {
      const now = new Date();
      const nuevaPoliza = this.polizaRepository.create({
        ...poliza,
        activo: poliza.activo ?? true,
        fecha_creacion: now,
        fecha_modificacion: now,
      });
      return await this.polizaRepository.save(nuevaPoliza);
    } catch (error) {
      throw new Error(`Error al crear la póliza: ${error.message}`);
    }
  }

  async update(id: number, poliza: ActualizarPolizaDto): Promise<Poliza> {
    const actual = await this.findOne(id);

    if (poliza.contrato_general_id) {
      await this.validarContrato(poliza.contrato_general_id);
    }

    this.validarFechas(
      poliza.fecha_inicio ?? (actual.fecha_inicio as unknown as string),
      poliza.fecha_fin ?? (actual.fecha_fin as unknown as string),
    );

    try {
      await this.polizaRepository.update(id, {
        ...poliza,
        fecha_modificacion: new Date(),
      });
      return this.findOne(id);
    } catch (error) {
      throw new Error(`Error al actualizar la póliza: ${error.message}`);
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    try {
      await this.polizaRepository.update(id, {
        activo: false,
        fecha_modificacion: new Date(),
      });
    } catch (error) {
      throw new Error(`Error al eliminar la póliza: ${error.message}`);
    }
  }

  private async validarContrato(contratoGeneralId: number): Promise<void> {
    const contrato = await this.contratoGeneralRepository.findOne({
      where: { id: contratoGeneralId },
      select: ['id'],
    });

    if (!contrato) {
      throw new NotFoundException(
        `ContratoGeneral con ID "${contratoGeneralId}" no encontrado`,
      );
    }
  }

  private validarFechas(fechaInicio?: string, fechaFin?: string): void {
    if (!fechaInicio || !fechaFin) {
      return;
    }

    if (new Date(fechaInicio) >= new Date(fechaFin)) {
      throw new BadRequestException(
        'La fecha de inicio debe ser menor a la fecha de fin',
      );
    }
  }
}
