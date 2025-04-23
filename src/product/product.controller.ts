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
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @HttpCode(200)
  @Get('all')
  selectAllProductCont() {
    return this.service.selectAllProduct();
  }

  @HttpCode(200)
  @Get('search')
  searchProductCont(@Query('q') q: string) {
    return this.service.searchProduct(q);
  }

  @HttpCode(200)
  @Get(':barcode')
  selectByIDProductCont(@Param('barcode') barcode: number) {
    return this.service.selectByIDProduct(barcode);
  }

  @HttpCode(201)
  @Post('create')
  @ApiBody({ type: CreateProductDto })
  createProductCont(@Body() body: CreateProductDto) {
    return this.service.createProduct(body);
  }
  @HttpCode(201)
  @Put('/update/:barcode')
  @ApiBody({ type: UpdateProductDto })
  updateProduct(
    @Param('barcode') barcode: number,
    @Body() body: UpdateProductDto,
  ) {
    return this.service.updateProduct(barcode, body);
  }
  @HttpCode(200)
  @Delete('/delete/:barcode')
  deleteProductCont(@Param('barcode') barcode: number) {
    return this.service.deleteProduct(barcode);
  }
}
