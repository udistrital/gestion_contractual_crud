import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cdp } from './entities/cdp.entity';
import { CreateCdpDto } from './dto/create-cdp.dto';
import { UpdateCdpDto } from './dto/update-cdp.dto';
import { ContratoGeneral } from '../contrato-general/entities/contrato-general.entity';

@Injectable()
export class CdpService {
  constructor(
    @InjectRepository(Cdp)
    private cdpRepository: Repository<Cdp>,
    @InjectRepository(ContratoGeneral)
    private contratoGeneralRepository: Repository<ContratoGeneral>,
  ) {}

  async create(createCdpDto: CreateCdpDto): Promise<Cdp> {
    const { contrato_general_id, ...cdpData } = createCdpDto;

    const contratoGeneral = await this.contratoGeneralRepository.findOne({
      where: { id: contrato_general_id },
    });

    if (!contratoGeneral) {
      throw new NotFoundException(
        `ContratoGeneral con ID "${contrato_general_id}" no encontrado`,
      );
    }

    const cdp = this.cdpRepository.create({
      ...cdpData,
      contrato_general: contratoGeneral,
      fecha_creacion: new Date(),
      fecha_modificacion: new Date(),
      activo: true,
    });

    return await this.cdpRepository.save(cdp);
  }

  async findAll(): Promise<Cdp[]> {
    const cdps = await this.cdpRepository.find();
    if (!cdps.length) {
      throw new NotFoundException('No se encontraron CDPs');
    }
    return cdps;
  }

  async findOne(id: number): Promise<Cdp> {
    const cdp = await this.cdpRepository.findOne({
      where: { id },
    });
    if (!cdp) {
      throw new NotFoundException(`CDP con ID "${id}" no encontrado`);
    }
    return cdp;
  }

  async update(id: number, updateCdpDto: UpdateCdpDto): Promise<Cdp> {
    const cdp = await this.findOne(id);

    if (updateCdpDto.contrato_general_id) {
      const contratoGeneral = await this.contratoGeneralRepository.findOne({
        where: { id: updateCdpDto.contrato_general_id },
      });
      if (!contratoGeneral) {
        throw new NotFoundException(
          `ContratoGeneral con ID "${updateCdpDto.contrato_general_id}" no encontrado`,
        );
      }
      cdp.contrato_general = contratoGeneral;
      delete updateCdpDto.contrato_general_id;
    }

    Object.assign(cdp, updateCdpDto);
    return await this.cdpRepository.save(cdp);
  }

  async remove(id: number): Promise<void> {
    const result = await this.cdpRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`CDP con ID "${id}" no encontrado`);
    }
  }

  async findByContratoGeneralId(contratoGeneralId: number): Promise<Cdp[]> {
    const cdps = await this.cdpRepository.find({
      where: { contrato_general: { id: contratoGeneralId } },
    });

    if (!cdps.length) {
      throw new NotFoundException(
        `No se encontraron CDPs para el contrato con id "${contratoGeneralId}"`,
      );
    }

    return cdps;
  }
}
