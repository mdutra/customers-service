import { Injectable, ConflictException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './customers.interface';

@Injectable()
export class CustomersRepository {
  constructor(private redisService: RedisService) {}

  async findById(id: string): Promise<Customer> {
    const customer = await this.redisService.getHash<Customer>('customers', id);

    if (!Object.keys(customer).length) {
      return null;
    }

    return { id, ...customer };
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const id = await this.redisService.newHash('customers', {
      ...createCustomerDto,
    });

    return { id, ...createCustomerDto };
  }

  async findByIdAndUpdate(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const existingCustomer = await this.findById(id);

    if (!existingCustomer) {
      return null;
    }

    if (updateCustomerDto?.id && updateCustomerDto.id !== id) {
      // update ID and contents
      return this.replaceContents(existingCustomer, updateCustomerDto);
    }

    // update only the contents
    const hash = await this.redisService.updateContentsById<Customer>(
      'customers',
      id,
      {
        name: updateCustomerDto.name,
        document: updateCustomerDto.document,
      },
    );

    return { id, ...hash };
  }

  private async replaceContents(
    customerSource: UpdateCustomerDto,
    customerTarget: UpdateCustomerDto,
  ): Promise<Customer> {
    await this.throwIfExists(customerTarget.id);

    const { id, name, document } = customerTarget;

    const updatedContents = {
      name: name ? name : customerSource.name,
      document: document ? document : customerSource.document,
    };

    const hash = await this.redisService.overwriteHash<Customer>(
      'customers',
      customerSource.id,
      id,
      updatedContents,
    );

    return { id, ...hash };
  }

  private async throwIfExists(id: string): Promise<void> {
    const customer = await this.findById(id);

    if (customer) {
      throw new ConflictException();
    }
  }
}
