import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpStatus,
  Res,
  Query,
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
import { PolizaService } from './poliza.service';
import { CrearPolizaDto } from './dto/crear-poliza.dto';
import { ActualizarPolizaDto } from './dto/actualizar-poliza.dto';
import { Poliza } from './entities/poliza.entity';
import { AmparoPoliza } from '../amparo-poliza/entities/amparo-poliza.entity';
import { StandardResponse } from '../utils/standardResponse.interface';
import { BaseQueryParamsDto } from '../shared/dto/query-params.base.dto';

@ApiTags('polizas')
@Controller('polizas')
export class PolizaController {
  constructor(private readonly polizaService: PolizaService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las pólizas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pólizas',
    type: [Poliza],
  })
  @ApiQuery({
    name: 'include',
    required: false,
    description:
      'Relaciones a incluir (separadas por comas). Ejemplo: amparos,contrato_general',
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
      const [polizas, metadata] = await this.polizaService.findAll(queryParams);
      const response: StandardResponse<Poliza[]> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Pólizas encontradas',
        Data: polizas,
        Metadata: metadata,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const response: StandardResponse<any> = {
        Success: false,
        Status: HttpStatus.INTERNAL_SERVER_ERROR,
        Message: 'Error al obtener las pólizas',
        Data: error.message,
      };
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una póliza por ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la póliza' })
  @ApiQuery({
    name: 'include',
    required: false,
    description: 'Relaciones a incluir (separadas por comas). Ejemplo: amparos',
  })
  @ApiResponse({ status: 200, description: 'Póliza encontrada', type: Poliza })
  @ApiResponse({ status: 404, description: 'Póliza no encontrada' })
  async findOne(
    @Res() res: Response,
    @Param('id') id: string,
    @Query() queryParams: BaseQueryParamsDto,
  ): Promise<void> {
    try {
      const poliza = await this.polizaService.findOne(+id, queryParams);
      const response: StandardResponse<Poliza> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Póliza encontrada',
        Data: poliza,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const response: StandardResponse<any> = {
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Póliza no encontrada',
        Data: error.message,
      };
      res.status(HttpStatus.NOT_FOUND).json(response);
    }
  }

  @Get(':id/amparos')
  @ApiOperation({ summary: 'Obtener los amparos cubiertos por una póliza' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la póliza' })
  @ApiResponse({
    status: 200,
    description: 'Amparos encontrados',
    type: [AmparoPoliza],
  })
  @ApiResponse({ status: 404, description: 'Póliza no encontrada' })
  async findAmparos(
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<void> {
    try {
      const amparos = await this.polizaService.findAmparos(+id);
      const response: StandardResponse<AmparoPoliza[]> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Amparos encontrados',
        Data: amparos,
        Metadata: { total: amparos.length },
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const response: StandardResponse<any> = {
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Póliza no encontrada',
        Data: error.message,
      };
      res.status(HttpStatus.NOT_FOUND).json(response);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva póliza' })
  @ApiBody({ type: CrearPolizaDto })
  @ApiResponse({ status: 201, description: 'Póliza creada', type: Poliza })
  async create(
    @Res() res: Response,
    @Body() crearPolizaDto: CrearPolizaDto,
  ): Promise<void> {
    try {
      const saved = await this.polizaService.create(crearPolizaDto);
      const response: StandardResponse<Poliza> = {
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Póliza creada',
        Data: saved,
      };
      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      const response: StandardResponse<any> = {
        Success: false,
        Status: HttpStatus.INTERNAL_SERVER_ERROR,
        Message: 'Error al crear la póliza',
        Data: error.message,
      };
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una póliza' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID de la póliza a actualizar',
  })
  @ApiBody({ type: ActualizarPolizaDto })
  @ApiResponse({
    status: 200,
    description: 'Póliza actualizada',
    type: Poliza,
  })
  @ApiResponse({ status: 404, description: 'Póliza no encontrada' })
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() actualizarPolizaDto: ActualizarPolizaDto,
  ): Promise<void> {
    try {
      const poliza = await this.polizaService.update(+id, actualizarPolizaDto);
      const response: StandardResponse<Poliza> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Póliza actualizada',
        Data: poliza,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const response: StandardResponse<any> = {
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Póliza no encontrada',
        Data: error.message,
      };
      res.status(HttpStatus.NOT_FOUND).json(response);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar lógicamente una póliza' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID de la póliza a eliminar',
  })
  @ApiResponse({ status: 200, description: 'Póliza eliminada' })
  @ApiResponse({ status: 404, description: 'Póliza no encontrada' })
  async remove(@Res() res: Response, @Param('id') id: string): Promise<void> {
    try {
      await this.polizaService.remove(+id);
      const response: StandardResponse<any> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Póliza eliminada',
        Data: null,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const response: StandardResponse<any> = {
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Póliza no encontrada',
        Data: error.message,
      };
      res.status(HttpStatus.NOT_FOUND).json(response);
    }
  }
}
