import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductRepo } from './product.repository';
import { ProductController } from './product.controller';
import { BranchRepo } from 'src/branch/branch.repository';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductRepo, BranchRepo],
})
export class ProductModule {}
