import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PatchProductDto {
  @ApiPropertyOptional({ example: '123456789', description: 'Product barcode' })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiPropertyOptional({ example: 'Laptop', description: 'Product name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 1, description: 'Branch ID' })
  @IsNumber()
  @IsOptional()
  branch_id?: number;

  @ApiPropertyOptional({ example: 1500, description: 'Price' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 1400, description: 'Real price' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  real_price?: number;

  @ApiPropertyOptional({ example: 10, description: 'Stock quantity' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ example: 2, description: 'Category ID' })
  @IsNumber()
  @IsOptional()
  category_id?: number;

  @ApiPropertyOptional({
    example: 'High-end gaming laptop',
    description: 'Optional description',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
