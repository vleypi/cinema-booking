import { Global, Module } from '@nestjs/common';
import { RedisClient } from '@/common/redis/redis.client.js';

@Global()
@Module({
  providers: [RedisClient],
  exports: [RedisClient],
})
export class RedisModule {}
