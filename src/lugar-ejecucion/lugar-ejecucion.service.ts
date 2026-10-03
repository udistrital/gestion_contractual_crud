import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LugarEjecucion } from './entities/lugar-ejecucion.entity';
import { ContratoGeneral } from '../contrato-general/entities/contrato-general.entity';
import { CreateLugarEjecucionDto } from './dto/create-lugar-ejecucion.dto';
import { UpdateLugarEjecucionDto } from './dto/update-lugar-ejecucion.dto';

@Injectable()
export class LugarEjecucionService {
  constructor(
    @InjectRepository(LugarEjecucion)
    private lugarEjecucionRepository: Repository<LugarEjecucion>,
    @InjectRepository(ContratoGeneral)
    private contratoGeneralRepository: Repository<ContratoGeneral>,
  ) {}

  async create(
    createLugarEjecucionDto: CreateLugarEjecucionDto,
  ): Promise<LugarEjecucion> {
    const { contrato_general_id, ...lugarEjecucionData } =
      createLugarEjecucionDto;

    const currentLugarEjecucion = await this.lugarEjecucionRepository.findOne({
      where: {
        contrato_general_id: contrato_general_id,
      },
    });

    if (currentLugarEjecucion) {
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

    const lugarEjecucion =
      this.lugarEjecucionRepository.create(lugarEjecucionData);
    lugarEjecucion.contrato_general = contratoGeneral;
    lugarEjecucion.activo = true;
    lugarEjecucion.fecha_creacion = new Date();
    lugarEjecucion.fecha_modificacion = new Date();

    return await this.lugarEjecucionRepository.save(lugarEjecucion);
  }

  async findAll(): Promise<LugarEjecucion[]> {
    return await this.lugarEjecucionRepository.find({});
  }

  async findOne(id: number): Promise<LugarEjecucion> {
    const lugarEjecucion = await this.lugarEjecucionRepository.findOne({
      where: { id },
    });
    if (!lugarEjecucion) {
      throw new Error(`LugarEjecucion con ID ${id} no encontrado`);
    }
    return lugarEjecucion;
  }

  async update(
    id: number,
    updateLugarEjecucionDto: UpdateLugarEjecucionDto,
  ): Promise<LugarEjecucion> {
    const lugarEjecucion = await this.findOne(id);

    if (updateLugarEjecucionDto.contrato_general_id) {
      const contratoGeneral = await this.contratoGeneralRepository.findOne({
        where: { id: updateLugarEjecucionDto.contrato_general_id },
      });
      if (!contratoGeneral) {
        throw new NotFoundException(
          `ContratoGeneral con ID ${updateLugarEjecucionDto.contrato_general_id} no encontrado`,
        );
      }
      lugarEjecucion.contrato_general = contratoGeneral;
      delete updateLugarEjecucionDto.contrato_general_id;
    }

    Object.assign(lugarEjecucion, updateLugarEjecucionDto);

    return await this.lugarEjecucionRepository.save(lugarEjecucion);
  }

  async remove(id: number): Promise<void> {
    const result = await this.lugarEjecucionRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`LugarEjecucion con ID ${id} no encontrado`);
    }
  }

  async findByContratoGeneralId(
    contratoGeneralId: number,
  ): Promise<LugarEjecucion> {
    const lugarEjecucion = await this.lugarEjecucionRepository.findOne({
      where: { contrato_general: { id: contratoGeneralId } },
    });

    if (!lugarEjecucion) {
      throw new Error(
        `No se encontró ningún Lugar de Ejecución para el contrato con id ${contratoGeneralId}`,
      );
    }

    return lugarEjecucion;
  }
}
