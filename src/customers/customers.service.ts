import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomersRepository } from './customers.repository';

@Injectable()
export class CustomersService {
  constructor(
    private redisService: RedisService,
    private customersRepository: CustomersRepository,
  ) {}

  async findOne(id: string) {
    const customer = await this.customersRepository.findById(id);

    if (!customer) {
      throw new NotFoundException();
    }

    return customer;
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<any> {
    return this.customersRepository.create(createCustomerDto);
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<any> {
    const customer = await this.findOne(id);

    if (updateCustomerDto?.id && updateCustomerDto.id !== customer.id) {
      if (await this.exists(updateCustomerDto.id)) {
        const message = `There's already a customer with id ${updateCustomerDto.id}`;
        throw new ConflictException(message);
      }

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

  private async exists(id: string): Promise<boolean> {
    const customer = await this.customersRepository.findById(id);

    return !!customer;
  }
}
