import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CrearAmparoPolizaDto {
  @ApiProperty({
    example: 1,
    description: 'Id del contrato general al que pertenece el amparo',
  })
  @IsNumber()
  contrato_general_id: number;

  @ApiPropertyOptional({
    example: 1,
    description:
      'Id de la póliza que cubre el amparo. Se omite mientras la póliza no haya sido expedida',
  })
  @IsOptional()
  @IsNumber()
  poliza_id?: number;

  @ApiProperty({
    example: 1181,
    description: 'Id del tipo de amparo en Parámetros CRUD',
  })
  @IsNumber()
  amparo_id: number;

  @ApiPropertyOptional({
    example: 1,
    description:
      'Id del tipo de valor de la suficiencia en Parámetros CRUD (porcentaje, SMLV, etc.)',
  })
  @IsOptional()
  @IsNumber()
  tipo_valor_amparo_id?: number;

  @ApiPropertyOptional({
    example: 20,
    description:
      'Valor numérico de la suficiencia. Se interpreta según tipo_valor_amparo_id',
  })
  @IsOptional()
  @IsNumber()
  suficiencia?: number;

  @ApiPropertyOptional({
    example: 10000000,
    description: 'Valor asegurado del amparo',
  })
  @IsOptional()
  @IsNumber()
  valor?: number;

  @ApiPropertyOptional({
    example: 'Cumplimiento del contrato',
    description: 'Descripción del amparo',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;

  @ApiPropertyOptional({
    example: '2024-01-15',
    description: 'Fecha de inicio de vigencia del amparo (formato ISO)',
  })
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @ApiPropertyOptional({
    example: '2025-01-15',
    description: 'Fecha de finalización de vigencia del amparo (formato ISO)',
  })
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si el amparo está activo',
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
