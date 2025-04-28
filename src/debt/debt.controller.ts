import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { DebtService } from './debt.service';
import { CreateDebtDto } from './dto/create-debt.dto';

@ApiTags('Debt')
@Controller('debt')
export class DebtController {
  constructor(private readonly service: DebtService) {}

  @HttpCode(201)
  @Post('create')
  @ApiBody({ type: CreateDebtDto, isArray: true })
  createProductCont(@Body() body: CreateDebtDto[]) {
    return this.service.createDebt(body);
  }
}
