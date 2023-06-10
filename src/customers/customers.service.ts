import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CustomersService {
  constructor(private redisService: RedisService) {}

  async findOne(id: string) {
    return this.redisService.getHash('customers', id);
  }
}
