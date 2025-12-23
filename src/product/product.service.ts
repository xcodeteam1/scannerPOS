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

  async selectAllProduct(page: number, pageSize: number, q?: string) {
    if (page <= 0 || pageSize <= 0) {
      throw new BadRequestException('Page and pageSize must be greater than 0');
    }
    return this.productRepo.getProducts(page, pageSize, q);
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

    // Faqat array sifatida yuboramiz, stringga aylantirmaymiz
    return this.productRepo.createProduct({
      barcode: dto.barcode,
      name: dto.name,
      branch_id: dto.branch_id,
      price: dto.price,
      stock: dto.stock,
      real_price: dto.real_price,
      category_id: dto.category_id,
      description: dto.description,
      tegs: dto.tegs, // shu yerda array
      imageUrls: dto.imageUrls ?? [], // image bilan hech narsa qilinmaydi
    });
  }

  async updateProduct(barcode: string, dto: UpdateProductDto) {
    const product = await this.productRepo.selectByIDProduct(barcode);
    if (!product) throw new NotFoundException(`Product not found`);

    // Branch va category tekshirish
    if (dto.branch_id !== undefined) {
      const branch = await this.branchRepo.selectByIDBranch(dto.branch_id);
      if (!branch) throw new NotFoundException(`Branch not found`);
    }
    if (dto.category_id !== undefined) {
      const category = await this.categoryRepo.selectByIDCategory(
        dto.category_id,
      );
      if (!category) throw new NotFoundException(`Category not found`);
    }

    // Tegsni PostgreSQL array formatiga o‘zgartirish
    if (dto.tegs && dto.tegs.length > 0) {
      dto.tegs = `{${dto.tegs.map((t) => `"${t}"`).join(',')}}` as any;
    }

    // Images append/remove logikasi
    let currentImages: string[] = product.image
      ? product.image.replace(/[{}"]/g, '').split(',')
      : [];

    if (dto.addImages && dto.addImages.length > 0) {
      currentImages.push(...dto.addImages);
    }

    if (dto.removeImages && dto.removeImages.length > 0) {
      currentImages = currentImages.filter(
        (img) => !dto.removeImages.includes(img),
      );
    }

    dto.imageUrls = currentImages.length > 0 ? currentImages : undefined;

    return this.productRepo.updateProduct(barcode, dto);
  }

  async patchProduct(barcode: string, dto: Partial<UpdateProductDto>) {
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

    if (dto.tegs !== undefined && dto.tegs.length > 0) {
      dto.tegs = `{${dto.tegs.map((t) => `"${t}"`).join(',')}}` as any;
    }

    return this.productRepo.updateProduct(barcode, dto as any);
  }

  async deleteProduct(barcode: string) {
    const product = await this.productRepo.selectByIDProduct(barcode);
    if (!product) {
      throw new NotFoundException(`Product not found with barcode: ${barcode}`);
    }
    await this.productRepo.deleteProduct(barcode);
    return { message: 'Successfully deleted' };
  }
}
