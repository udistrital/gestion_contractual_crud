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
  ParseArrayPipe,
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
import { AmparoPolizaService } from './amparo-poliza.service';
import { CrearAmparoPolizaDto } from './dto/crear-amparo-poliza.dto';
import { ActualizarAmparoPolizaDto } from './dto/actualizar-amparo-poliza.dto';
import { AmparoPoliza } from './entities/amparo-poliza.entity';
import { StandardResponse } from '../utils/standardResponse.interface';
import { BaseQueryParamsDto } from '../shared/dto/query-params.base.dto';

@ApiTags('amparos-polizas')
@Controller('amparos-polizas')
export class AmparoPolizaController {
  constructor(private readonly amparoPolizaService: AmparoPolizaService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los amparos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de amparos',
    type: [AmparoPoliza],
  })
  @ApiQuery({
    name: 'include',
    required: false,
    description:
      'Relaciones a incluir (separadas por comas). Ejemplo: poliza,contrato_general',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description:
      'Filtros en formato JSON. Ejemplo: {"contrato_general_id":1} o {"poliza_id":3}',
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
      const [amparos, metadata] =
        await this.amparoPolizaService.findAll(queryParams);
      const response: StandardResponse<AmparoPoliza[]> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Amparos encontrados',
        Data: amparos,
        Metadata: metadata,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const response: StandardResponse<any> = {
        Success: false,
        Status: HttpStatus.INTERNAL_SERVER_ERROR,
        Message: 'Error al obtener los amparos',
        Data: error.message,
      };
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un amparo por ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID del amparo' })
  @ApiQuery({
    name: 'include',
    required: false,
    description: 'Relaciones a incluir (separadas por comas). Ejemplo: poliza',
  })
  @ApiResponse({
    status: 200,
    description: 'Amparo encontrado',
    type: AmparoPoliza,
  })
  @ApiResponse({ status: 404, description: 'Amparo no encontrado' })
  async findOne(
    @Res() res: Response,
    @Param('id') id: string,
    @Query() queryParams: BaseQueryParamsDto,
  ): Promise<void> {
    try {
      const amparo = await this.amparoPolizaService.findOne(+id, queryParams);
      const response: StandardResponse<AmparoPoliza> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Amparo encontrado',
        Data: amparo,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const response: StandardResponse<any> = {
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Amparo no encontrado',
        Data: error.message,
      };
      res.status(HttpStatus.NOT_FOUND).json(response);
    }
  }

  @Post()
  @ApiOperation({
    summary:
      'Crear uno o varios amparos. Los amparos se registran con el contrato y la póliza se asocia posteriormente',
  })
  @ApiBody({ type: [CrearAmparoPolizaDto] })
  @ApiResponse({
    status: 201,
    description: 'Amparos creados',
    type: [AmparoPoliza],
  })
  @ApiResponse({
    status: 206,
    description: 'Algunos amparos no pudieron ser creados',
  })
  async create(
    @Res() res: Response,
    @Body(new ParseArrayPipe({ items: CrearAmparoPolizaDto }))
    crearAmparoPolizaDto: CrearAmparoPolizaDto[],
  ): Promise<void> {
    try {
      const { creados, errores } =
        await this.amparoPolizaService.createMultiple(crearAmparoPolizaDto);

      if (errores.length > 0) {
        const response: StandardResponse<any> = {
          Success: false,
          Status: HttpStatus.PARTIAL_CONTENT,
          Message: 'Algunos amparos no pudieron ser creados',
          Data: { creados, errores },
        };
        res.status(HttpStatus.PARTIAL_CONTENT).json(response);
        return;
      }

      const response: StandardResponse<AmparoPoliza[]> = {
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Amparos creados',
        Data: creados,
        Metadata: { total: creados.length },
      };
      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      const response: StandardResponse<any> = {
        Success: false,
        Status: HttpStatus.INTERNAL_SERVER_ERROR,
        Message: 'Error al crear los amparos',
        Data: error.message,
      };
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  @Put(':id')
  @ApiOperation({
    summary:
      'Actualizar un amparo. También se usa para asociarlo a la póliza expedida',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del amparo a actualizar',
  })
  @ApiBody({ type: ActualizarAmparoPolizaDto })
  @ApiResponse({
    status: 200,
    description: 'Amparo actualizado',
    type: AmparoPoliza,
  })
  @ApiResponse({ status: 404, description: 'Amparo no encontrado' })
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() actualizarAmparoPolizaDto: ActualizarAmparoPolizaDto,
  ): Promise<void> {
    try {
      const amparo = await this.amparoPolizaService.update(
        +id,
        actualizarAmparoPolizaDto,
      );
      const response: StandardResponse<AmparoPoliza> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Amparo actualizado',
        Data: amparo,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const response: StandardResponse<any> = {
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Amparo no encontrado',
        Data: error.message,
      };
      res.status(HttpStatus.NOT_FOUND).json(response);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar lógicamente un amparo' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del amparo a eliminar',
  })
  @ApiResponse({ status: 200, description: 'Amparo eliminado' })
  @ApiResponse({ status: 404, description: 'Amparo no encontrado' })
  async remove(@Res() res: Response, @Param('id') id: string): Promise<void> {
    try {
      await this.amparoPolizaService.remove(+id);
      const response: StandardResponse<any> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Amparo eliminado',
        Data: null,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const response: StandardResponse<any> = {
        Success: false,
        Status: HttpStatus.NOT_FOUND,
        Message: 'Amparo no encontrado',
        Data: error.message,
      };
      res.status(HttpStatus.NOT_FOUND).json(response);
    }
  }
}
