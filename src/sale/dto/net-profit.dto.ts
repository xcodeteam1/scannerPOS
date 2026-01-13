import { IsDateString, IsOptional } from 'class-validator';

export class NetProfitQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
