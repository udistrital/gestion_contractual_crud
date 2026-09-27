import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { OrdenadorContratoService } from './ordenador-contrato.service';
import { CreateOrdenadorContratoDto } from './dto/create-ordenador-contrato.dto';
import { UpdateOrdenadorContratoDto } from './dto/update-ordenador-contrato.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { StandardResponse } from '../utils/standardResponse.interface';
import { OrdenadorContrato } from './entities/ordenador-contrato.entity';
import { buildErrorResponse } from '../utils/http-error.helper';

@ApiTags('ordenadores-contrato')
@Controller('ordenador-contrato')
export class OrdenadorContratoController {
  constructor(
    private readonly ordenadorContratoService: OrdenadorContratoService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los ordenadores' })
  findAll() {
    return this.ordenadorContratoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un ordenador por ID' })
  findOne(@Param('id') id: string) {
    return this.ordenadorContratoService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo ordenador' })
  create(@Body() createOrdenadorContratoDto: CreateOrdenadorContratoDto) {
    return this.ordenadorContratoService.create(createOrdenadorContratoDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un ordenador' })
  update(
    @Param('id') id: string,
    @Body() updateOrdenadorContratoDto: UpdateOrdenadorContratoDto,
  ) {
    return this.ordenadorContratoService.update(
      +id,
      updateOrdenadorContratoDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un ordenador' })
  remove(@Param('id') id: string) {
    return this.ordenadorContratoService.remove(+id);
  }

  @Get('contrato/:contratoId')
  @ApiOperation({ summary: 'Obtener ordenador por ID de contrato' })
  @ApiParam({
    name: 'contratoId',
    type: 'number',
    description: 'ID del contrato',
  })
  @ApiResponse({
    status: 200,
    description: 'Ordenaodres encontrados',
    type: [OrdenadorContrato],
  })
  @ApiResponse({ status: 404, description: 'No se encontraron ordenadores' })
  async findByContratoGeneralId(
    @Res() res: Response,
    @Param('contratoId') contratoId: string,
  ): Promise<void> {
    try {
      const supervisores =
        await this.ordenadorContratoService.findByContratoGeneralId(
          +contratoId,
        );
      const response: StandardResponse<OrdenadorContrato> = {
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
