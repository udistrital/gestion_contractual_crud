import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import compression from 'compression';
import helmet from 'helmet';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

async function loadSsmParameters() {
  const parameterStore = process.env.PARAMETER_STORE;
  if (!parameterStore) return;

  const client = new SSMClient({});

  const [userRes, passRes] = await Promise.all([
    client.send(
      new GetParameterCommand({
        Name: `/${parameterStore}/gestion_contractual_crud/db/username`,
      }),
    ),
    client.send(
      new GetParameterCommand({
        Name: `/${parameterStore}/gestion_contractual_crud/db/password`,
        WithDecryption: true,
      }),
    ),
  ]);

  if (!userRes.Parameter?.Value || !passRes.Parameter?.Value) {
    throw new Error('No se pudieron cargar parámetros desde AWS SSM');
  }

  process.env.GESTION_CONTRACTUAL_CRUD_USERNAME = userRes.Parameter.Value;
  process.env.GESTION_CONTRACTUAL_CRUD_PASS = passRes.Parameter.Value;
}

async function bootstrap() {
  await loadSsmParameters();

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const config = new DocumentBuilder()
    .setTitle('Gestion Contractual CRUD')
    .setDescription('API para la gestión contractual')
    .setVersion('1.0')
    .addTag('gestion-contractual')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const outputPath = join(process.cwd(), 'swagger');
  fs.mkdirSync(outputPath, { recursive: true });
  fs.writeFileSync(
    join(outputPath, 'swagger.json'),
    JSON.stringify(document, null, 2),
  );
  fs.writeFileSync(join(outputPath, 'swagger.yaml'), yaml.dump(document));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  );

  app.enableCors();
  app.use(helmet()); // Seguridad
  app.use(compression()); // Compresión

  await app.listen(parseInt(process.env.PORT) || 8080);
}
bootstrap();
