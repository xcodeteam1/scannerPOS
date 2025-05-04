// src/product/dto/select-all-product-query.dto.ts
import { IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class SelectAllProductQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be at least 1' })
  page?: number = 1;
}
