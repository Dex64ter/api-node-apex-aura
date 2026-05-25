import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class JoinTeamDto {
  @IsString()
  @IsNotEmpty()
  @Length(8, 8)
  @Matches(/^[A-Za-z0-9]+$/)
  @ApiProperty({
    example: 'AB12CD34',
    description: 'Código de convite do time (8 caracteres)',
  })
  invite_code: string;
}
