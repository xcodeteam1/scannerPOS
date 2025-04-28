import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ReturnService } from './return.service';
import { CreateReturnDto } from './dto/create-return.dto';

@ApiTags('return')
@Controller('return')
export class ReturnController {
  constructor(private readonly service: ReturnService) {}
  @HttpCode(200)
  @Get('all')
  selectAllReturnCont() {
    return this.service.selectAllReturn();
  }
  @HttpCode(201)
  @Post('create')
  @ApiBody({ type: CreateReturnDto })
  createReturnCont(@Body() body: CreateReturnDto) {
    return this.service.createReturn(body);
  }
}
