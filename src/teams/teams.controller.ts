import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamsService } from './teams.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('teams')
export class TeamsController {
  constructor(private teamService: TeamsService) {}

  @Get('')
  getAllTeams() {
    return this.teamService.findAll();
  }

  @Get(':id')
  getTeamById(@Param('id') id: string) {
    return this.teamService.findOne(id);
  }

  @Post('')
  @ApiOperation({ summary: 'Criar uma equipe' })
  @ApiBody({ type: CreateTeamDto })
  @ApiResponse({ status: 201, description: 'Equipe criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro na criação da equipe' })
  createTeam(@Body() body: CreateTeamDto, @Request() req) {
    // const userId = (req.user as any).userId;
    // console.log('userId:', userId);
    return this.teamService.create(body, req.user.userId);
  }
}
