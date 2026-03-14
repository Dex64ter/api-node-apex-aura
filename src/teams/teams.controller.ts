import { Controller, Get, Post } from '@nestjs/common';

@Controller('teams')
export class TeamsController {
  @Get('')
  getAllTeams() {
    return 'getAllTeams';
  }

  @Get(':id')
  getTeamById() {
    return 'getTeamById';
  }

  @Post('')
  createTeam() {
    return 'createTeam';
  }
}
