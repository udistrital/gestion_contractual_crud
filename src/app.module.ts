import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContratoGeneralModule } from './contrato-general/contrato-general.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContratoGeneral } from './contrato-general/entities/contrato-general.entity';
import { DocumentoContratoModule } from './documento-contrato/documento-contrato.module';
import { DocumentoContrato } from './documento-contrato/entities/documento-contrato.entity';
import { ContratistaModule } from './contratista/contratista.module';
import { Contratista } from './contratista/entities/contratista.entity';
import { EstadoContratoModule } from './estado-contrato/estado-contrato.module';
import { EstadoContrato } from './estado-contrato/entities/estado-contrato.entity';
import { LugarEjecucionModule } from './lugar-ejecucion/lugar-ejecucion.module';
import { LugarEjecucion } from './lugar-ejecucion/entities/lugar-ejecucion.entity';
import { CdpModule } from './cdp/cdp.module';
import { Cdp } from './cdp/entities/cdp.entity';
import { EspecificacionTecnicaModule } from './especificacion-tecnica/especificacion-tecnica.module';
import { EspecificacionTecnica } from './especificacion-tecnica/entities/especificacion-tecnica.entity';
import { ActaInicioModule } from './acta-inicio/acta-inicio.module';
import { ActaInicio } from './acta-inicio/entities/acta-inicio-entity';
import { SolicitanteModule } from './solicitante/solicitante.module';
import { SolicitanteEntity } from './solicitante/entities/solicitante.entity';
import { OrdenadorContrato } from './ordenador-contrato/entities/ordenador-contrato.entity';
import { OrdenadorContratoModule } from './ordenador-contrato/ordenador-contrato.module';
import { SupervisorEntity } from './supervisor/entities/supervisor.entity';
import { SupervisorModule } from './supervisor/supervisor.module';
import { Poliza } from './poliza/entities/poliza.entity';
import { PolizaModule } from './poliza/poliza.module';
import { AmparoPoliza } from './amparo-poliza/entities/amparo-poliza.entity';
import { AmparoPolizaModule } from './amparo-poliza/amparo-poliza.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        logging: ['error'],
        host: configService.get('GESTION_CONTRACTUAL_CRUD_HOST'),
        port: parseInt(configService.get('GESTION_CONTRACTUAL_CRUD_PORT'), 10),
        username: configService.get('GESTION_CONTRACTUAL_CRUD_USERNAME'),
        password: configService.get('GESTION_CONTRACTUAL_CRUD_PASS'),
        database: configService.get('GESTION_CONTRACTUAL_CRUD_DB'),
        schema: configService.get('GESTION_CONTRACTUAL_CRUD_DB_SCHEMA'),
        entities: [
          ContratoGeneral,
          DocumentoContrato,
          Contratista,
          EstadoContrato,
          LugarEjecucion,
          Cdp,
          ActaInicio,
          EspecificacionTecnica,
          SolicitanteEntity,
          OrdenadorContrato,
          SupervisorEntity,
          Poliza,
          AmparoPoliza,
        ],
        synchronize: configService.get('DEVELOPER_MODE'), // Solo para desarrollo, en producción se debe desactivar
        ssl: {
          rejectUnauthorized: false,
        },
      }),
      inject: [ConfigService],
    }),
    ContratoGeneralModule,
    DocumentoContratoModule,
    ContratistaModule,
    EstadoContratoModule,
    LugarEjecucionModule,
    CdpModule,
    EspecificacionTecnicaModule,
    ActaInicioModule,
    SolicitanteModule,
    OrdenadorContratoModule,
    SupervisorModule,
    PolizaModule,
    AmparoPolizaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
