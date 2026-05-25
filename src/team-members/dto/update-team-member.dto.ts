import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateTeamMemberDto {
  @IsEnum(['member', 'boss'])
  @ApiProperty({
    enum: ['member', 'boss'],
    description: 'Novo papel do membro',
  })
  role: 'member' | 'boss';
}
