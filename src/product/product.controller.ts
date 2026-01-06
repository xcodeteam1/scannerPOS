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

  @Put('/images/:barcode')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images', maxCount: 10 }], multerConfig),
  )
  @ApiConsumes('multipart/form-data')
  async updateProductImages(
    @Param('barcode') barcode: string,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
    },
    @Body() body: any,
  ) {
    const addImages =
      files?.images?.map((f) => `${process.env.BACKEND_URL}/${f.filename}`) ||
      [];

    const removeImages = Array.isArray(body.removeImages)
      ? body.removeImages
      : body.removeImages
        ? [body.removeImages]
        : [];

    return this.service.updateProductImages(barcode, {
      addImages,
      removeImages,
    });
  }
  @Put('image/replace/:barcode')
  @UseInterceptors(FilesInterceptor('image', 1, multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        oldImage: { type: 'string' },
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

    const newImage = `${process.env.BACKEND_URL}/${files[0].filename}`;

    return this.service.replaceProductImage(barcode, oldImage, newImage);
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
