import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DocumentoContratoService } from './documento-contrato.service';
import { CreateDocumentoContratoDto } from './dto/create-documento-contrato.dto';
import { UpdateDocumentoContratoDto } from './dto/update-documento-contrato.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { StandardResponse } from '../utils/standardResponse.interface';
import { DocumentoContrato } from './entities/documento-contrato.entity';
import { BaseQueryParamsDto } from 'src/shared/dto/query-params.base.dto';
import { buildErrorResponse } from '../utils/http-error.helper';

@ApiTags('documentos-contratos')
@Controller('documentos-contratos')
export class DocumentoContratoController {
  constructor(
    private readonly documentoContratoService: DocumentoContratoService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo documento contrato' })
  @ApiBody({ type: CreateDocumentoContratoDto })
  @ApiResponse({
    status: 201,
    description: 'El documento contrato ha sido creado exitosamente.',
    type: DocumentoContrato,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async create(
    @Body() createDocumentoDto: CreateDocumentoContratoDto,
  ): Promise<DocumentoContrato> {
    return this.documentoContratoService.create(createDocumentoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los documentos contratos' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todos los documentos contratos.',
    type: [DocumentoContrato],
  }) async findAll( 
    @Query() queryParams: BaseQueryParamsDto, 
    @Res() res: Response
  ): Promise<void> {
    try {
      const [documentos, metadata] = 
        await this.documentoContratoService.findAll(queryParams);
        
      const response: StandardResponse<DocumentoContrato[]> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Documentos de contrato encontrados',
        Data: documentos,
        Metadata: metadata
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const { status, response } = buildErrorResponse(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error al obtener los documentos de contrato',
      );
      res.status(status).json(response);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un documento contrato por id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve el documento contrato.',
    type: DocumentoContrato,
  })
  @ApiResponse({
    status: 404,
    description: 'Documento contrato no encontrado.',
  })
  async findOne(@Param('id') id: string): Promise<DocumentoContrato> {
    return this.documentoContratoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un documento contrato' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateDocumentoContratoDto })
  @ApiResponse({
    status: 200,
    description: 'El documento contrato ha sido actualizado exitosamente.',
    type: DocumentoContrato,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({
    status: 404,
    description: 'Documento contrato no encontrado.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDocumentoDto: UpdateDocumentoContratoDto,
  ): Promise<DocumentoContrato> {
    return this.documentoContratoService.update(id, updateDocumentoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un documento contrato' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'El documento contrato ha sido eliminado exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Documento contrato no encontrado.',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.documentoContratoService.remove(id);
  }

  @Get('contrato/:contratoId')
  @ApiOperation({ summary: 'Obtener documentos contratos por id de contrato' })
  @ApiParam({ name: 'contratoId', type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Devuelve los documentos contratos para el contrato especificado.',
    type: [DocumentoContrato],
  })
  @ApiResponse({
    status: 404,
    description:
      'No se encontraron documentos contratos para el contrato especificado.',
  })
  findByContratoId(@Param('contratoId') contratoId: string) {
    return this.documentoContratoService.findByContratoId(+contratoId);
  }
}
