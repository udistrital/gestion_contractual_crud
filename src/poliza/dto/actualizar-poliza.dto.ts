import { PartialType } from '@nestjs/swagger';
import { CrearPolizaDto } from './crear-poliza.dto';

export class ActualizarPolizaDto extends PartialType(CrearPolizaDto) {}
