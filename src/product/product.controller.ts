import * as dotenv from 'dotenv';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/common/middleware/multer.config';
import { SelectAllProductQueryDto } from './dto/select-all-product.dto';
import { PatchProductDto } from './dto/patch-product.dto';
dotenv.config();

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @HttpCode(200)
  @Get('list')
  selectAllProductCont(@Query() query: SelectAllProductQueryDto) {
    return this.service.selectAllProduct(query.page, query.pageSize, query.q);
  }

  @HttpCode(200)
  @Get('search')
  searchProductCont(@Query('q') q: string) {
    return this.service.searchProduct(q);
  }

  @HttpCode(200)
  @Get(':barcode')
  selectByIDProductCont(@Param('barcode') barcode: string) {
    return this.service.selectByIDProduct(barcode);
  }

  @HttpCode(201)
  @Post('create')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        barcode: { type: 'string' },
        name: { type: 'string' },
        branch_id: { type: 'number' },
        category_id: { type: 'number' },
        price: { type: 'number' },
        real_price: { type: 'number' },
        stock: { type: 'number' },
        description: { type: 'string' },
        tegs: {
          type: 'array',
          items: { type: 'string', enum: ['new', 'hit', 'sale'] },
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async createProductCont(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateProductDto,
  ) {
    const imageUrls = Array.isArray(files)
      ? files.map((file) => `${process.env.BACKEND_URL}/${file?.filename}`)
      : [];
    console.log('hello');
    console.log(body.tegs);
    return this.service.createProduct({ ...body, imageUrls });
  }

  @HttpCode(200)
  @Put('/update/:barcode')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        barcode: { type: 'string' },
        name: { type: 'string' },
        branch_id: { type: 'number' },
        category_id: { type: 'number' },
        price: { type: 'number' },
        stock: { type: 'number' },
        real_price: { type: 'number' },
        description: { type: 'string' },
        tegs: {
          type: 'array',
          items: { type: 'string', enum: ['new', 'hit', 'sale'] },
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  async updateProduct(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('barcode') barcode: string,
    @Body() body: UpdateProductDto,
  ) {
    // Yangi yuklangan rasmlar
    const uploadedImages = Array.isArray(files)
      ? files.map((file) => `${process.env.BACKEND_URL}/${file?.filename}`)
      : [];

    // Faqat kelgan fieldlarni yig‘amiz
    const updateData: any = { ...body };

    if (uploadedImages.length > 0) {
      updateData.imageUrls = uploadedImages;
    }

    return this.service.updateProduct(barcode, updateData);
  }

  @HttpCode(200)
  @Put('/images/:barcode')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        addImages: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        removeImages: {
          type: 'array',
          items: { type: 'string' },
        },
        replaceImage: {
          type: 'object',
          properties: {
            oldImage: { type: 'string' },
            newImage: { type: 'string', format: 'binary' },
          },
        },
      },
    },
  })
  async updateProductImages(
    @Param('barcode') barcode: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    const uploadedImages = files?.map(
      (f) => `${process.env.BACKEND_URL}/${f.filename}`,
    );

    return this.service.updateProductImages(barcode, {
      addImages: uploadedImages,
      removeImages: body.removeImages,
      replaceImage: body.replaceImage,
    });
  }

  @HttpCode(200)
  // @Patch('/patch/:barcode')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        barcode: { type: 'string' },
        name: { type: 'string' },
        branch_id: { type: 'number' },
        category_id: { type: 'number' },
        price: { type: 'number' },
        stock: { type: 'number' },
        real_price: { type: 'number' },
        description: { type: 'string' },
      },
    },
  })
  async patchProduct(
    @Param('barcode') barcode: string,
    @Body() body: PatchProductDto,
  ) {
    return this.service.patchProduct(barcode, body);
  }
  @HttpCode(200)
  @Delete('/delete/:barcode')
  deleteProductCont(@Param('barcode') barcode: string) {
    return this.service.deleteProduct(barcode);
  }
}
