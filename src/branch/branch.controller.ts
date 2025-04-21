import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { BranchService } from './branch.service';

@Controller('branch')
export class BranchController {
  constructor(private readonly service: BranchService) {}

  @HttpCode(200)
  @Get('all')
  selectAllBranchCont() {
    return this.service.selectAllBranch();
  }
  @HttpCode(200)
  @Get(':id')
  selectByIDBranchCont(@Param('id') id: number) {
    return this.service.selectByIDBranch(id);
  }
  @HttpCode(201)
  @Post('create')
  createBranchCont(@Body() body: { name: string; description: string }) {
    return this.service.createBranch(body);
  }
  @HttpCode(201)
  @Put('/update/:id')
  updateBranchCont(
    @Body() body: { name: string; description: string },
    @Param('id') id: number,
  ) {
    return this.service.updateBranch(id, body);
  }
  @HttpCode(200)
  @Delete('/delete/:id')
  deleteBranchCont(@Param('id') id: number) {
    return this.service.deleteBranch(id);
  }
}
