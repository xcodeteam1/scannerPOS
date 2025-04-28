import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerRepo } from './customer.repository';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService, CustomerRepo],
})
export class CustomerModule {}
