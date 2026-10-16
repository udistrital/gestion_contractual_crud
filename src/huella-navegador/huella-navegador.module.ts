import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HuellaNavegadorService } from './huella-navegador.service';
import { HuellaNavegadorController } from './huella-navegador.controller';
import { HuellaNavegador } from './entities/huella-navegador.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HuellaNavegador])],
  controllers: [HuellaNavegadorController],
  providers: [HuellaNavegadorService],
})
export class HuellaNavegadorModule {}
