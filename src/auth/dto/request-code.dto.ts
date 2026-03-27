import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RequestCodeDTO {
  @IsString()
  @ApiProperty({
    example: 'admin@gmail.com',
    description: 'Email para receber código de autenticação',
  })
  email!: string;
}

export class VerifyCodeDTO {
  @IsString()
  @ApiProperty({ example: '123456', description: 'Código de autenticação' })
  code!: string;
}
