import { Injectable, NotFoundException } from '@nestjs/common';
import { ReturnRepo } from './return.repository';
import { CreateReturnDto } from './dto/create-return.dto';
import { ProductRepo } from 'src/product/product.repository';

@Injectable()
export class ReturnService {
  constructor(
    private readonly returnRepo: ReturnRepo,
    private readonly productRepo: ProductRepo,
  ) {}
  async selectAllReturn() {
    return await this.returnRepo.selectAllReturn();
  }
  async createReturn(data: CreateReturnDto) {
    const result1 = await this.productRepo.selectByIDProduct(data.item_barcode);
    if (!result1)
      throw new NotFoundException(
        `product is not found with barcode: ${data.item_barcode}`,
      );

    const result = await this.returnRepo.createReturn(data);
    return result;
  }
}
