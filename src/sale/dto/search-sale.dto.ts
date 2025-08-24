import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchSalesDto {
  @ApiPropertyOptional({ description: 'Qidiruv matni' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filial ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branch_id?: number;

  @ApiPropertyOptional({ description: 'Kassir ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cashier_id?: number;

  @ApiPropertyOptional({ description: 'Boshlanish sanasi' })
  @IsOptional()
  @Type(() => Date)
  from?: Date;

  @ApiPropertyOptional({ description: 'Tugash sanasi' })
  @IsOptional()
  @Type(() => Date)
  to?: Date;

  @ApiPropertyOptional({ description: 'Sahifa raqami', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Har bir sahifadagi elementlar soni',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize: number = 10;
}
