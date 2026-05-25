import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTeamTaskDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Limpar a sala', description: 'Título da tarefa' })
  title: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'Organizar mesas e tirar o lixo',
    description: 'Descrição da tarefa',
  })
  description?: string;

  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 50, description: 'Aura ganha ao concluir' })
  auraReward: number;

  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 10, description: 'Aura perdida se falhar/rejeitar' })
  penaltyAura: number;

  @IsDateString()
  @ApiProperty({
    example: '2026-06-01T23:59:59.000Z',
    description: 'Prazo da tarefa (ISO 8601)',
  })
  deadline: string;

  @IsMongoId()
  @IsOptional()
  @ApiPropertyOptional({
    example: '507f1f77bcf86cd799439011',
    description: 'ID do membro atribuído (opcional na criação)',
  })
  assignedTo?: string;
}
