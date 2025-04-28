import { Module } from '@nestjs/common';
import { ReturnController } from './return.controller';
import { ReturnService } from './return.service';
import { ReturnRepo } from './return.repository';
import { ProductRepo } from 'src/product/product.repository';

@Module({
  controllers: [ReturnController],
  providers: [ReturnService, ReturnRepo, ProductRepo],
})
export class ReturnModule {}
