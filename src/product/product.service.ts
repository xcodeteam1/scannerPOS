import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepo } from './product.repository';
import { BranchRepo } from 'src/branch/branch.repository';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepo: ProductRepo,
    private readonly branchRepo: BranchRepo,
  ) {}

  async selectAllProduct(page: number) {
    const pageSize = 10;
    return await this.productRepo.selectAllProduct(page, pageSize);
  }

  async selectByIDProduct(id: string) {
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
    branch_id: number;
    price: number;
    stock: number;
    real_price: number;
    description: string;
    imageUrls?: string[];
  }) {
    const result1 = await this.productRepo.selectByIDProduct(data.barcode);
    if (result1)
      throw new NotFoundException(`product is  found with id: ${data.barcode}`);

    const result2 = await this.branchRepo.selectByIDBranch(data.branch_id);
    if (!result2)
      throw new NotFoundException(
        `branch not  found with id: ${data.branch_id}`,
      );

    const result = await this.productRepo.createProduct(data);
    return result;
  }

  async updateProduct(
    barcode: string,
    data: {
      barcode: string;
      name: string;
      branch_id: number;
      price: number;
      stock: number;
      real_price: number;
      description: string;
      imageUrls?: string[];
    },
  ) {
    const result1 = await this.productRepo.selectByIDProduct(barcode);
    if (!result1)
      throw new NotFoundException(
        `product is not   found with id: ${data.barcode}`,
      );

    const result2 = await this.branchRepo.selectByIDBranch(data.branch_id);
    if (!result2)
      throw new NotFoundException(
        `branch not  found with id: ${data.branch_id}`,
      );

    const result = await this.productRepo.updateProduct(barcode, data);
    return result;
  }

  async deleteProduct(barcode: string) {
    const result1 = await this.productRepo.selectByIDProduct(barcode);
    if (!result1)
      throw new NotFoundException(
        `product not  found with barcode: ${barcode}`,
      );
    await this.productRepo.deleteProductQuery(barcode);
    return 'succesfully deleting';
  }
}
