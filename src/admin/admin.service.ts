import { Injectable, NotFoundException } from '@nestjs/common';
import { CashiersRepo } from './admin.repository';
import { BranchRepo } from 'src/branch/branch.repository';
import { compare } from 'bcrypt';
import { generateJWT } from 'lib/jwt';

@Injectable()
export class AdminService {
  constructor(
    private readonly cashiersRepo: CashiersRepo,
    private readonly branchRepo: BranchRepo,
  ) {}

  async allLogin(data: { login: string; password: string }) {
    const result1 = await this.cashiersRepo.selectByLoginAdmin(data.login);
    const result2 = await this.cashiersRepo.selectByloginCashier(data.login);

    const user = result1[0] || result2[0];
    if (!user) throw new NotFoundException('user not found');

    const isMatch = await compare(data.password, user.password);
    if (!isMatch) throw new NotFoundException('parol is incorrect');
    const token = generateJWT(user);

    const { password, ...safeUser } = user;
    return { user: safeUser, token };
  }
  async selectAllCashier(page: number) {
    const pageSize = 10;

    await this.cashiersRepo.createAdminIfNotExists('admin', 'admin123');
    return await this.cashiersRepo.selectAllCashier(page, pageSize);
  }
  async selectByIDCashier(id: number) {
    const result = await this.cashiersRepo.selectByIDCashier(id);
    if (!result) throw new NotFoundException('cashier not found');
    return result;
  }
  async searchCashier(name: string) {
    return await this.cashiersRepo.searchCashier(name);
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
