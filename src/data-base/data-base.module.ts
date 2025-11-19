import { createDataSource } from './../config/typeorm.iniciation';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: 'PRIMARY_DATA_SOURCE',
      useFactory: async (configService: ConfigService) => {
        const { dataSource } = await createDataSource(configService);
        return dataSource;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['PRIMARY_DATA_SOURCE'], // Exporte os data sources aqui
})
export class DataBaseModule {}
