import { Injectable, Inject, BadGatewayException } from '@nestjs/common';
import Redis, { ReplyError } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async getHash(prefix: string, key: string): Promise<any> {
    this.checkRedisStatus();

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

  async setHash(prefix: string, data: Record<string, string>): Promise<string> {
    this.checkRedisStatus();

    const values = Object.entries(data).flat();
    const id = uuidv4();

    await this.redisClient.hmset(`${prefix}:${id}`, ...values);

    return id;
  }

  private checkRedisStatus() {
    if (this.redisClient.status === 'reconnecting') {
      throw new BadGatewayException('Cache unavailable');
    }
  }
}
