import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsBoolean,
  IsDate,
  IsOptional,
} from 'class-validator';

export class CreateEstadoContratoDto {
  @IsNotEmpty()
  @IsNumber()
  usuario_id: number;

  @IsNotEmpty()
  @IsString()
  motivo: string;

  @IsNotEmpty()
  @IsDate()
  fecha_ejecucion_estado: Date;

  @IsNotEmpty()
  @IsNumber()
  contrato_general_id: number;

  @IsNotEmpty()
  @IsBoolean()
  activo: boolean;

  @IsNotEmpty()
  @IsDate()
  fecha_creacion: Date;

  @IsOptional()
  @IsDate()
  fecha_modificacion?: Date;
}