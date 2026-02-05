import { Logger, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { Cacheable } from 'cacheable';
import { createKeyv } from '@keyv/redis';
import Keyv from 'keyv';
import { ConfigService } from '@nestjs/config';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Module({
  providers: [
    CacheService,
    {
      provide: 'CACHE_MANAGER',
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('RedisCacheOptions');

        const host = configService.get<string>('REDIS_HOST');
        const port = configService.get<string>('REDIS_PORT');
        const password = configService.get<string>('REDIS_PASSWORD');

        const redisUri = password
          ? `redis://:${password}@${host}:${port}`
          : `redis://${host}:${port}`;

        const redisAdapter = createKeyv(redisUri);

        try {
          // Testar conexão Redis com timeout
          const testKey = `test_cache_${Date.now()}`;
          const timeout = delay(3000).then(() => {
            throw new Error('Redis timeout');
          });

          const test = redisAdapter
            .set(testKey, 'ok', 1000)
            .then(() => redisAdapter.get(testKey));

          await Promise.race([test, timeout]);

          logger.log(`✅ Conectado ao Redis em: ${host}:${port}`);

          const redisCache = new Cacheable({
            primary: redisAdapter,
            ttl: '4h',
          });

          redisCache.on('error', (err) =>
            logger.error('❌ Erro em operação do Redis:', err),
          );

          return redisCache;
        } catch (err) {
          logger.error(
            '⚠️ Redis indisponível. Usando cache em memória.',
            err.message,
          );

          const memoryAdapter = new Keyv({ store: new Map() });
          const memoryCache = new Cacheable({
            primary: memoryAdapter,
            ttl: '4h',
          });

          return memoryCache;
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [CacheService, 'CACHE_MANAGER'],
})
export class CacheModule {}
