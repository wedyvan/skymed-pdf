import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initOracleClient } from 'oracledb';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/logger.config';

async function bootstrap() {
  const configService = new ConfigService();
  const logger = WinstonModule.createLogger(winstonConfig);

  const libDir = configService.get<string>('CAMINHO_INSTANT_CLIENT');
  if (libDir) {
    initOracleClient({ libDir });
  }
  const app = await NestFactory.create(AppModule, {
    logger,
  });
  const config = new DocumentBuilder()
    .setTitle(`Documentação`)
    .setDescription('Documentação')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
