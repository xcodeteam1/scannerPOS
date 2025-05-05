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
import { BranchService } from './branch.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { SelectAllBranchQueryDto } from './dto/select-all-branch.dto';

@ApiTags('Branch')
@Controller('branch')
export class BranchController {
  constructor(private readonly service: BranchService) {}

  @HttpCode(200)
  @Get('list')
  selectAllBranchCont(@Query() query: SelectAllBranchQueryDto) {
    return this.service.selectAllBranch(query.page, query.pageSize);
  }

  @HttpCode(200)
  @Get('search')
  searchBranchCont(@Query('name') name: string) {
    return this.service.searchBranch(name);
  }

  @HttpCode(200)
  @Get(':id')
  selectByIDBranchCont(@Param('id') id: number) {
    return this.service.selectByIDBranch(id);
  }

  @HttpCode(201)
  @Post('create')
  @ApiBody({ type: CreateBranchDto })
  createBranchCont(@Body() body: CreateBranchDto) {
    return this.service.createBranch(body);
  }
  @HttpCode(201)
  @Put('/update/:id')
  @ApiBody({ type: UpdateBranchDto })
  updateBranchCont(@Body() body: UpdateBranchDto, @Param('id') id: number) {
    return this.service.updateBranch(id, body);
  }
  @HttpCode(200)
  @Delete('/delete/:id')
  deleteBranchCont(@Param('id') id: number) {
    return this.service.deleteBranch(id);
  }
}
