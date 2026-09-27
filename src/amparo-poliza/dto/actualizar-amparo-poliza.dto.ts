import { PartialType } from '@nestjs/swagger';
import { CrearAmparoPolizaDto } from './crear-amparo-poliza.dto';

export class ActualizarAmparoPolizaDto extends PartialType(
  CrearAmparoPolizaDto,
) {}
