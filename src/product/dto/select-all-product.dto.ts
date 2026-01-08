// src/product/dto/select-all-product-query.dto.ts
import { IsInt, Min, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SelectAllProductQueryDto {
  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pageSize must be an integer' })
  @Min(1, { message: 'pageSize must be at least 1' })
  pageSize?: number = 10;

  @ApiPropertyOptional({ example: 'olma' })
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  tegs?: string;
}
