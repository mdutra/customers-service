import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersRepository {
  constructor(private redisService: RedisService) {}

  async findById(id: string) {
    const customer = await this.redisService.getHash('customers', id);

    if (!Object.keys(customer).length) {
      return null;
    }

    return { id, ...customer };
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<any> {
    const id = await this.redisService.setHash('customers', {
      ...createCustomerDto,
    });

    return { id, ...createCustomerDto };
  }
}
