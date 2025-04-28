import { Injectable, NotFoundException } from '@nestjs/common';
import { SaleRepo } from './sale.repository';
import { ProductRepo } from 'src/product/product.repository';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SaleService {
  constructor(
    private readonly saleRepo: SaleRepo,
    private readonly productRepo: ProductRepo,
  ) {}

  async selectDailySale() {
    return await this.saleRepo.selectDailySale();
  }

  async createSale(data: CreateSaleDto[]) {
    for (const sale of data) {
      const product = await this.productRepo.selectByIDProduct(
        sale.item_barcode,
      );
      if (!product) {
        throw new NotFoundException(
          `Product not found with barcode: ${sale.item_barcode}`,
        );
      }
    }

    const result = await this.saleRepo.createSales(data);
    return result;
  }
}
