import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@ApiTags('Sale')
@Controller('sale')
export class SaleController {
  constructor(private readonly service: SaleService) {}

  @HttpCode(200)
  @Get('daily')
  selectAllProductCont() {
    return this.service.selectDailySale();
  }

  @HttpCode(201)
  @Post('create')
  @ApiBody({ type: CreateSaleDto, isArray: true })
  createProductCont(@Body() body: CreateSaleDto[]) {
    return this.service.createSale(body);
  }
}
