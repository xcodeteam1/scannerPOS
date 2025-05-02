import { Controller, Get, HttpCode } from '@nestjs/common';
import { MainService } from './main.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Main')
@Controller('main')
export class MainController {
  constructor(private readonly service: MainService) {}

  @HttpCode(200)
  @Get('product')
  selectProductMainCont() {
    return this.service.selectProductMain();
  }

  @HttpCode(200)
  @Get('six-month')
  selectSixMothCont() {
    return this.service.selectSixMoth();
  }
  @HttpCode(200)
  @Get('diagram')
  selectDiagramCont() {
    return this.service.selectDiagram();
  }
}
