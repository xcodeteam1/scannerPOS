import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: 'Updated category name',
    description: 'Optional updated category name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Updated description',
    description: 'Optional updated description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['http://localhost:3000/uploads/old1.png'],
    description: 'Optional existing image URLs',
  })
  @IsOptional()
  imageUrls?: string[];
}
