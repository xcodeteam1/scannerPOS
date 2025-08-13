import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiProperty({ example: 'Updated category name', required: false })
  name?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  description?: string;
}
