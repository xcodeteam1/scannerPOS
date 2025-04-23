import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CashiersRepo } from './admin.repository';
import { AdminController } from './admin.controller';
import { BranchModule } from 'src/branch/branch.module';

@Module({
  imports: [BranchModule],
  controllers: [AdminController],
  providers: [AdminService, CashiersRepo],
})
export class AdminModule {}
