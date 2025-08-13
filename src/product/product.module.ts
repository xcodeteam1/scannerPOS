import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductRepo } from './product.repository';
import { ProductController } from './product.controller';
import { BranchRepo } from 'src/branch/branch.repository';
import { CategoryRepo } from 'src/category/category.repository';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductRepo, BranchRepo, CategoryRepo],
})
export class ProductModule {}
