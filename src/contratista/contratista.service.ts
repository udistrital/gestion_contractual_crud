import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contratista } from './entities/contratista.entity';
import { CreateContratistaDto } from './dto/create-contratista.dto';
import { UpdateContratistaDto } from './dto/update-contratista.dto';
import { ContratoGeneral } from '../contrato-general/entities/contrato-general.entity';

@Injectable()
export class ContratistaService {
  constructor(
    @InjectRepository(Contratista)
    private contratistaRepository: Repository<Contratista>,
    @InjectRepository(ContratoGeneral)
    private contratoGeneralRepository: Repository<ContratoGeneral>,
  ) {}

  async create(
    createContratistaDto: CreateContratistaDto,
  ): Promise<Contratista> {
    const { contrato_general_id, ...contratistaData } = createContratistaDto;

    const currentContratista = await this.contratistaRepository.findOne({
      where: {
        contrato_general_id: contrato_general_id,
      },
    });

    if (currentContratista) {
      throw new ConflictException(
        'Ya existe un solicitante con este contrato_general_id',
      );
    }

    const contratoGeneral = await this.contratoGeneralRepository.findOne({
      where: { id: contrato_general_id },
    });

    if (!contratoGeneral) {
      throw new Error(
        `ContratoGeneral con ID "${contrato_general_id}" no encontrado`,
      );
    }

    const contratista = this.contratistaRepository.create(contratistaData);
    contratista.contrato_general = contratoGeneral;
    contratista.activo = true;
    contratista.fecha_creacion = new Date();
    contratista.fecha_modificacion = new Date();

    return await this.contratistaRepository.save(contratista);
  }

  async findAll(): Promise<Contratista[]> {
    return await this.contratistaRepository.find();
  }

  async findOne(id: string): Promise<Contratista> {
    const contratista = await this.contratistaRepository.findOne({
      where: { numero_documento: id },
    });
    if (!contratista) {
      throw new Error(
        `Contratista con numero de documento "${id}" no fue encontrado`,
      );
    }
    return contratista;
  }

  async update(
    id: string,
    updateContratistaDto: UpdateContratistaDto,
  ): Promise<Contratista> {
    const contratista = await this.findOne(id);

    if (updateContratistaDto.contrato_general_id) {
      const contratoGeneral = await this.contratoGeneralRepository.findOne({
        where: { id: updateContratistaDto.contrato_general_id },
      });
      if (!contratoGeneral) {
        throw new Error(
          `ContratoGeneral con ID "${updateContratistaDto.contrato_general_id}" no encontrado`,
        );
      }
      contratista.contrato_general = contratoGeneral;
      delete updateContratistaDto.contrato_general_id;
    }

    Object.assign(contratista, updateContratistaDto);
    return await this.contratistaRepository.save(contratista);
  }

  async remove(id: string): Promise<void> {
    const result = await this.contratistaRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`Contratista con ID "${id}" no encontrado`);
    }
  }

  async findByContratoGeneralId(
    contratoGeneralId: number,
  ): Promise<Contratista> {
    const contratista = await this.contratistaRepository.findOne({
      where: { contrato_general: { id: contratoGeneralId } },
    });

    if (!contratista) {
      throw new Error(
        `No se encontró un contratista para el contrato con id "${contratoGeneralId}"`,
      );
    }

    return contratista;
  }
}
