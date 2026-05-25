import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional } from 'class-validator';

export class CreateTeamMemberDto {
  @IsMongoId()
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID do usuário a adicionar ao time',
  })
  userId: string;

  @IsEnum(['member', 'boss'])
  @IsOptional()
  @ApiPropertyOptional({
    enum: ['member', 'boss'],
    default: 'member',
    description: 'Papel do membro no time',
  })
  role?: 'member' | 'boss';
}
