import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: '123456789', description: 'Product barcode' })
  @IsString()
  @IsNotEmpty()
  barcode: string;

  @ApiProperty({ example: 'Laptop', description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1, description: 'Branch ID' })
  @IsNumber()
  branch_id: number;

  @ApiProperty({
    example: ['new', 'hit'],
    description: 'Product tags',
    isArray: true,
  })
  @ApiProperty({
    example: ['new', 'hit'],
    description: 'Product tags',
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['new', 'hit', 'sale'], { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    return value;
  })
  tegs?: ('new' | 'hit' | 'sale')[];

  @ApiProperty({ example: 1500, description: 'Price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 1400, description: 'Real price' })
  @IsNumber()
  @Min(0)
  real_price: number;

  @ApiProperty({ example: 10, description: 'Stock quantity' })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 2, description: 'Category ID' })
  @IsNumber()
  category_id: number;

  @ApiProperty({ example: 'High-end gaming laptop', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
  })
  @IsOptional()
  imageUrls?: string[];
}
