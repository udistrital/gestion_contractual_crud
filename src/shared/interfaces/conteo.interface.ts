import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ConteoConsecutivo {
  @ApiProperty({
    example: 1,
    description: 'Id de unidad ejecutora',
  })
  @IsNotEmpty()
  @IsNumber()
  unidad_ejecutora_id: number;
}

export class ConteoNumeroContrato {
  @ApiProperty({
    example: 1,
    description: 'Id de unidad ejecutora',
  })
  @IsNotEmpty()
  @IsNumber()
  unidad_ejecutora_id: number;

  @ApiProperty({
    example: '2024',
    description: 'Vigencia',
  })
  @IsNotEmpty()
  @IsString()
  vigencia: string;

  @ApiProperty({
    example: 1,
    description: 'Id del estado',
  })
  @IsNotEmpty()
  @IsNumber()
  estado: number;
}
