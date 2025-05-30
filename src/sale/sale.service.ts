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
    const result = await this.saleRepo.selectDailySale();
    let sum = 0;

    for (const res of result) {
      sum += Number(res.cashier_price);
    }

    return {
      data: result,
      total_price: sum,
    };
  }

  async createSale(data: CreateSaleDto[]) {
    for (const sale of data) {
      const product = await this.productRepo.selectByIDProduct(
        sale.item_barcode,
      );
      const cashier = await this.saleRepo.selectByIDCashier(sale.cashier_id);
      if (cashier.length == 0) {
        throw new NotFoundException(
          `cashier not found with id: ${sale.cashier_id}`,
        );
      }
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
