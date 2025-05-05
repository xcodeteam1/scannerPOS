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
import { AdminService } from './admin.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateCasheirDto } from './dto/create-cashier.dto';
import { UpdateCasheirDto } from './dto/update-cashier.dto';
import { LoginDto } from './dto/login.dto';
import { SelectAllCashierQueryDto } from './dto/select-all-cashier.dto';

@ApiTags('Login')
@Controller('auth')
export class LoginController {
  constructor(private readonly service: AdminService) {}

  @HttpCode(200)
  @Post('login')
  @ApiBody({ type: LoginDto })
  allLoginCont(@Body() body: LoginDto) {
    return this.service.allLogin(body);
  }
}
@ApiTags('Cashier')
@Controller('cashier')
export class AdminController {
  constructor(private readonly service: AdminService) {}
  @HttpCode(200)
  @Get('list')
  selectAllCashierCont(@Param() query: SelectAllCashierQueryDto) {
    return this.service.selectAllCashier(query.page, query.pageSize);
  }

  @HttpCode(200)
  @Get('search-cashier')
  searchCashierCont(@Query('name') name: string) {
    return this.service.searchCashier(name);
  }

  @HttpCode(200)
  @Get(':id')
  selectByIDCashierCont(@Param('id') id: number) {
    return this.service.selectByIDCashier(id);
  }

  @HttpCode(201)
  @Post('create')
  @ApiBody({ type: CreateCasheirDto })
  createCashierCont(@Body() body: CreateCasheirDto) {
    return this.service.createCashier(body);
  }

  @HttpCode(201)
  @Put('/update/:id')
  @ApiBody({ type: UpdateCasheirDto })
  updateCashierCont(@Body() body: UpdateCasheirDto, @Param('id') id: number) {
    return this.service.updateCashier(id, body);
  }
  @HttpCode(200)
  @Delete('/delete/:id')
  deleteCashierCont(@Param('id') id: number) {
    return this.service.deleteCashier(id);
  }
}
