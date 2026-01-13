import { IsDateString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class NetProfitQueryDto {
  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Boshlanish sanasi (YYYY-MM-DD yoki ISO format)',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-01-31',
    description: 'Tugash sanasi (YYYY-MM-DD yoki ISO format)',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'Filial ID (branch_id)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  branch_id?: number;

  @ApiPropertyOptional({
    example: 7,
    description: 'Kassir ID (cashier_id)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cashier_id?: number;
}
