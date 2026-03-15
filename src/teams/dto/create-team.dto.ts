import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @ApiProperty({ example: 'Meu Time', description: 'Nome do time' })
  name: string;
}
