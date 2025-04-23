import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty()
  @IsDefined({ message: 'name property mavjud bolishi shart' })
  @IsString()
  @IsNotEmpty({ message: 'name bosh bolmasligi kerak' })
  name: string;

  @ApiProperty()
  @IsDefined({ message: 'address property mavjud bolishi shart' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsDefined({ message: 'contact property mavjud bolishi shart' })
  @IsString()
  @IsNotEmpty()
  contact: string;
}
