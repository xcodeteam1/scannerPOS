import { Injectable } from '@nestjs/common';
import { CustomerRepo } from './customer.repository';

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepo: CustomerRepo) {}
  async selectCustomer() {
    return await this.customerRepo.selectCustomer();
  }
  async searchCustomer(name: string) {
    const result = await this.customerRepo.searchCustomer(name);
    return result;
  }
  async createCustomer(data: {
    customer_name: string;
    phone_number: string;
    description: string;
  }) {
    const result = await this.customerRepo.createCustomer(data);
    return result;
  }

  getCustomers(page: number, pageSize: number, name?: string) {
    return this.customerRepo.getCustomers(page, pageSize, name);
  }
}
