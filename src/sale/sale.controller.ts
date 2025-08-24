import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SearchSalesDto } from './dto/search-sale.dto';

@ApiTags('Sale')
@Controller('sale')
export class SaleController {
  constructor(private readonly service: SaleService) {}

  @HttpCode(200)
  @Get('daily')
  selectAllProductCont() {
    return this.service.selectDailySale();
  }

  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'branch_id', required: false })
  @ApiQuery({ name: 'cashier_id', required: false })
  @ApiQuery({
    name: 'from',
    required: false,
    type: Date,
    example: '2024-01-20',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    type: Date,
    example: '2026-01-20',
  })
  @Get('search')
  @ApiQuery({ name: 'q', required: false, description: 'Qidiruv matni' })
  search(@Query() query: SearchSalesDto) {
    return this.service.getSales(
      query.page,
      query.pageSize,
      query.q,
      query.branch_id,
      query.cashier_id,
      query.from ? new Date(query.from) : undefined,
      query.to ? new Date(query.to) : undefined,
    );
  }

  @HttpCode(201)
  @Post('create')
  @ApiBody({ type: CreateSaleDto, isArray: true })
  createProductCont(@Body() body: CreateSaleDto[]) {
    return this.service.createSale(body);
  }
}
