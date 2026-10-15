import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsIP,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateHuellaNavegadorDto {
  @ApiProperty({
    example: '4f2a9c1e8b7d6a5f3e2d1c0b9a8f7e6d',
    description: 'Identificador calculado por la librería de fingerprinting',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  huella: string;

  @ApiProperty({
    example: 'fingerprintjs',
    description: 'Librería con la que se calculó la huella',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  libreria: string;

  @ApiProperty({
    example: '5.0.1',
    description: 'Versión de la librería con la que se calculó la huella',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  version_libreria: string;

  @ApiPropertyOptional({
    example: 0.4,
    description:
      'Puntaje de confianza entre 0 y 1 reportado por la librería, si lo entrega',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confianza?: number;

  @ApiPropertyOptional({
    example: {
      canvas: { hash: 'a1b2c3d4e5f60718', duracion_ms: 12, error: false },
    },
    description:
      'Componentes de la huella, cada uno como hash truncado, duración y si falló. No contiene valores crudos',
  })
  @IsOptional()
  @IsObject()
  componentes?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: '190.25.0.1',
    description: 'Dirección IP pública vista por el cliente (servicio de eco)',
  })
  @IsOptional()
  @IsIP()
  direccion_ip?: string;

  @ApiProperty({
    example:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    description: 'User agent del navegador',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  user_agent: string;

  @ApiPropertyOptional({
    example: 123,
    description: 'Identificador del usuario autenticado',
  })
  @IsOptional()
  @IsInt()
  usuario_id?: number;

  @ApiPropertyOptional({
    example: 'ASISTENTE_JURIDICA',
    description: 'Rol del usuario autenticado',
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  usuario_rol?: string;

  @ApiProperty({
    example: 'gestion_contractual_mf',
    description: 'Microcliente que capturó la huella',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  microcliente: string;

  @ApiPropertyOptional({
    example: '/gestion-contractual/consulta-contrato',
    description: 'Ruta de la página en la que se capturó, sin query string',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  ruta?: string;

  @ApiProperty({
    example: '2026-10-16T15:00:00.000Z',
    description: 'Fecha y hora en la que el navegador capturó la huella',
  })
  @Type(() => Date)
  @IsDate()
  fecha_captura: Date;
}
