import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepo } from './product.repository';

@Injectable()
export class ProductService {
  constructor(private readonly productRepo: ProductRepo) {}

  async selectAllProduct() {
    return await this.productRepo.selectAllProduct();
  }

  async selectByIDProduct(id: number) {
    const result = await this.productRepo.selectByIDProduct(id);
    if (!result)
      throw new NotFoundException(`product not found with id: ${id}`);
    return result;
  }
  async searchProduct(q: string) {
    const result = await this.productRepo.searchProduct(q);
    return result;
  }

  async createProduct(data: {
    barcode: string;
    name: string;
    price: number;
    stock: number;
    description: string;
  }) {
    const result = await this.productRepo.createProduct(data);
    return result;
  }

  async updateProduct(
    id: number,
    data: {
      barcode: string;
      name: string;
      price: number;
      stock: number;
      description: string;
    },
  ) {
    const result = await this.productRepo.updateProduct(id, data);
    return result;
  }

  async deleteProduct(id: number) {
    const result = await this.productRepo.deleteProductQuery(id);
    return result.length !== 0 ? 'succesfully deleting' : 'deleted';
  }
}
