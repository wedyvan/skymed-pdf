import { HttpModule } from '@nestjs/axios';
import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { DataBaseModule } from './data-base/data-base.module';
import { CacheModule } from './cache/cache.module';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { ZodValidationPipe } from 'nestjs-zod';
import { ScheduleModule } from '@nestjs/schedule';
import { SkymedModule } from './skymed/skymed.module';

@Module({
  imports: [
    HttpModule, // For Firebase integration
    DataBaseModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    SkymedModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
  exports: [],
})
export class AppModule {}
