import { Injectable, ConflictException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

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
    const id = await this.redisService.newHash('customers', {
      ...createCustomerDto,
    });

    return { id, ...createCustomerDto };
  }

  async findByIdAndUpdate(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<any> {
    const existingCustomer = await this.findById(id);

    if (!existingCustomer) {
      return null;
    }

    if (updateCustomerDto?.id && updateCustomerDto.id !== id) {
      // update ID and contents
      return this.replaceContents(existingCustomer, updateCustomerDto);
    }

    // update only the contents
    const hash = await this.redisService.updateContentsById('customers', id, {
      name: updateCustomerDto.name,
      document: updateCustomerDto.document,
    });

    return { id, ...hash };
  }

  private async replaceContents(
    customerSource: UpdateCustomerDto,
    customerTarget: UpdateCustomerDto,
  ): Promise<any> {
    await this.throwIfExists(customerTarget.id);

    const { id, name, document } = customerTarget;

    const updatedContents = {
      name: name ? name : customerSource.name,
      document: document ? document : customerSource.document,
    };

    const hash = await this.redisService.overwriteHash(
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
