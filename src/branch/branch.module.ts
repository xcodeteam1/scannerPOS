import { Module } from '@nestjs/common';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { BranchRepo } from './branch.repository';

@Module({
  controllers: [BranchController],
  providers: [BranchService, BranchRepo],
})
export class BranchModule {}
