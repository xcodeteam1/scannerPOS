import { Injectable, NotFoundException } from '@nestjs/common';
import { DebtRepo } from './debt.repository';
import { CreateDebtDto } from './dto/create-debt.dto';
import { CustomerRepo } from 'src/customer/customer.repository';
import { ProductRepo } from 'src/product/product.repository';

@Injectable()
export class DebtService {
  constructor(
    private readonly debtRepo: DebtRepo,
    private readonly customerRepo: CustomerRepo,
    private readonly productRepo: ProductRepo,
  ) {}
  async createDebt(data: CreateDebtDto[]) {
    for (const debt of data) {
      const customer = await this.customerRepo.selectByIDCustomer(
        debt.customer_id,
      );
      if (!customer) {
        throw new NotFoundException(
          `customer not found with barcode: ${debt.customer_id}`,
        );
      }
    }
    for (const debt of data) {
      const product = await this.productRepo.selectByIDProduct(
        debt.item_barcode,
      );
      console.log(product);
      if (!product) {
        throw new NotFoundException(
          `product not found with barcode: ${debt.item_barcode}`,
        );
      }
    }
    const result = await this.debtRepo.createDebt(data);
    return result;
  }
}
