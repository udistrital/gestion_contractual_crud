import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearActaInicioDto {
  @ApiProperty({
    example: 1,
    description: 'Id del usuario que creó el acta',
  })
  @IsNumber()
  usuario_id: number;

  @ApiProperty({
    example: 'usuario_legado',
    description: 'Usuario heredado del sistema anterior',
  })
  @IsOptional()
  @IsString()
  usuario_legado: string;

  @ApiProperty({
    example: 'Descripción del acta',
    description: 'Descripción breve del acta',
  })
  @IsString()
  descripcion: string;

  @ApiProperty({
    example: '2023-10-24',
    description: 'Fecha de inicio del acta (formato ISO)',
  })
  @IsDateString()
  fecha_inicio: string;

  @ApiProperty({
    example: '2023-11-24',
    description: 'Fecha de finalización del acta (formato ISO)',
  })
  @IsDateString()
  fecha_fin: string;

  @ApiProperty({
    example: 1,
    description: 'Id del contrato general relacionado',
  })
  @IsNumber()
  contrato_general_id: number;

  @ApiProperty({
    example: true,
    description: 'Indica si el acta está activa',
  })
  @IsBoolean()
  activo: boolean;
}
