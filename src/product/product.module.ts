import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductRepo } from './product.repository';
import { ProductController } from './product.controller';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductRepo],
})
export class ProductModule {}
