import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmparoPoliza } from './entities/amparo-poliza.entity';
import { Poliza } from '../poliza/entities/poliza.entity';
import { ContratoGeneral } from '../contrato-general/entities/contrato-general.entity';
import { CrearAmparoPolizaDto } from './dto/crear-amparo-poliza.dto';
import { ActualizarAmparoPolizaDto } from './dto/actualizar-amparo-poliza.dto';
import { BaseCrudService } from '../shared/services/base-crud.service';
import { BaseQueryParamsDto } from '../shared/dto/query-params.base.dto';
import { ResponseMetadata } from '../utils/response-metadata.interface';

export interface ResultadoCreacionAmparos {
  creados: AmparoPoliza[];
  errores: { amparo: CrearAmparoPolizaDto; error: string }[];
}

@Injectable()
export class AmparoPolizaService extends BaseCrudService<AmparoPoliza> {
  private readonly LOGGER = new Logger(AmparoPolizaService.name);

  constructor(
    @InjectRepository(AmparoPoliza)
    private amparoPolizaRepository: Repository<AmparoPoliza>,
    @InjectRepository(Poliza)
    private polizaRepository: Repository<Poliza>,
    @InjectRepository(ContratoGeneral)
    private contratoGeneralRepository: Repository<ContratoGeneral>,
  ) {
    super(amparoPolizaRepository, 'amparo');
  }

  async findAll(
    queryParams: BaseQueryParamsDto,
  ): Promise<[AmparoPoliza[], ResponseMetadata]> {
    return this.findAllWithFilters(queryParams);
  }

  async findOne(
    id: number,
    queryParams?: BaseQueryParamsDto,
  ): Promise<AmparoPoliza> {
    try {
      const queryBuilder = this.amparoPolizaRepository.createQueryBuilder(
        this.alias,
      );

      if (queryParams?.include) {
        this.applyRelations(queryBuilder, queryParams.include);
      }

      queryBuilder.where(`${this.alias}.id = :id`, { id });

      const found = await queryBuilder.getOne();

      if (!found) {
        throw new NotFoundException(
          `AmparoPoliza con ID "${id}" no encontrado`,
        );
      }

      return found;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.LOGGER.error(`Error al buscar el amparo: ${error.message}`);
      throw new Error(`Error al buscar el amparo: ${error.message}`);
    }
  }

  /**
   * Crea los amparos recibidos de forma parcial: los válidos se persisten y los
   * que fallan se devuelven con el motivo, sin interrumpir el resto del lote.
   */
  async createMultiple(
    amparos: CrearAmparoPolizaDto[],
  ): Promise<ResultadoCreacionAmparos> {
    const creados: AmparoPoliza[] = [];
    const errores: { amparo: CrearAmparoPolizaDto; error: string }[] = [];

    for (const amparo of amparos) {
      try {
        await this.validarContrato(amparo.contrato_general_id);
        await this.validarPoliza(amparo.poliza_id, amparo.contrato_general_id);
        this.validarFechas(amparo.fecha_inicio, amparo.fecha_fin);

        const now = new Date();
        const nuevoAmparo = this.amparoPolizaRepository.create({
          ...amparo,
          activo: amparo.activo ?? true,
          fecha_creacion: now,
          fecha_modificacion: now,
        });

        creados.push(await this.amparoPolizaRepository.save(nuevoAmparo));
      } catch (error) {
        errores.push({ amparo, error: error.message });
      }
    }

    return { creados, errores };
  }

  async update(
    id: number,
    amparo: ActualizarAmparoPolizaDto,
  ): Promise<AmparoPoliza> {
    const actual = await this.findOne(id);
    const contratoGeneralId =
      amparo.contrato_general_id ?? actual.contrato_general_id;

    if (amparo.contrato_general_id) {
      await this.validarContrato(amparo.contrato_general_id);
    }

    if (amparo.poliza_id !== undefined) {
      await this.validarPoliza(amparo.poliza_id, contratoGeneralId);
    }

    this.validarFechas(
      amparo.fecha_inicio ?? (actual.fecha_inicio as unknown as string),
      amparo.fecha_fin ?? (actual.fecha_fin as unknown as string),
    );

    try {
      await this.amparoPolizaRepository.update(id, {
        ...amparo,
        fecha_modificacion: new Date(),
      });
      return this.findOne(id);
    } catch (error) {
      throw new Error(`Error al actualizar el amparo: ${error.message}`);
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    try {
      await this.amparoPolizaRepository.update(id, {
        activo: false,
        fecha_modificacion: new Date(),
      });
    } catch (error) {
      throw new Error(`Error al eliminar el amparo: ${error.message}`);
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

  /**
   * La póliza y el amparo deben pertenecer al mismo contrato: el amparo se
   * registra con la minuta y la póliza se asocia después, por lo que la
   * coherencia entre ambos contratos se valida en el momento de la asociación.
   */
  private async validarPoliza(
    polizaId: number | null | undefined,
    contratoGeneralId: number,
  ): Promise<void> {
    if (polizaId === null || polizaId === undefined) {
      return;
    }

    const poliza = await this.polizaRepository.findOne({
      where: { id: polizaId },
      select: ['id', 'contrato_general_id'],
    });

    if (!poliza) {
      throw new NotFoundException(`Poliza con ID "${polizaId}" no encontrada`);
    }

    if (poliza.contrato_general_id !== contratoGeneralId) {
      throw new BadRequestException(
        `La póliza con ID "${polizaId}" pertenece al contrato "${poliza.contrato_general_id}" y no al contrato "${contratoGeneralId}" del amparo`,
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
