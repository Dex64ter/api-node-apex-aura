import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @ApiProperty({ example: 'John Doe', description: 'User name' })
  name!: string;

  @IsEmail()
  @ApiProperty({
    example: 'KbTtS@example.com',
    description: 'User email',
    required: true,
  })
  email!: string;

  @MinLength(6)
  @ApiProperty({
    example: '123456',
    description: 'User password',
    required: true,
  })
  password!: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
