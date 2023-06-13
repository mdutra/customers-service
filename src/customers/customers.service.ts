import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomersRepository } from './customers.repository';
import { Customer } from './customers.interface';

@Injectable()
export class CustomersService {
  constructor(private customersRepository: CustomersRepository) {}

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customersRepository.findById(id);

    if (!customer) {
      throw new NotFoundException();
    }

    return customer;
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    return this.customersRepository.create(createCustomerDto);
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
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
