import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PatchCategoryDto {
  @ApiPropertyOptional({
    example: 'New Category Name',
    description: 'Category name',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Updated category description',
    description: 'Category description',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
