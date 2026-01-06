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
      tegs: dto.tegs ?? [],
      imageUrls: dto.imageUrls ?? [], // image bilan hech narsa qilinmaydi
    });
  }
  // product.service.ts

  async deleteProductImages(barcode: string, removeImages: string[]) {
    const product = await this.productRepo.selectByIDProduct(barcode);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // PostgreSQL array ni to‘g‘ri o‘qiymiz
    let images: string[] = [];

    if (Array.isArray(product.image)) {
      images = [...product.image];
    } else if (typeof product.image === 'string') {
      images = product.image.replace(/[{}"]/g, '').split(',').filter(Boolean);
    }

    const filteredImages = images.filter((img) => !removeImages.includes(img));

    if (filteredImages.length === images.length) {
      throw new BadRequestException('Images not found');
    }

    return this.productRepo.updateProductImages(barcode, filteredImages);
  }
  // product.service.ts

  async addProductImages(barcode: string, addImages: string[]) {
    const product = await this.productRepo.selectByIDProduct(barcode);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // PostgreSQL array ni to‘g‘ri o‘qiymiz
    let images: string[] = [];

    if (Array.isArray(product.image)) {
      images = [...product.image];
    } else if (typeof product.image === 'string') {
      images = product.image.replace(/[{}"]/g, '').split(',').filter(Boolean);
    }

    const updatedImages = [...images, ...addImages];

    return this.productRepo.updateProductImages(barcode, updatedImages);
  }

  async updateProduct(barcode: string, dto: UpdateProductDto) {
    const product = await this.productRepo.selectByIDProduct(barcode);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    console.log('Update DTO:', dto);
    console.log('Barcode:', barcode);
    // Branch tekshirish
    if (dto.branch_id !== undefined) {
      const branch = await this.branchRepo.selectByIDBranch(dto.branch_id);
      if (!branch) {
        throw new NotFoundException('Branch not found');
      }
    }

    // Category tekshirish
    if (dto.category_id !== undefined) {
      const category = await this.categoryRepo.selectByIDCategory(
        dto.category_id,
      );
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    // Tegs → PostgreSQL array
    if (dto.tegs !== undefined) {
      dto.tegs =
        dto.tegs.length > 0
          ? (`{${dto.tegs.map((t) => `"${t}"`).join(',')}}` as any)
          : null;
    }

    return this.productRepo.updateProduct(barcode, dto);
  }

  async updateProductImages(
    barcode: string,
    dto: {
      addImages?: string[];
      removeImages?: string[];
      replaceImage?: {
        oldImage: string;
        newImage: string;
      };
    },
  ) {
    const product = await this.productRepo.selectByIDProduct(barcode);
    if (!product) throw new NotFoundException('Product not found');

    // ✅ ARRAY sifatida olamiz
    let images: string[] = Array.isArray(product.image)
      ? [...product.image]
      : [];

    // ❌ REMOVE
    if (dto.removeImages?.length) {
      images = images.filter((img) => !dto.removeImages.includes(img));
    }

    // ➕ ADD
    if (dto.addImages?.length) {
      images.push(...dto.addImages);
    }

    // 🔁 REPLACE
    if (dto.replaceImage) {
      const index = images.indexOf(dto.replaceImage.oldImage);
      if (index === -1) {
        throw new BadRequestException('Old image not found');
      }
      images[index] = dto.replaceImage.newImage;
    }

    return this.productRepo.updateProductImages(barcode, images);
  }
  async replaceProductImage(
    barcode: string,
    oldImage: string,
    newImage: string,
  ) {
    const product = await this.productRepo.selectByIDProduct(barcode);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // ✅ PostgreSQL array ni to‘g‘ri o‘qish
    let images: string[] = [];

    if (Array.isArray(product.image)) {
      images = [...product.image];
    } else if (typeof product.image === 'string') {
      images = product.image.replace(/[{}"]/g, '').split(',').filter(Boolean);
    }

    const index = images.indexOf(oldImage);
    if (index === -1) {
      throw new BadRequestException('Old image not found');
    }

    // 🔁 REPLACE
    images[index] = newImage;

    // ✅ repository faqat array qabul qiladi
    return this.productRepo.updateProductImages(barcode, images);
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
