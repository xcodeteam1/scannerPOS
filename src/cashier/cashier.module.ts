import { Module } from '@nestjs/common';
import { CashierController } from './cashier.controller';
import { CashierService } from './cashier.service';

@Module({
  controllers: [CashierController],
  providers: [CashierService]
})
export class CashierModule {}
