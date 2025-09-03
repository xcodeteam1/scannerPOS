import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty()
  @IsDefined({ message: 'title property mavjud bolishi shart' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsDefined({ message: 'subtitle property mavjud bolishi shart' })
  @IsString()
  @IsOptional()
  subtitle: string;
}
