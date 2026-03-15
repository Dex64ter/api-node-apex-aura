import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @ApiProperty({ example: 'KbTtS@example.com', description: 'User email' })
  email: string;

  @IsString()
  @ApiProperty({ example: '123456', description: 'User password' })
  password: string;
}
