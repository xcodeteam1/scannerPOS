import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { BranchModule } from './branch/branch.module';
import { CashierModule } from './cashier/cashier.module';
import { ProductModule } from './product/product.module';
import { SaleModule } from './sale/sale.module';
import { DebtModule } from './debt/debt.module';
import { ReturnModule } from './return/return.module';
import { CustomerModule } from './customer/customer.module';

@Module({
  imports: [AdminModule, BranchModule, CashierModule, ProductModule, SaleModule, DebtModule, ReturnModule, CustomerModule],
})
export class AppModule {}
