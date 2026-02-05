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
import { Response } from 'express';
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
}
