import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import type { EnvironmentVariables } from '@/config/environment.js';

@Injectable()
export class RedisClient extends Redis implements OnModuleDestroy {
  constructor(config: ConfigService<EnvironmentVariables, true>) {
    super(config.get('REDIS_URL', { infer: true }));
  }

  async onModuleDestroy(): Promise<void> {
    await this.quit();
  }
}
