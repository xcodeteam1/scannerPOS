import { Injectable } from '@nestjs/common';
import { CategoryRepo } from './category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepo) {}

  async selectCategory() {
    return await this.categoryRepo.selectCategory();
  }

  async selectByIDCategory(id: number) {
    const category = await this.categoryRepo.selectByIDCategory(id);
    if (!category) {
      throw new Error(`Category with id ${id} not found`);
    }
    return category;
  }

  async createCategory(name: string, description: string) {
    return await this.categoryRepo.createCategory(name, description);
  }

  async updateCategory(id: number, name: string, description: string) {
    const updated = await this.categoryRepo.updateCategory(
      id,
      name,
      description,
    );
    if (!updated) {
      throw new Error(`Category with id ${id} not found`);
    }
    return updated;
  }

  async deleteCategory(id: number) {
    const deleted = await this.categoryRepo.deleteCategory(id);
    if (!deleted) {
      throw new Error(`Category with id ${id} not found`);
    }
    return deleted;
  }
}
