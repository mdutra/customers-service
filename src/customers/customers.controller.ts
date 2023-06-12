import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  ParseUUIDPipe,
  UsePipes,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import {
  CreateCustomerDto,
  createCustomerSchema,
} from './dto/create-customer.dto';
import {
  UpdateCustomerDto,
  updateCustomerSchema,
} from './dto/update-customer.dto';
import { JoiValidationPipe } from '../pipes/joi-validation.pipe';

@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  @UsePipes(new JoiValidationPipe(createCustomerSchema))
  async create(@Body() createCustomerDto: CreateCustomerDto): Promise<void> {
    return this.customersService.create(createCustomerDto);
  }

  @Put(':id')
  @UsePipes(new JoiValidationPipe(updateCustomerSchema))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<void> {
    return this.customersService.update(id, updateCustomerDto);
  }
}
