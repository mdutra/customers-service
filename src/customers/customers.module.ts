import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { RedisModule } from '../redis/redis.module';
import { CustomersRepository } from './customers.repository';

@Module({
  imports: [RedisModule],
  controllers: [CustomersController],
  providers: [CustomersService, CustomersRepository],
})
export class CustomersModule {}
