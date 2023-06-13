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
    const customer = await this.customersRepository.findByIdAndUpdate(
      id,
      updateCustomerDto,
    );

    if (!customer) {
      throw new NotFoundException();
    }

    return customer;
  }
}
