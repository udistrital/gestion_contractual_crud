import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDocumentoContratoDto } from './dto/create-documento-contrato.dto';
import { UpdateDocumentoContratoDto } from './dto/update-documento-contrato.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentoContrato } from './entities/documento-contrato.entity';
import { Repository } from 'typeorm';
import { ContratoGeneral } from '../contrato-general/entities/contrato-general.entity';
import { BaseCrudService } from 'src/shared/services/base-crud.service';
import { ResponseMetadata } from 'src/utils/response-metadata.interface';
import { BaseQueryParamsDto } from 'src/shared/dto/query-params.base.dto';

@Injectable()
export class DocumentoContratoService extends BaseCrudService<DocumentoContrato> {
  constructor(
    @InjectRepository(DocumentoContrato)
    private documentoContratoRepository: Repository<DocumentoContrato>,
    @InjectRepository(ContratoGeneral)
    private contratoGeneralRepository: Repository<ContratoGeneral>,
  ) {
    super(documentoContratoRepository);
  }

  async create(
    createDocumentoDto: CreateDocumentoContratoDto,
  ): Promise<DocumentoContrato> {
    const found = await this.contratoGeneralRepository.findOne({
      where: { id: createDocumentoDto.contrato_general_id },
    });

    if (!found) {
      throw new BadRequestException(
        `Error al crear el documento. El contrato general con ID ${createDocumentoDto.contrato_general_id} no existe`,
      );
    }

    createDocumentoDto.activo = true;
    createDocumentoDto.fecha_creacion = new Date();
    createDocumentoDto.fecha_modificacion = new Date();

    const documento =
      this.documentoContratoRepository.create(createDocumentoDto);
    try {
      return await this.documentoContratoRepository.save(documento);
    } catch (error) {
      if (error.code === '23503') {
        throw new BadRequestException(
          `Error al crear el documento: El contrato general con ID ${createDocumentoDto.contrato_general_id} no existe`,
        );
      } else {
        throw new Error(`Error al crear el documento: ${error.message}`);
      }
    }
  }

  async findAll(
    queryParams: BaseQueryParamsDto,
  ): Promise<[DocumentoContrato[], ResponseMetadata]> {
    return this.findAllWithFilters(queryParams);
  }

  async findOne(id: string): Promise<DocumentoContrato> {
    return await this.documentoContratoRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    updateDocumentoDto: UpdateDocumentoContratoDto,
  ): Promise<DocumentoContrato> {
    await this.documentoContratoRepository.update(id, updateDocumentoDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.documentoContratoRepository.delete(id);
  }

  async findByContratoId(contratoId: number): Promise<DocumentoContrato[]> {
    return await this.documentoContratoRepository.find({
      where: { contrato_general: { id: contratoId } },
    });
  }
}
