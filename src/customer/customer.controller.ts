import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { GetCustomerDto } from './dto/get-costumer.dto';

@ApiTags('Customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly service: CustomerService) {}
  @HttpCode(200)
  @Get('list')
  selectAllProductCont(@Query() query: GetCustomerDto) {
    return this.service.getCustomers(query.page, query.pageSize, query.q);
  }
  @HttpCode(200)
  @Get('search')
  searchProductCont(@Query('name') name: string) {
    return this.service.searchCustomer(name);
  }
  @HttpCode(201)
  @Post('create')
  @ApiBody({ type: CreateCustomerDto })
  createProductCont(@Body() body: CreateCustomerDto) {
    return this.service.createCustomer(body);
  }
}
