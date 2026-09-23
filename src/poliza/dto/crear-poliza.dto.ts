import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CrearPolizaDto {
  @ApiPropertyOptional({
    example: 'POL-2024-0001',
    description: 'Número con el que la aseguradora identifica la póliza',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numero_poliza?: string;

  @ApiPropertyOptional({
    example: 301,
    description: 'Id de la entidad aseguradora en Parámetros CRUD',
  })
  @IsOptional()
  @IsNumber()
  entidad_aseguradora_id?: number;

  @ApiProperty({
    example: 1,
    description: 'Id del contrato general que ampara la póliza',
  })
  @IsNumber()
  contrato_general_id: number;

  @ApiPropertyOptional({
    example: 'Póliza de cumplimiento',
    description: 'Descripción de la póliza',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;

  @ApiPropertyOptional({
    example: '2024-01-15',
    description: 'Fecha de inicio de vigencia (formato ISO)',
  })
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @ApiPropertyOptional({
    example: '2025-01-15',
    description: 'Fecha de finalización de vigencia (formato ISO)',
  })
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @ApiPropertyOptional({
    example: '2024-01-10',
    description: 'Fecha de expedición de la póliza (formato ISO)',
  })
  @IsOptional()
  @IsDateString()
  fecha_expedicion?: string;

  @ApiPropertyOptional({
    example: '2024-01-14',
    description: 'Fecha de aprobación de la póliza (formato ISO)',
  })
  @IsOptional()
  @IsDateString()
  fecha_aprobacion?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Id del usuario que registra la póliza',
  })
  @IsOptional()
  @IsNumber()
  usuario_id?: number;

  @ApiPropertyOptional({
    example: 'usuario_legado',
    description: 'Usuario heredado del sistema anterior',
  })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  usuario_legado?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si la póliza está activa',
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
