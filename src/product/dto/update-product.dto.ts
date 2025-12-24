import { IsOptional, IsString, IsNumber, IsArray, IsIn } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  branch_id?: number;

  @IsOptional()
  @IsNumber()
  category_id?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsNumber()
  real_price?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsIn(['new', 'hit', 'sale'], { each: true })
  tegs?: ('new' | 'hit' | 'sale')[];

  // Faqat qo‘shimcha qilish yoki o‘chirish uchun
  @IsOptional()
  @IsArray()
  addImages?: any[];

  @IsOptional()
  @IsArray()
  removeImages?: any[];

  // ✅ DB update uchun ichki property
  @IsOptional()
  imageUrls?: string[];
}
