import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCasheirDto {
  @ApiProperty()
  @IsDefined({ message: 'name property mavjud bolishi shart' })
  @IsString()
  @IsNotEmpty({ message: 'name bosh bolmasligi kerak' })
  name: string;

  @ApiProperty()
  @IsDefined({ message: 'branch_id property mavjud bolishi shart' })
  @IsNumber()
  @IsNotEmpty()
  branch_id: number;

  @ApiProperty()
  @IsDefined({ message: 'password property mavjud bolishi shart' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
