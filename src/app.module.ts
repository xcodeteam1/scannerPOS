import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { BranchModule } from './branch/branch.module';
import { CashierModule } from './cashier/cashier.module';

@Module({
  imports: [AdminModule, BranchModule, CashierModule],
})
export class AppModule {}
