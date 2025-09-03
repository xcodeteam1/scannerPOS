import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  UseInterceptors,
  UploadedFiles,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { multerConfig } from 'src/common/middleware/multer.config';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PatchCategoryDto } from './dto/patch-category.dto';
import { GetCategoryDto } from './dto/get-category.dto';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @HttpCode(200)
  @Get('list')
  async getAllCategories(@Query() query: GetCategoryDto) {
    return this.categoryService.getCategories(
      query.page,
      query.pageSize,
      query.q,
    );
  }

  @HttpCode(200)
  @Get(':id')
  async getCategoryById(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.selectByIDCategory(id);
  }

  @HttpCode(201)
  @Post('create')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async createCategory(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreateCategoryDto,
  ) {
    const imageUrls = [
      ...(Array.isArray(files)
        ? files.map((file) => `${process.env.BACKEND_URL}/${file?.filename}`)
        : []),
      ...(dto.imageUrls || []),
    ];

    return await this.categoryService.createCategory(
      dto.name,
      dto.description,
      imageUrls,
    );
  }

  @HttpCode(200)
  @Put('/update/:id')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() images: Express.Multer.File[],
    @Body() dto: UpdateCategoryDto,
  ) {
    const uploadedImages = Array.isArray(images)
      ? images.map((file) => `${process.env.BACKEND_URL}/${file?.filename}`)
      : [];

    const existingImages = dto.imageUrls || [];

    const finalImageUrls =
      uploadedImages.length > 0 || existingImages.length > 0
        ? [...uploadedImages, ...existingImages]
        : undefined;

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.description) updateData.description = dto.description;
    if (finalImageUrls) updateData.imageUrls = finalImageUrls;

    return await this.categoryService.updateCategory(id, updateData);
  }

  @HttpCode(200)
  @Patch(':id')
  async patchCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PatchCategoryDto,
  ) {
    return await this.categoryService.patchCategory(
      id,
      dto.name,
      dto.description,
    );
  }
  @HttpCode(200)
  @Delete('/delete/:id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.deleteCategory(id);
  }
}
