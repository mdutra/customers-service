import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private redisService: RedisService) {}

  async findOne(id: string) {
    const customer = await this.redisService.getHash('customers', id);

    if (!Object.keys(customer).length) {
      throw new NotFoundException();
    }

    return {
      id,
      ...customer,
    };
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

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<any> {
    const customer = await this.findOne(id);

    if (updateCustomerDto?.id && updateCustomerDto.id !== customer.id) {
      const updatedCustomer = {
        ...customer,
        ...updateCustomerDto,
      };
      delete updatedCustomer.id;

      await this.redisService.moveAndUpdateHash(
        'customers',
        id,
        updateCustomerDto.id,
        updatedCustomer,
      );

      return {
        id: updateCustomerDto.id,
        ...updatedCustomer,
      };
    } else {
      await this.redisService.updateHash('customers', id, {
        ...updateCustomerDto,
      });

      return {
        id,
        ...customer,
        ...updateCustomerDto,
      };
    }
  }
}
