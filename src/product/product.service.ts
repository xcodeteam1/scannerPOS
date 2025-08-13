import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ProductRepo } from './product.repository';
import { BranchRepo } from 'src/branch/branch.repository';
import { CategoryRepo } from 'src/category/category.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepo: ProductRepo,
    private readonly branchRepo: BranchRepo,
    private readonly categoryRepo: CategoryRepo,
  ) {}

  async selectAllProduct(page: number, pageSize: number) {
    if (page <= 0 || pageSize <= 0) {
      throw new BadRequestException('Page and pageSize must be greater than 0');
    }
    return this.productRepo.selectAllProduct(page, pageSize);
  }

  async selectByIDProduct(barcode: string) {
    const result = await this.productRepo.selectByIDProduct(barcode);
    if (!result) {
      throw new NotFoundException(`Product not found with barcode: ${barcode}`);
    }
    return result;
  }

  async searchProduct(q: string) {
    if (!q || q.trim() === '') {
      throw new BadRequestException('Search query cannot be empty');
    }
    return this.productRepo.searchProduct(q);
  }

  async createProduct(dto: CreateProductDto) {
    const existingProduct = await this.productRepo.selectByIDProduct(
      dto.barcode,
    );
    if (existingProduct) {
      throw new BadRequestException(
        `Product already exists with barcode: ${dto.barcode}`,
      );
    }

    const branch = await this.branchRepo.selectByIDBranch(dto.branch_id);
    if (!branch) {
      throw new NotFoundException(`Branch not found with id: ${dto.branch_id}`);
    }

    if (!dto.category_id) {
      throw new BadRequestException('category_id is required');
    }

    const category = await this.categoryRepo.selectByIDCategory(
      dto.category_id,
    );
    if (!category) {
      throw new NotFoundException(
        `Category not found with id: ${dto.category_id}`,
      );
    }

    return this.productRepo.createProduct({
      barcode: dto.barcode,
      name: dto.name,
      branch_id: dto.branch_id,
      price: dto.price,
      stock: dto.stock,
      real_price: dto.real_price,
      category_id: dto.category_id,
      description: dto.description,
      imageUrls: dto.imageUrls ?? [],
    });
  }

  async updateProduct(barcode: string, dto: UpdateProductDto) {
    const product = await this.productRepo.selectByIDProduct(barcode);
    if (!product) {
      throw new NotFoundException(`Product not found with barcode: ${barcode}`);
    }

    if (dto.branch_id) {
      const branch = await this.branchRepo.selectByIDBranch(dto.branch_id);
      if (!branch) {
        throw new NotFoundException(
          `Branch not found with id: ${dto.branch_id}`,
        );
      }
    }

    if (dto.category_id) {
      const category = await this.categoryRepo.selectByIDCategory(
        dto.category_id,
      );
      if (!category) {
        throw new NotFoundException(
          `Category not found with id: ${dto.category_id}`,
        );
      }
    }

    return this.productRepo.updateProduct(barcode, {
      barcode: dto.barcode ?? barcode,
      name: dto.name ?? product.name,
      branch_id: dto.branch_id ?? product.branch_id,
      price: dto.price ?? product.price,
      stock: dto.stock ?? product.stock,
      real_price: dto.real_price ?? product.real_price,
      category_id: dto.category_id ?? product.category_id,
      description: dto.description ?? product.description,
      imageUrls: dto.imageUrls ?? product.image,
    });
  }

  async deleteProduct(barcode: string) {
    const product = await this.productRepo.selectByIDProduct(barcode);
    if (!product) {
      throw new NotFoundException(`Product not found with barcode: ${barcode}`);
    }
    await this.productRepo.deleteProductQuery(barcode);
    return { message: 'Successfully deleted' };
  }
}
