import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
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
  search(
    @Query('q') q: string,
    @Query('branch_id') branch_id?: number,
    @Query('cashier_id') cashier_id?: number,
    @Query('from') from?: Date,
    @Query('to') to?: Date,
  ) {
    if (from && to) {
      return this.service.searchDate(q, branch_id, cashier_id, from, to);
    }
    if (cashier_id) {
      return this.service.searchBranchCashier(q, branch_id, cashier_id);
    }
    if (branch_id) {
      return this.service.searchNameBranch(q, branch_id);
    }
    return this.service.searchNameBarcode(q);
  }

  @HttpCode(201)
  @Post('create')
  @ApiBody({ type: CreateSaleDto, isArray: true })
  createProductCont(@Body() body: CreateSaleDto[]) {
    return this.service.createSale(body);
  }
}
