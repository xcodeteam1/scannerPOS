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

  async createCategory(name: string, description: string, imageUrls: string[]) {
    return await this.categoryRepo.createCategory(name, description, imageUrls);
  }

  async updateCategory(
    id: number,
    name: string,
    description: string,
    imageUrls: string[],
  ) {
    const updated = await this.categoryRepo.updateCategory(
      id,
      name,
      description,
      imageUrls,
    );
    if (!updated) {
      throw new Error(`Category with id ${id} not found`);
    }
    return updated;
  }

  async patchCategory(id: number, name?: string, description?: string) {
    const patched = await this.categoryRepo.patchCategory(
      id,
      name,
      description,
    );
    if (!patched) {
      throw new Error(`Category with id ${id} not found`);
    }
    return patched;
  }
  async deleteCategory(id: number) {
    const deleted = await this.categoryRepo.deleteCategory(id);
    if (!deleted) {
      throw new Error(`Category with id ${id} not found`);
    }
    return deleted;
  }
}
