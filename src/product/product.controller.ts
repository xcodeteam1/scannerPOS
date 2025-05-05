import * as dotenv from 'dotenv';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
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
dotenv.config();

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @HttpCode(200)
  @Get('list')
  selectAllProductCont(@Query() query: SelectAllProductQueryDto) {
    return this.service.selectAllProduct(query.page, query.pageSize);
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
        price: { type: 'number' },
        real_price: { type: 'number' },
        stock: { type: 'number' },
        description: { type: 'string' },
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
    const imageUrls = files.map(
      (file) => `${process.env.BACKEND_URL}/${file?.filename}`,
    );
    return this.service.createProduct({ ...body, imageUrls });
  }

  @HttpCode(201)
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
        price: { type: 'number' },
        stock: { type: 'number' },
        real_price: { type: 'number' },
        description: { type: 'string' },
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
  updateProduct(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('barcode') barcode: string,
    @Body() body: UpdateProductDto,
  ) {
    const imageUrls = files.map(
      (file) => `${process.env.BACKEND_URL}/${file?.filename}`,
    );
    return this.service.updateProduct(barcode, { ...body, imageUrls });
  }
  @HttpCode(200)
  @Delete('/delete/:barcode')
  deleteProductCont(@Param('barcode') barcode: string) {
    return this.service.deleteProduct(barcode);
  }
}
