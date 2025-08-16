import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics', description: 'Category name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'All electronic products',
    description: 'Category description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
  @IsOptional()
  imageUrls?: string[];
}
