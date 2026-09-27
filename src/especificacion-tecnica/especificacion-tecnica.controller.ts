import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpStatus,
  HttpException,
  Res,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { EspecificacionTecnicaService } from './especificacion-tecnica.service';
import { CrearEspecificacionTecnicaDto } from './dto/crear-especificacion-tecnica.dto';
import { EspecificacionTecnica } from './entities/especificacion-tecnica.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { StandardResponse } from '../utils/standardResponse.interface';
import { ActualizarEspecificacionTecnicaDto } from './dto/actualizar-especificacion-tecnica';
import { BaseQueryParamsDto } from 'src/shared/dto/query-params.base.dto';
import { buildErrorResponse } from '../utils/http-error.helper';

@ApiTags('especificaciones-tecnicas')
@Controller('especificaciones-tecnicas')
export class EspecificacionTecnicaController {
  constructor(
    private readonly especificacionTecnicaService: EspecificacionTecnicaService,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las especificaciones técnicas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de especificaciones técnicas',
    type: [EspecificacionTecnica],
  }) async findAll(
    @Query() queryParams: BaseQueryParamsDto, 
    @Res() res: Response
  ) : Promise<void> {
    try {
      const [especificaciones, metadata] = 
        await this.especificacionTecnicaService.findAll(queryParams);
        
      const response: StandardResponse<EspecificacionTecnica[]> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Especificaciones técnicas encontradas',
        Data: especificaciones,
        Metadata: metadata
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const { status, response } = buildErrorResponse(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error al obtener las especificaciones técnicas',
      );
      res.status(status).json(response);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una especificación técnica por ID' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID de la especificación técnica',
  })
  @ApiResponse({
    status: 200,
    description: 'Especificación técnica encontrada',
    type: EspecificacionTecnica,
  })
  @ApiResponse({ status: 404, description: 'Especificación técnica no encontrada' })
  async findOne(@Res() res: Response, @Param('id') id: string): Promise<void> {
    try {
      const especificacion = await this.especificacionTecnicaService.findOne(+id);
      const response: StandardResponse<EspecificacionTecnica> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Especificación técnica encontrada',
        Data: especificacion,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const { status, response } = buildErrorResponse(
        error,
        HttpStatus.NOT_FOUND,
        'Especificación técnica no encontrada',
      );
      res.status(status).json(response);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva especificación técnica' })
  @ApiBody({ type: CrearEspecificacionTecnicaDto })
  @ApiResponse({
    status: 201,
    description: 'Especificación técnica creada',
    type: EspecificacionTecnica,
  })
  async create(
    @Res() res: Response,
    @Body() crearEspecificacionTecnicaDto: CrearEspecificacionTecnicaDto,
  ): Promise<void> {
    try {
      const especificacion = await this.especificacionTecnicaService.create(
        crearEspecificacionTecnicaDto,
      );
      const response: StandardResponse<EspecificacionTecnica> = {
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Especificación técnica creada',
        Data: especificacion,
      };
      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      const { status, response } = buildErrorResponse(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error al crear la especificación técnica',
      );
      res.status(status).json(response);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una especificación técnica' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID de la especificación técnica a actualizar',
  })
  @ApiBody({ type: ActualizarEspecificacionTecnicaDto })
  @ApiResponse({
    status: 200,
    description: 'Especificación técnica actualizada',
    type: EspecificacionTecnica,
  })
  @ApiResponse({ status: 404, description: 'Especificación técnica no encontrada' })
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() actualizarEspecificacionTecnicaDto: ActualizarEspecificacionTecnicaDto,
  ): Promise<void> {
    try {
      const especificacion = await this.especificacionTecnicaService.update(
        +id,
        actualizarEspecificacionTecnicaDto,
      );
      const response: StandardResponse<EspecificacionTecnica> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Especificación técnica actualizada',
        Data: especificacion,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const { status, response } = buildErrorResponse(
        error,
        HttpStatus.NOT_FOUND,
        'Especificación técnica no encontrada',
      );
      res.status(status).json(response);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Marcar una especificación técnica como inactiva' })
  async remove(@Param('id') id: number): Promise<StandardResponse<EspecificacionTecnica>> {
    try {
      const especificacion = await this.especificacionTecnicaService.remove(id);
      return {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Especificación técnica marcada como inactiva',
        Data: especificacion,
      };
    } catch (error) {
      const { status, response } = buildErrorResponse(
        error,
        HttpStatus.NOT_FOUND,
        'Especificación técnica no encontrada',
      );
      throw new HttpException(response, status);
    }
  }

}
