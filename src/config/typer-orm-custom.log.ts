import { Logger as NestJsLog } from '@nestjs/common';
import { Logger, QueryRunner } from 'typeorm';

export class MyCustomLoggerTypeOrm implements Logger {
  private nestJsLog = new NestJsLog(MyCustomLoggerTypeOrm.name);
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    // Implemente o código para registrar consultas SQL
    this.nestJsLog.debug(
      'Query Executada:',
      query,
      'com parâmetros:',
      parameters,
    );
  }

  logQueryError(
    error: string,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    // Implemente o código para registrar erros de consulta SQL
    this.nestJsLog.error(
      `Erro na Query: ${error}, Query: ${query}, com parâmetros: ${
        parameters ? parameters.join(', ') : ''
      }`,
    );
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    // Implemente o código para registrar consultas lentas
    this.nestJsLog.warn('Consulta Lenta:', query, 'Tempo:', time, 'ms');
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    // Implemente o código para registrar construção de esquema (schema build)
    this.nestJsLog.debug('Construção de Esquema:', message);
  }

  logMigration(message: string, queryRunner?: QueryRunner) {
    // Implemente o código para registrar migrações de banco de dados
    this.nestJsLog.debug('Migração:', message);
  }

  log(
    level: 'debug' | 'log' | 'info' | 'warn',
    message: any,
    queryRunner?: QueryRunner,
  ) {
    // Implemente o código para registrar mensagens de log gerais
    switch (level) {
      case 'log':
      case 'info':
        this.nestJsLog.debug(message);
        break;
      case 'warn':
        this.nestJsLog.warn(message);
        break;
      default:
        this.nestJsLog.debug(message);
        break;
    }
  }
}
