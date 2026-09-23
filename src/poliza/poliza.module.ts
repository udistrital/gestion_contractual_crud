import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolizaService } from './poliza.service';
import { PolizaController } from './poliza.controller';
import { Poliza } from './entities/poliza.entity';
import { AmparoPoliza } from '../amparo-poliza/entities/amparo-poliza.entity';
import { ContratoGeneral } from '../contrato-general/entities/contrato-general.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Poliza, AmparoPoliza, ContratoGeneral])],
  controllers: [PolizaController],
  providers: [PolizaService],
  exports: [TypeOrmModule],
})
export class PolizaModule {}
