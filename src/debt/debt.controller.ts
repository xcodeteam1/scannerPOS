import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { DebtService } from './debt.service';
import { CreateDebtDto } from './dto/create-debt.dto';

@ApiTags('Debt')
@Controller('debt')
export class DebtController {
  constructor(private readonly service: DebtService) {}

  @HttpCode(200)
  @Get('pending')
  selectPendingCont() {
    return this.service.selectPending();
  }

  @HttpCode(200)
  @Get('oldest')
  selectOldest() {
    return this.service.selectOldest();
  }

  @HttpCode(201)
  @Put('update-all-amount/:customer_id')
  amountAllDebtCont(@Param('customer_id') customer_id: number) {
    return this.service.amountAllDebt(customer_id);
  }

  @HttpCode(201)
  @Put('update-amount/:id')
  amountDebtCont(@Param('id') id: number) {
    return this.service.amountDebt(id);
  }

  @HttpCode(200)
  @Get('all')
  selectAllDebtCont() {
    return this.service.selectAllDebt();
  }

  @HttpCode(200)
  @Get('debt-history/:customer_id')
  debtHIstoryByCustomerCont(@Param('customer_id') customer_id: number) {
    return this.service.debtHIstoryByCustomer(customer_id);
  }

  @HttpCode(200)
  @Get('recent')
  selectRecentCont() {
    return this.service.selectRecent();
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
