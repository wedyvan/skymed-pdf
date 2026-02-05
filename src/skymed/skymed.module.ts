import { Module } from '@nestjs/common';
import { SkymedOrmRepository } from './repositories/skymed-repository';
import { FileStorageService } from './services/file-storage-service.service';
import { PdfProcessingService } from './services/pdf-processing.service';
import { DataBaseModule } from '../data-base/data-base.module';
import { PdfCronTask } from './tasks/pdf-cron.task';

@Module({
  imports: [DataBaseModule],
  providers: [
    FileStorageService,
    PdfProcessingService,
    SkymedOrmRepository,
    PdfCronTask,
  ],
  exports: [SkymedOrmRepository],
})
export class SkymedModule {}
