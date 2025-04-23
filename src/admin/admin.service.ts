import { Injectable, NotFoundException } from '@nestjs/common';
import { CashiersRepo } from './admin.repository';
import { BranchRepo } from 'src/branch/branch.repository';

@Injectable()
export class AdminService {
  constructor(
    private readonly cashiersRepo: CashiersRepo,
    private readonly branchRepo: BranchRepo,
  ) {}
  async selectAllCashier() {
    return await this.cashiersRepo.selectAllCashier();
  }
  async selectByIDCashier(id: number) {
    const result = await this.cashiersRepo.selectByIDCashier(id);
    if (!result) throw new NotFoundException('cashier not found');
    return result;
  }
  async createCashier(data: {
    name: string;
    branch_id: number;
    password: string;
  }) {
    const result1 = await this.branchRepo.selectByIDBranch(data.branch_id);
    if (!result1) throw new NotFoundException('branch not found');
    const result = await this.cashiersRepo.createCashier(data);
    return result;
  }
  async updateCashier(
    id: number,
    data: {
      name: string;
      branch_id: number;
      password: string;
    },
  ) {
    const result1 = await this.branchRepo.selectByIDBranch(data.branch_id);
    if (!result1) throw new NotFoundException('branch not found');
    const result = await this.cashiersRepo.updateCashier(id, data);
    return result;
  }
  async deleteCashier(id: number) {
    const result = await this.cashiersRepo.deleteCashier(id);
    return result.length !== 0 ? 'succesfully deleting' : 'deleted';
  }
}
