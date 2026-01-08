import * as dotenv from 'dotenv';
import {
  BadRequestException,
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
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
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
    return this.service.selectAllProduct(
      Number(query.page),
      Number(query.pageSize),
      query.q,
      query.tegs,
    );
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
      required: ['barcode', 'name', 'branch_id', 'category_id'],

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
  @ApiConsumes('application/json') // 🔥 MUHIM
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Product name' },
        branch_id: { type: 'number', example: 1 },
        category_id: { type: 'number', example: 2 },
        price: { type: 'number', example: 12000 },
        stock: { type: 'number', example: 5 },
        real_price: { type: 'number', example: 10000 },
        description: { type: 'string', example: 'Some description' },
        tegs: {
          type: 'array',
          items: { type: 'string', enum: ['new', 'hit', 'sale'] },
          example: ['new'],
        },
      },
    },
  })
  async updateProduct(
    @Param('barcode') barcode: string,
    @Body() body: UpdateProductDto,
  ) {
    return this.service.updateProduct(barcode, body);
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
  // product.controller.ts
  // product.controller.ts

  @Put('image/replace/:barcode')
  @HttpCode(200)
  @UseInterceptors(FilesInterceptor('image', 1, multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['oldImage', 'image'],
      properties: {
        oldImage: { type: 'string', example: 'http://backend/old-image.jpg' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async replaceProductImage(
    @Param('barcode') barcode: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('oldImage') oldImage: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('New image is required');
    }

    if (!oldImage) {
      throw new BadRequestException('oldImage is required');
    }

    const newImage = `${process.env.BACKEND_URL}/${files[0].filename}`;

    return this.service.replaceProductImage(barcode, oldImage, newImage);
  }

  @Put('images/add/:barcode')
  @HttpCode(200)
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['images'],
      properties: {
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
  async addProductImages(
    @Param('barcode') barcode: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Images are required');
    }

    const imageUrls = files.map(
      (file) => `${process.env.BACKEND_URL}/${file.filename}`,
    );

    return this.service.addProductImages(barcode, imageUrls);
  }

  // product.controller.ts

  @Put('images/delete/:barcode')
  @HttpCode(200)
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['removeImages'],
      properties: {
        removeImages: {
          type: 'array',
          items: { type: 'string' },
          example: ['http://backend/image1.jpg'],
        },
      },
    },
  })
  async deleteProductImages(
    @Param('barcode') barcode: string,
    @Body('removeImages') removeImages: string[] | string,
  ) {
    const imagesToRemove = Array.isArray(removeImages)
      ? removeImages
      : removeImages
        ? [removeImages]
        : [];

    if (!imagesToRemove.length) {
      throw new BadRequestException('removeImages is required');
    }

    return this.service.deleteProductImages(barcode, imagesToRemove);
  }

  @HttpCode(200)
  @Delete('/delete/:barcode')
  deleteProductCont(@Param('barcode') barcode: string) {
    return this.service.deleteProduct(barcode);
  }
}
