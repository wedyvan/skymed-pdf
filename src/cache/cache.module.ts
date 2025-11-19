import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheModule as CModule } from '@nestjs/cache-manager';
import { RedisOptionsYet } from '../config/app-options.constants';
@Module({
  imports: [CModule.registerAsync(RedisOptionsYet)],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
