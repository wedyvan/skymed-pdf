import { Module } from '@nestjs/common';
import { SkymedOrmRepository } from './repositories/skymed-repository';
import { FileStorageService } from './services/file-storage-service.service';
import { PdfProcessingService } from './services/pdf-processing.service';
import { DataBaseModule } from '../data-base/data-base.module';
import { PdfCronTask } from './tasks/pdf-cron.task';
import { SkymedService } from './services/skymed.service';

@Module({
  imports: [DataBaseModule],
  providers: [
    PdfProcessingService,
    FileStorageService,
    PdfProcessingService,
    SkymedOrmRepository,
    SkymedService,
    PdfCronTask,
  ],
  exports: [SkymedOrmRepository],
})
export class SkymedModule {}
