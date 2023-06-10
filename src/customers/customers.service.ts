import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private redisService: RedisService) {}

  async findOne(id: string) {
    return this.redisService.getHash('customers', id);
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<any> {
    const id = await this.redisService.setHash('customers', {
      ...createCustomerDto,
    });

    return {
      id,
      ...createCustomerDto,
    };
  }
}
