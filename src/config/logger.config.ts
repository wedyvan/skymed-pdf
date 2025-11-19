import { ConfigService } from '@nestjs/config';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModuleOptions,
} from 'nest-winston';
import * as winston from 'winston';
import { format } from 'winston';
const { label, timestamp, prettyPrint, json, errors } = format;
import * as DailyRotateFile from 'winston-daily-rotate-file';
const CATEGORY = 'Log Rotation';

const configService = new ConfigService();
const logLevel = configService.get<string>('LOG_LEVEL', 'info');

export const winstonConfig: WinstonModuleOptions = {
  levels: winston.config.npm.levels,
  level: logLevel, // Nível mínimo de log a ser exibido
  format: winston.format.combine(
    label({ label: CATEGORY }),
    timestamp({
      format: 'DD-MMM-YYYY HH:mm:ss',
    }),
    prettyPrint(),
    json(),
    errors({ stack: true }),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike(),
      ),
    }),
    new DailyRotateFile({
      filename: 'logs/%DATE%-error.log', // O padrão %DATE% será substituído pela data no formato YYYY-MM-DD
      level: 'error',
      datePattern: 'DD-MM-YYYY',
      zippedArchive: false,
      maxFiles: '7d',
    }),
    new DailyRotateFile({
      filename: 'logs/%DATE%-info.log',
      level: 'info',
      datePattern: 'DD-MM-YYYY',
      zippedArchive: false,
      maxFiles: '7d',
    }),
    new DailyRotateFile({
      filename: 'logs/%DATE%-debug.log',
      level: 'debug',
      datePattern: 'DD-MM-YYYY',
      zippedArchive: false,
      maxFiles: '7d',
    }),
    new DailyRotateFile({
      filename: 'logs/%DATE%-warn.log',
      level: 'warn',
      datePattern: 'DD-MM-YYYY',
      zippedArchive: false,
      maxFiles: '7d',
    }),
  ],
};
