import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { WttEventsEntity } from '../postgresql/entities/wtt-events.entity';

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
    logging: true,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false, // Mantenha como false em produção
  });

  // Configuração do banco secundário
  // const postgresqlDataSource = new DataSource({
  //   type: 'postgres',
  //   host: configService.get<string>('NODE_POSTGRESQLDB_HOST'),
  //   port: configService.get<number>('NODE_POSTGRESQLDB_PORT'),
  //   username: configService.get<string>('NODE_POSTGRESQLDB_USERNAME'),
  //   password: configService.get<string>('NODE_POSTGRESQLDB_PASSWORD'),
  //   database: configService.get<string>('NODE_POSTGRESQLDB_DATABASE'),
  //   logging: true,
  //   entities: [WttEventsEntity],

  //   synchronize: false,
  // });

  await dataSource.initialize();
  // await postgresqlDataSource.initialize();
  return { dataSource };
};
