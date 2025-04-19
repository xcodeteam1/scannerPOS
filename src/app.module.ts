import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';
import { BranchModule } from './branch/branch.module';
import { CashierModule } from './cashier/cashier.module';

@Module({
  imports: [AdminModule, BranchModule, CashierModule],
  controllers: [AppController, AdminController],
  providers: [AppService],
})
export class AppModule {}
