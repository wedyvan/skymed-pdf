import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { TypeOrmRepository } from './type-orm/type-orm.repository';
import { Response } from 'express';
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly typeOrmService: TypeOrmRepository) {}
}
