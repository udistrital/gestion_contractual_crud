import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  Res,
  Put,
} from '@nestjs/common';
import { Response } from 'express';
import { SupervisorService } from './supervisor.service';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { SupervisorEntity } from './entities/supervisor.entity';
import { StandardResponse } from '../utils/standardResponse.interface';
import { buildErrorResponse } from '../utils/http-error.helper';

@ApiTags('supervisores')
@Controller('supervisores')
export class SupervisorController {
  constructor(private readonly supervisorService: SupervisorService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los supervisores' })
  @ApiResponse({
    status: 200,
    description: 'Lista de supervisores',
    type: [SupervisorEntity],
  })
  @ApiQuery({
    name: 'include',
    required: false,
    description:
      'Relaciones a incluir (separadas por comas). Ejemplo: contratos,usuario',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Filtros en formato JSON',
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
  async findAll(@Res() res: Response): Promise<void> {
    try {
      const supervisores = await this.supervisorService.findAll();
      const response: StandardResponse<SupervisorEntity[]> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Supervisores encontrados',
        Data: supervisores,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const { status, response } = buildErrorResponse(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error al obtener los supervisores',
      );
      res.status(status).json(response);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un supervisor por ID' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del supervisor',
  })
  @ApiQuery({
    name: 'include',
    required: false,
    description: 'Relaciones a incluir (separadas por comas)',
  })
  @ApiResponse({
    status: 200,
    description: 'Supervisor encontrado',
    type: SupervisorEntity,
  })
  @ApiResponse({ status: 404, description: 'Supervisor no encontrado' })
  async findOne(@Res() res: Response, @Param('id') id: string): Promise<void> {
    try {
      const supervisor = await this.supervisorService.findOne(+id);
      const response: StandardResponse<SupervisorEntity> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Supervisor encontrado',
        Data: supervisor,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const { status, response } = buildErrorResponse(
        error,
        HttpStatus.NOT_FOUND,
        'Supervisor no encontrado',
      );
      res.status(status).json(response);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo supervisor' })
  @ApiBody({ type: CreateSupervisorDto })
  @ApiResponse({
    status: 201,
    description: 'Supervisor creado',
    type: SupervisorEntity,
  })
  async create(
    @Res() res: Response,
    @Body() createSupervisorDto: CreateSupervisorDto,
  ): Promise<void> {
    try {
      const saved = await this.supervisorService.create(createSupervisorDto);
      const response: StandardResponse<SupervisorEntity> = {
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Supervisor creado',
        Data: saved,
      };
      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      const { status, response } = buildErrorResponse(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error al crear el supervisor',
      );
      res.status(status).json(response);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un supervisor' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del supervisor a actualizar',
  })
  @ApiBody({ type: UpdateSupervisorDto })
  @ApiResponse({
    status: 200,
    description: 'Supervisor actualizado',
    type: SupervisorEntity,
  })
  @ApiResponse({ status: 404, description: 'Supervisor no encontrado' })
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateSupervisorDto: UpdateSupervisorDto,
  ): Promise<void> {
    try {
      const supervisor = await this.supervisorService.update(
        +id,
        updateSupervisorDto,
      );
      const response: StandardResponse<SupervisorEntity> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Supervisor actualizado',
        Data: supervisor,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const { status, response } = buildErrorResponse(
        error,
        HttpStatus.NOT_FOUND,
        'Supervisor no encontrado',
      );
      res.status(status).json(response);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un supervisor' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del supervisor a eliminar',
  })
  @ApiResponse({ status: 200, description: 'Supervisor eliminado' })
  @ApiResponse({ status: 404, description: 'Supervisor no encontrado' })
  async remove(@Res() res: Response, @Param('id') id: string): Promise<void> {
    try {
      await this.supervisorService.remove(+id);
      const response: StandardResponse<any> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Supervisor eliminado',
        Data: null,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const { status, response } = buildErrorResponse(
        error,
        HttpStatus.NOT_FOUND,
        'Supervisor no encontrado',
      );
      res.status(status).json(response);
    }
  }

  @Get('contrato/:contratoId')
  @ApiOperation({ summary: 'Obtener supervisores por ID de contrato' })
  @ApiParam({
    name: 'contratoId',
    type: 'number',
    description: 'ID del contrato',
  })
  @ApiResponse({
    status: 200,
    description: 'Supervisores encontrados',
    type: [SupervisorEntity],
  })
  @ApiResponse({ status: 404, description: 'No se encontraron supervisores' })
  async findByContratoGeneralId(
    @Res() res: Response,
    @Param('contratoId') contratoId: string,
  ): Promise<void> {
    try {
      const supervisores =
        await this.supervisorService.findByContratoGeneralId(+contratoId);
      const response: StandardResponse<SupervisorEntity[]> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Supervisores encontrados',
        Data: supervisores,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const { status, response } = buildErrorResponse(
        error,
        HttpStatus.NOT_FOUND,
        'No se encontraron supervisores para el contrato especificado',
      );
      res.status(status).json(response);
    }
  }
}
