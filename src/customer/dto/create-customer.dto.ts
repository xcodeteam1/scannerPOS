import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty()
  @IsDefined({ message: 'customer_name property mavjud bolishi shart' })
  @IsString()
  @IsNotEmpty({ message: 'customer_name bosh bolmasligi kerak' })
  customer_name: string;

  @ApiProperty()
  @IsDefined({ message: 'phone_number property mavjud bolishi shart' })
  @IsString()
  @IsNotEmpty({ message: 'phone_number bosh bolmasligi kerak' })
  phone_number: string;

  @ApiProperty()
  @IsDefined({ message: 'description property mavjud bolishi shart' })
  @IsString()
  description: string;
}
