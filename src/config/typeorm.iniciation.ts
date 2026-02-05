import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

export const LoggerProvider = {
  provide: Logger,
  useValue: new Logger('TypeOrmLogger'), // O nome do logger pode ser personalizado
};

export const createDataSource = async (configService: ConfigService) => {
  // Inicialização do cliente Oracle

  const dataSource = new DataSource({
    type: 'oracle',
    username: configService.get<string>('NODE_ORACLEDB_USER'),
    password: configService.get<string>('NODE_ORACLEDB_PASSWORD'),
    connectString: configService.get<string>('NODE_ORACLEDB_CONNECTIONSTRING'),
    logging: ['error', 'warn'],
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false, // Mantenha como false em produção
  });

  await dataSource.initialize();
  // await postgresqlDataSource.initialize();
  return { dataSource };
};
