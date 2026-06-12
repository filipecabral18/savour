import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  public readonly client: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379/0';
    // Handle ESM default export interop
    const RedisConstructor = (Redis as any).default || Redis;
    this.client = new RedisConstructor(redisUrl);
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
