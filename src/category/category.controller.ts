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
  BadRequestException,
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
  @Put('images/add/:id')
  @HttpCode(200)
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
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
  async addCategoryImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Images are required');
    }

    const imageUrls = files.map(
      (file) => `${process.env.BACKEND_URL}/${file.filename}`,
    );

    return this.categoryService.addCategoryImages(id, imageUrls);
  }
  @Put('images/delete/:id')
  @HttpCode(200)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        removeImages: {
          type: 'array',
          items: { type: 'string' },
          example: ['http://backend/image1.jpg'],
        },
      },
    },
  })
  async deleteCategoryImages(
    @Param('id', ParseIntPipe) id: number,
    @Body('removeImages') removeImages: string[] | string,
  ) {
    const imagesToRemove = Array.isArray(removeImages)
      ? removeImages
      : removeImages
        ? [removeImages]
        : [];

    if (!imagesToRemove.length) {
      throw new BadRequestException('removeImages is required');
    }

    return this.categoryService.deleteCategoryImages(id, imagesToRemove);
  }
  @Put('image/replace/:id')
  @HttpCode(200)
  @UseInterceptors(FilesInterceptor('image', 1, multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        oldImage: {
          type: 'string',
          example: 'http://backend/old-image.jpg',
        },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async replaceCategoryImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('oldImage') oldImage: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('New image is required');
    }

    if (!oldImage) {
      throw new BadRequestException('oldImage is required');
    }

    const newImage = `${process.env.BACKEND_URL}/${files[0].filename}`;

    return this.categoryService.replaceCategoryImage(id, oldImage, newImage);
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
