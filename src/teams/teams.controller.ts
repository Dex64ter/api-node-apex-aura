import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('teams')
export class TeamsController {
  @Get('')
  @UseGuards(JwtAuthGuard)
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
