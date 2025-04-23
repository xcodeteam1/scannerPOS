import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { BranchModule } from './branch/branch.module';
import { CashierModule } from './cashier/cashier.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [AdminModule, BranchModule, CashierModule, ProductModule],
})
export class AppModule {}
