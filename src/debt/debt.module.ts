import { Module } from '@nestjs/common';
import { DebtController } from './debt.controller';
import { DebtService } from './debt.service';
import { DebtRepo } from './debt.repository';
import { CustomerRepo } from 'src/customer/customer.repository';
import { ProductRepo } from 'src/product/product.repository';

@Module({
  controllers: [DebtController],
  providers: [DebtService, DebtRepo, CustomerRepo, ProductRepo],
})
export class DebtModule {}
