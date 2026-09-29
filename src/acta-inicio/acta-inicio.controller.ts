import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ActaInicioService } from './acta-inicio.service';
import { CrearActaInicioDto } from './dto/crear-acta-inicio.dto';
import { ActualizarActaInicioDto } from './dto/actualizar-acta-inicio.dto';
import { ActaInicio } from './entities/acta-inicio-entity';
import { StandardResponse } from '../utils/standardResponse.interface';
import { BaseQueryParamsDto } from '../shared/dto/query-params.base.dto';
import { buildErrorResponse } from '../utils/http-error.helper';

@ApiTags('actas-inicio')
@Controller('actas-inicio')
export class ActaInicioController {
  constructor(private readonly actaInicioService: ActaInicioService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las actas de inicio' })
  @ApiResponse({
    status: 200,
    description: 'Lista de actas de inicio',
    type: [ActaInicio],
  })
  @ApiQuery({
    name: 'include',
    required: false,
    description:
      'Relaciones a incluir (separadas por comas). Ejemplo: contrato_general',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description:
      'Filtros en formato JSON. Ejemplo: {"contrato_general_id":1,"activo":true}',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Campos a incluir en la respuesta (separados por comas)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Campo por el cual ordenar',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    description: 'Dirección del ordenamiento (ASC o DESC)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número máximo de registros a retornar',
    type: Number,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Número de registros a saltar',
    type: Number,
  })
  async findAll(
    @Query() queryParams: BaseQueryParamsDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const [actas, metadata] =
        await this.actaInicioService.findAll(queryParams);
      const response: StandardResponse<ActaInicio[]> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Actas de inicio encontradas',
        Data: actas,
        Metadata: metadata,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const { status, response } = buildErrorResponse(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error al obtener las actas de inicio',
      );
      res.status(status).json(response);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una acta de inicio por ID' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del acta de inicio',
  })
  @ApiResponse({
    status: 200,
    description: 'Acta de inicio encontrada',
    type: ActaInicio,
  })
  @ApiResponse({ status: 404, description: 'Acta de inicio no encontrada' })
  async findOne(@Res() res: Response, @Param('id') id: string): Promise<void> {
    try {
      const acta = await this.actaInicioService.findOne(+id);
      const response: StandardResponse<ActaInicio> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Acta de inicio encontrada',
        Data: acta,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const { status, response } = buildErrorResponse(
        error,
        HttpStatus.NOT_FOUND,
        'Acta de inicio no encontrada',
      );
      res.status(status).json(response);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva acta de inicio' })
  @ApiBody({ type: CrearActaInicioDto })
  @ApiResponse({
    status: 201,
    description: 'Acta de inicio creada',
    type: ActaInicio,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Contrato general no encontrado' })
  async create(
    @Res() res: Response,
    @Body() crearActaInicioDto: CrearActaInicioDto,
  ): Promise<void> {
    try {
      const saved = await this.actaInicioService.create(crearActaInicioDto);
      const response: StandardResponse<ActaInicio> = {
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Acta de inicio creada',
        Data: saved,
      };
      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      const { status, response } = buildErrorResponse(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error al crear el acta de inicio',
      );
      res.status(status).json(response);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una acta de inicio' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del acta de inicio a actualizar',
  })
  @ApiBody({ type: ActualizarActaInicioDto })
  @ApiResponse({
    status: 200,
    description: 'Acta de inicio actualizada',
    type: ActaInicio,
  })
  @ApiResponse({ status: 404, description: 'Acta de inicio no encontrada' })
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() actualizarActaInicioDto: ActualizarActaInicioDto,
  ): Promise<void> {
    try {
      const acta = await this.actaInicioService.update(
        +id,
        actualizarActaInicioDto,
      );
      const response: StandardResponse<ActaInicio> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Acta de inicio actualizada',
        Data: acta,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const { status, response } = buildErrorResponse(
        error,
        HttpStatus.NOT_FOUND,
        'Acta de inicio no encontrada',
      );
      res.status(status).json(response);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar lógicamente una acta de inicio' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del acta de inicio a eliminar',
  })
  @ApiResponse({ status: 200, description: 'Acta de inicio eliminada' })
  @ApiResponse({ status: 404, description: 'Acta de inicio no encontrada' })
  async remove(@Res() res: Response, @Param('id') id: string): Promise<void> {
    try {
      await this.actaInicioService.remove(+id);
      const response: StandardResponse<null> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Acta de inicio eliminada',
        Data: null,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const { status, response } = buildErrorResponse(
        error,
        HttpStatus.NOT_FOUND,
        'Acta de inicio no encontrada',
      );
      res.status(status).json(response);
    }
  }
}
