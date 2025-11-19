import { Inject, Injectable } from '@nestjs/common';
import { Cacheable } from 'cacheable';

@Injectable()
export class CacheService {
  constructor(@Inject('CACHE_MANAGER') private cacheManager: Cacheable) {}

  async get<T>(key: string): Promise<T> {
    return await this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number | string): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }
  async delete(key: string): Promise<void> {
    await this.cacheManager.delete(key);
  }
  async exists<T>(key: string, expectedValue: T): Promise<boolean> {
    const cachedValue = await this.cacheManager.get<T>(key);
    return cachedValue === expectedValue;
  }
  private minutosParaMs(minutos: number): number {
    return minutos * 60 * 1000;
  }
}
