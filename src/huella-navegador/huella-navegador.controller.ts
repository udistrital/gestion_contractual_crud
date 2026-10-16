import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { HuellaNavegadorService } from './huella-navegador.service';
import { CreateHuellaNavegadorDto } from './dto/create-huella-navegador.dto';
import { HuellaNavegador } from './entities/huella-navegador.entity';
import { BaseQueryParamsDto } from '../shared/dto/query-params.base.dto';
import { StandardResponse } from '../utils/standardResponse.interface';
import { buildErrorResponse } from '../utils/http-error.helper';

const LONGITUD_MAXIMA_IP = 45;

/**
 * La huella es un registro de auditoría: no se exponen PATCH ni DELETE para
 * que no pueda modificarse después de capturada.
 */
@ApiTags('huellas-navegador')
@Controller('huellas-navegador')
export class HuellaNavegadorController {
  constructor(
    private readonly huellaNavegadorService: HuellaNavegadorService,
  ) {}

  @Post()
  @ApiOperation({
    summary:
      'Registrar la huella digital del navegador capturada por un microcliente',
  })
  @ApiBody({ type: CreateHuellaNavegadorDto })
  @ApiResponse({
    status: 201,
    description: 'Huella de navegador registrada',
    type: HuellaNavegador,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async create(
    @Body() createHuellaNavegadorDto: CreateHuellaNavegadorDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const huella = await this.huellaNavegadorService.create(
        createHuellaNavegadorDto,
        this.obtenerIpServidor(req),
      );
      const response: StandardResponse<HuellaNavegador> = {
        Success: true,
        Status: HttpStatus.CREATED,
        Message: 'Huella de navegador registrada',
        Data: huella,
      };
      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      const { status, response } = buildErrorResponse(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error al registrar la huella de navegador',
      );
      res.status(status).json(response);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener las huellas de navegador registradas' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve las huellas de navegador registradas.',
    type: [HuellaNavegador],
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description:
      'Filtros en formato JSON. Ejemplo: {"usuario_id":123,"libreria":"fingerprintjs"}',
  })
  async findAll(
    @Query() queryParams: BaseQueryParamsDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const [huellas, metadata] =
        await this.huellaNavegadorService.findAll(queryParams);

      const response: StandardResponse<HuellaNavegador[]> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Huellas de navegador encontradas',
        Data: huellas,
        Metadata: metadata,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const { status, response } = buildErrorResponse(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error al obtener las huellas de navegador',
      );
      res.status(status).json(response);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una huella de navegador por id' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve la huella de navegador.',
    type: HuellaNavegador,
  })
  @ApiResponse({
    status: 404,
    description: 'Huella de navegador no encontrada.',
  })
  async findOne(@Param('id') id: string, @Res() res: Response): Promise<void> {
    try {
      const huella = await this.huellaNavegadorService.findOne(+id);
      const response: StandardResponse<HuellaNavegador> = {
        Success: true,
        Status: HttpStatus.OK,
        Message: 'Huella de navegador encontrada',
        Data: huella,
      };
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const { status, response } = buildErrorResponse(
        error,
        HttpStatus.NOT_FOUND,
        'Huella de navegador no encontrada',
      );
      res.status(status).json(response);
    }
  }

  /**
   * IP con la que llega la petición: el primer valor de X-Forwarded-For (el
   * cliente original cuando hay proxies o gateway) o, si no viene, la del
   * socket. Se quita el prefijo IPv4 mapeado a IPv6 (::ffff:).
   */
  private obtenerIpServidor(req: Request): string | null {
    const encabezado = req.headers['x-forwarded-for'];
    const valor = Array.isArray(encabezado) ? encabezado[0] : encabezado;
    const reenviada = valor?.split(',')[0]?.trim();
    const ip = reenviada || req.socket?.remoteAddress;
    if (!ip) {
      return null;
    }
    return ip.replace(/^::ffff:/, '').slice(0, LONGITUD_MAXIMA_IP);
  }
}
