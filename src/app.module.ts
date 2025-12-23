import { HttpModule } from '@nestjs/axios';
import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DataBaseModule } from './data-base/data-base.module';
import { TypeOrmRepository } from './type-orm/type-orm.repository';
import { CacheModule } from './cache/cache.module';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { ZodValidationPipe } from 'nestjs-zod';
import { ScheduleModule } from '@nestjs/schedule';
import { SkymedOrmRepository } from './type-orm/skymed-orm.repository';
import { SkymedService } from './skymed/integrar-pdf.service';

@Module({
  imports: [
    HttpModule, // For Firebase integration
    DataBaseModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TypeOrmRepository,
    SkymedOrmRepository,
    SkymedService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
  exports: [TypeOrmRepository, SkymedOrmRepository, SkymedService],
})
export class AppModule {}
