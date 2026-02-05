import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PdfProcessingService } from '../services/pdf-processing.service';

@Injectable()
export class PdfCronTask implements OnModuleInit {
  private readonly logger = new Logger(PdfProcessingService.name);

  constructor(private readonly pdfService: PdfProcessingService) {}
  async onModuleInit() {
    await this.pdfService.processarPasta();
  }

  //@Cron('*/1 * * * *')
  async handleCron() {
    this.logger.debug('Executando cron...');
    await this.pdfService.processarPasta();
  }
}
