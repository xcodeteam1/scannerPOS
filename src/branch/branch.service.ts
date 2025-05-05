import { Injectable, NotFoundException } from '@nestjs/common';
import { BranchRepo } from './branch.repository';

@Injectable()
export class BranchService {
  constructor(private readonly branchRepo: BranchRepo) {}

  async selectAllBranch(page: number, pageSize: number) {
    return await this.branchRepo.selectAllBranch(page, pageSize);
  }

  async selectByIDBranch(id: number) {
    const result = await this.branchRepo.selectByIDBranch(id);
    if (!result) throw new NotFoundException(`branch not found with id: ${id}`);
    return result;
  }
  async searchBranch(name: string) {
    return await this.branchRepo.searchBranch(name);
  }
  async createBranch(data: { name: string; address: string; contact: string }) {
    const result = await this.branchRepo.createBranch(data);
    return result;
  }
  async updateBranch(
    id: number,
    data: { name: string; address: string; contact: string },
  ) {
    const result = await this.branchRepo.updateBranch(id, data);
    return result;
  }
  async deleteBranch(id: number) {
    const result = await this.branchRepo.deleteBranch(id);
    return result.length !== 0 ? 'succesfully deleting' : 'deleted';
  }
}
