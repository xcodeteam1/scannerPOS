import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsDefined({ message: 'login property mavjud bolishi shart' })
  @IsString()
  @IsNotEmpty({ message: 'login bosh bolmasligi kerak' })
  login: string;

  @ApiProperty()
  @IsDefined({ message: 'password property mavjud bolishi shart' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
