import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { DebtService } from './debt.service';
import { CreateDebtDto } from './dto/create-debt.dto';

@ApiTags('Debt')
@Controller('debt')
export class DebtController {
  constructor(private readonly service: DebtService) {}

  @HttpCode(200)
  @Get('all')
  selectAllDebtCont() {
    return this.service.selectAllDebt();
  }

  @HttpCode(200)
  @Get('search')
  searchDebtCont(@Query('name') name: string) {
    return this.service.searchDebt(name);
  }

  @HttpCode(201)
  @Post('create')
  @ApiBody({ type: CreateDebtDto, isArray: true })
  createProductCont(@Body() body: CreateDebtDto[]) {
    return this.service.createDebt(body);
  }
}
