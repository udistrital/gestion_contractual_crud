import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrdenadorContratoDto } from './dto/create-ordenador-contrato.dto';
import { UpdateOrdenadorContratoDto } from './dto/update-ordenador-contrato.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrdenadorContrato } from './entities/ordenador-contrato.entity';
import { Repository } from 'typeorm';
import { ContratoGeneral } from 'src/contrato-general/entities/contrato-general.entity';

@Injectable()
export class OrdenadorContratoService {
  constructor(
    @InjectRepository(OrdenadorContrato)
    private readonly ordenadorRepository: Repository<OrdenadorContrato>,
    @InjectRepository(ContratoGeneral)
    private readonly contratoGeneralRepository: Repository<ContratoGeneral>,
  ) {}

  async findAll(): Promise<OrdenadorContrato[]> {
    return this.ordenadorRepository.find();
  }

  async findOne(id: number): Promise<OrdenadorContrato> {
    const found = await this.ordenadorRepository.findOne({
      where: { id },
    });
    if (!found) {
      throw new NotFoundException(`Ordenador con ID "${id}" no encontrado`);
    }
    return found;
  }

  async create(
    createOrdenadorContratoDto: CreateOrdenadorContratoDto,
  ): Promise<OrdenadorContrato> {
    const contratoExiste = await this.contratoGeneralRepository.findOne({
      where: { id: createOrdenadorContratoDto.contrato_general_id },
      select: ['id'],
    });
    if (!contratoExiste) {
      throw new NotFoundException(
        `ContratoGeneral con ID "${createOrdenadorContratoDto.contrato_general_id}" no encontrado`,
      );
    }

    const found = await this.ordenadorRepository.findOne({
      where: {
        contrato_general_id: createOrdenadorContratoDto.contrato_general_id,
      },
    });

    const newOrdenador = this.ordenadorRepository.create({
      tercero_id: createOrdenadorContratoDto.tercero_id,
      ordenador_argo_id: createOrdenadorContratoDto.ordenador_argo_id,
      ordenador_sicapital_id: createOrdenadorContratoDto.ordenador_sicapital_id,
      resolucion: createOrdenadorContratoDto.resolucion,
      documento_identidad: createOrdenadorContratoDto.documento_identidad,
      cargo_id: createOrdenadorContratoDto.cargo_id,
      contrato_general_id: createOrdenadorContratoDto.contrato_general_id,
      activo: createOrdenadorContratoDto.activo ?? true,
      fecha_creacion: new Date(),
      fecha_modificacion: new Date(),
    });

    if (found) {
      await this.ordenadorRepository.update(found.id, newOrdenador);
      return await this.ordenadorRepository.findOne({
        where: { id: found.id },
      });
    } else {
      return await this.ordenadorRepository.save(newOrdenador);
    }
  }

  async update(
    id: number,
    updateOrdenadorContratoDto: UpdateOrdenadorContratoDto,
  ): Promise<OrdenadorContrato> {
    const ordenador = await this.ordenadorRepository.findOne({
      where: { id },
    });
    if (!ordenador) {
      throw new NotFoundException(`Ordenador con ID "${id}" no encontrado`);
    }

    ordenador.tercero_id = updateOrdenadorContratoDto.tercero_id;
    ordenador.ordenador_argo_id = updateOrdenadorContratoDto.ordenador_argo_id;
    ordenador.ordenador_sicapital_id =
      updateOrdenadorContratoDto.ordenador_sicapital_id;
    ordenador.resolucion = updateOrdenadorContratoDto.resolucion;
    ordenador.documento_identidad =
      updateOrdenadorContratoDto.documento_identidad;
    ordenador.cargo_id = updateOrdenadorContratoDto.cargo_id;
    ordenador.contrato_general_id =
      updateOrdenadorContratoDto.contrato_general_id;
    ordenador.activo = updateOrdenadorContratoDto.activo;
    ordenador.fecha_modificacion = new Date();

    return await this.ordenadorRepository.save(ordenador);
  }

  async remove(id: number): Promise<OrdenadorContrato> {
    const ordenador = await this.ordenadorRepository.findOne({
      where: { id },
    });
    if (!ordenador) {
      throw new NotFoundException(`Ordenador con ID "${id}" no encontrada`);
    }

    ordenador.activo = false;
    ordenador.fecha_modificacion = new Date();

    return await this.ordenadorRepository.save(ordenador);
  }

  async findByContratoGeneralId(
    contratoGeneralId: number,
  ): Promise<OrdenadorContrato> {
    const ordenador = await this.ordenadorRepository.findOne({
      where: { contrato_general: { id: contratoGeneralId } },
    });

    if (!ordenador) {
      throw new Error(
        `No se encontró ningún Ordenador para el contrato con id ${contratoGeneralId}`,
      );
    }

    return ordenador;
  }
}
