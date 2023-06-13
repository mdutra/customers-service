import { Injectable, Inject, BadGatewayException } from '@nestjs/common';
import Redis, { ReplyError } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async getHash(prefix: string, key: string): Promise<Record<string, string>> {
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

  async newHash(prefix: string, data: Record<string, string>): Promise<string> {
    this.checkRedisStatus();

    const values = Object.entries(data).flat();
    const id = uuidv4();

    await this.redisClient.hmset(`${prefix}:${id}`, ...values);

    return id;
  }

  async updateContentsById(
    prefix: string,
    id: string,
    data: Record<string, string>,
  ): Promise<Record<string, string>> {
    this.checkRedisStatus();

    const values = Object.entries(data).flat();

    await this.redisClient.hmset(`${prefix}:${id}`, ...values);

    return data;
  }

  async overwriteHash(
    prefix: string,
    hashIdToDelete: string,
    newId: string,
    newData: Record<string, string>,
  ): Promise<Record<string, string>> {
    this.checkRedisStatus();

    const values = Object.entries(newData).flat();

    // Run del() + hmset() as an atomic operation
    await this.redisClient
      .multi()
      .hmset(`${prefix}:${newId}`, ...values)
      .del(`${prefix}:${hashIdToDelete}`)
      .exec();

    return newData;
  }

  private checkRedisStatus() {
    if (this.redisClient.status === 'reconnecting') {
      throw new BadGatewayException('Cache unavailable');
    }
  }
}
