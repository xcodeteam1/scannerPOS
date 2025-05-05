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
  async selectPending() {
    return await this.debtRepo.selectPending();
  }
  async selectOldest() {
    return await this.debtRepo.selectOldest();
  }
  async amountAllDebt(customer_id: number) {
    const customer = await this.customerRepo.selectByIDCustomer(customer_id);
    if (!customer) {
      throw new NotFoundException(`customer not found with id: ${customer_id}`);
    }
    return await this.debtRepo.amountAllDebt(customer_id);
  }
  async amountDebt(id: number) {
    return await this.debtRepo.amountDebt(id);
  }
  async selectAllDebt(page: number, pageSize: number) {
    return await this.debtRepo.selectAllDebt(page, pageSize);
  }
  async selectRecent() {
    return await this.debtRepo.selectRecent();
  }
  async searchDebt(name: string) {
    return await this.debtRepo.searchCustomer(name);
  }
  async debtHIstoryByCustomer(customer_id: number) {
    return await this.debtRepo.debtHIstoryByCustomer(customer_id);
  }
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
