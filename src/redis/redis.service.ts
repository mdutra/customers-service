import { Injectable, Inject } from '@nestjs/common';
import Redis, { ReplyError } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async getHash(prefix: string, key: string): Promise<any> {
    try {
      return this.redisClient.hgetall(`${prefix}:${key}`);
    } catch (err) {
      if (err instanceof ReplyError) {
        console.warn(`type of ${key} is not a hash`);
        return null;
      } else {
        throw err;
      }
    }
  }
}
