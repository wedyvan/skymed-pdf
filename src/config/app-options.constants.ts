import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';
import { Logger } from '@nestjs/common';

export const RedisCacheOptions: CacheModuleAsyncOptions = {
  isGlobal: true,
  useFactory: async (configService: ConfigService) => {
    const logger = new Logger('RedisCacheOptions');
    const host = configService.get<string>('REDIS_HOST');
    const port = configService.get<string>('REDIS_PORT');
    const password = configService.get<string>('REDIS_PASSWORD');

    const redisUri = password
      ? `redis://:${password}@${host}:${port}`
      : `redis://${host}:${port}`;

    logger.debug(`🔄 Conectando ao Redis em: ${redisUri}`);

    try {
      const redisCache = new KeyvRedis(redisUri);
      redisCache.on('error', (err) => console.error('❌ Erro no Redis:', err));
      const store = new Keyv({ store: redisCache });

      return {
        store,
        ttl: 10000 * 60,
      };
    } catch (error) {
      logger.error('❌ Erro ao conectar ao Redis:', error);
      throw error;
    }
  },
  inject: [ConfigService],
};
