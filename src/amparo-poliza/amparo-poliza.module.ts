import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmparoPolizaService } from './amparo-poliza.service';
import { AmparoPolizaController } from './amparo-poliza.controller';
import { AmparoPoliza } from './entities/amparo-poliza.entity';
import { Poliza } from '../poliza/entities/poliza.entity';
import { ContratoGeneral } from '../contrato-general/entities/contrato-general.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AmparoPoliza, Poliza, ContratoGeneral])],
  controllers: [AmparoPolizaController],
  providers: [AmparoPolizaService],
  exports: [TypeOrmModule],
})
export class AmparoPolizaModule {}
