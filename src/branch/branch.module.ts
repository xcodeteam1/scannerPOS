import { Module } from '@nestjs/common';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';

@Module({
  controllers: [BranchController],
  providers: [BranchService]
})
export class BranchModule {}
