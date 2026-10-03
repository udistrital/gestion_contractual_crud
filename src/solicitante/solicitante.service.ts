import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContratoGeneral } from '../contrato-general/entities/contrato-general.entity';
import { CreateSolicitanteDto } from './dto/create-solicitante.dto';
import { UpdateSolicitanteDto } from './dto/update-solicitante.dto';
import { SolicitanteEntity } from './entities/solicitante.entity';

@Injectable()
export class SolicitanteService {
  constructor(
    @InjectRepository(SolicitanteEntity)
    private solicitanteEntityRepository: Repository<SolicitanteEntity>,
    @InjectRepository(ContratoGeneral)
    private contratoGeneralRepository: Repository<ContratoGeneral>,
  ) {}

  async create(
    crearSolicitanteDto: CreateSolicitanteDto,
  ): Promise<SolicitanteEntity> {
    const { contrato_general_id, ...lugarEjecucionData } = crearSolicitanteDto;

    const currentSolicitante = await this.solicitanteEntityRepository.findOne({
      where: {
        contrato_general_id: contrato_general_id,
      },
    });

    if (currentSolicitante) {
      throw new ConflictException(
        'Ya existe un solicitante con este contrato_general_id',
      );
    }

    const contratoGeneral = await this.contratoGeneralRepository.findOne({
      where: { id: contrato_general_id },
    });

    if (!contratoGeneral) {
      throw new NotFoundException(
        `ContratoGeneral con ID ${contrato_general_id} no encontrado`,
      );
    }

    const solicitante =
      this.solicitanteEntityRepository.create(lugarEjecucionData);
    solicitante.contrato_general = contratoGeneral;
    solicitante.activo = true;
    solicitante.fecha_creacion = new Date();
    solicitante.fecha_modificacion = new Date();

    return await this.solicitanteEntityRepository.save(solicitante);
  }

  async findAll(): Promise<SolicitanteEntity[]> {
    return await this.solicitanteEntityRepository.find({});
  }

  async findOne(id: number): Promise<SolicitanteEntity> {
    const solicitante = await this.solicitanteEntityRepository.findOne({
      where: { id },
    });
    if (!solicitante) {
      throw new Error(`Solicitante con ID ${id} no encontrado`);
    }
    return solicitante;
  }

  async update(
    id: number,
    updateSolicitanteDto: UpdateSolicitanteDto,
  ): Promise<SolicitanteEntity> {
    const solicitante = await this.findOne(id);

    if (!solicitante) {
      throw new NotFoundException(`Solicitante con ID ${id} no encontrado`);
    }

    if (updateSolicitanteDto.contrato_general_id) {
      const contratoGeneral = await this.contratoGeneralRepository.findOne({
        where: { id: updateSolicitanteDto.contrato_general_id },
      });
      if (!contratoGeneral) {
        throw new NotFoundException(
          `ContratoGeneral con ID ${updateSolicitanteDto.contrato_general_id} no encontrado`,
        );
      }
      solicitante.contrato_general = contratoGeneral;
      delete updateSolicitanteDto.contrato_general_id;
    }

    Object.assign(solicitante, updateSolicitanteDto);

    return await this.solicitanteEntityRepository.save(solicitante);
  }

  async remove(id: number): Promise<void> {
    const result = await this.solicitanteEntityRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`Solicitante con ID ${id} no encontrado`);
    }
  }

  async findByContratoGeneralId(
    contratoGeneralId: number,
  ): Promise<SolicitanteEntity> {
    const solicitante = await this.solicitanteEntityRepository.findOne({
      where: { contrato_general: { id: contratoGeneralId } },
    });

    if (!solicitante) {
      throw new Error(
        `No se encontró ningún Soliciaten para el contrato con id ${contratoGeneralId}`,
      );
    }

    return solicitante;
  }
}
