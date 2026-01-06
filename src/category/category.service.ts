import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  getCategories(page: number, pageSize: number, q?: string) {
    return this.categoryRepo.getCategories(page, pageSize, q);
  }

  async createCategory(name: string, description: string, imageUrls: string[]) {
    return await this.categoryRepo.createCategory(name, description, imageUrls);
  }

  async updateCategory(
    id: number,
    data: { name?: string; description?: string; imageUrls?: string[] },
  ) {
    const updated = await this.categoryRepo.updateCategory(id, data);

    if (!updated) {
      throw new Error(`Category with id ${id} not found`);
    }

    return updated;
  }
  async addCategoryImages(id: number, newImages: string[]) {
    const category = await this.categoryRepo.selectByIDCategory(id);

    if (!category) {
      throw new NotFoundException(`Category not found with id: ${id}`);
    }

    // PostgreSQL ARRAY → JS ARRAY
    let images: string[] = [];

    if (Array.isArray(category.image)) {
      images = [...category.image];
    } else if (typeof category.image === 'string') {
      images = category.image.replace(/[{}"]/g, '').split(',').filter(Boolean);
    }

    // ➕ faqat qo‘shamiz
    images.push(...newImages);

    return this.categoryRepo.updateCategoryImages(id, images);
  }
  async deleteCategoryImages(id: number, removeImages: string[]) {
    const category = await this.categoryRepo.selectByIDCategory(id);

    if (!category) {
      throw new NotFoundException(`Category not found with id: ${id}`);
    }

    // PostgreSQL ARRAY → JS ARRAY
    let images: string[] = [];

    if (Array.isArray(category.image)) {
      images = [...category.image];
    } else if (typeof category.image === 'string') {
      images = category.image.replace(/[{}"]/g, '').split(',').filter(Boolean);
    }

    const originalLength = images.length;

    // ❌ DELETE
    images = images.filter((img) => !removeImages.includes(img));

    if (images.length === originalLength) {
      throw new BadRequestException('Images not found for deletion');
    }

    return this.categoryRepo.updateCategoryImagesdelete(id, images);
  }
  async replaceCategoryImage(id: number, oldImage: string, newImage: string) {
    const category = await this.categoryRepo.selectByIDCategory(id);

    if (!category) {
      throw new NotFoundException(`Category not found with id: ${id}`);
    }

    // PostgreSQL ARRAY → JS ARRAY
    let images: string[] = [];

    if (Array.isArray(category.image)) {
      images = [...category.image];
    } else if (typeof category.image === 'string') {
      images = category.image.replace(/[{}"]/g, '').split(',').filter(Boolean);
    }

    const index = images.indexOf(oldImage);

    if (index === -1) {
      throw new BadRequestException('Old image not found');
    }

    // 🔁 REPLACE
    images[index] = newImage;

    return this.categoryRepo.updateCategoryImagesReplace(id, images);
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
