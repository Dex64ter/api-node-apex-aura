import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { JoinTeamDto } from './dto/join-team.dto';
import { TeamsService } from './teams.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from 'src/common/types/auth-request';
import { Auth } from 'src/common/decorators/auth.decorator';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private teamService: TeamsService) {}

  @Get('')
  @ApiBearerAuth('access-token')
  @Auth()
  getAllTeams() {
    return this.teamService.findAll();
  }

  @Post('')
  @ApiBearerAuth('access-token')
  @Auth()
  @ApiOperation({ summary: 'Criar uma equipe' })
  @ApiBody({ type: CreateTeamDto })
  @ApiResponse({ status: 201, description: 'Equipe criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro na criação da equipe' })
  createTeam(
    @Body() body: CreateTeamDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.teamService.create(body, req.user.userId);
  }

  @Post('join')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Entrar em uma equipe pelo código de convite' })
  @ApiBody({ type: JoinTeamDto })
  @ApiResponse({ status: 201, description: 'Entrou na equipe com sucesso' })
  @ApiResponse({ status: 404, description: 'Código de convite inválido' })
  @ApiResponse({ status: 409, description: 'Usuário já é membro do time' })
  @Auth()
  joinTeam(@Body() body: JoinTeamDto, @Request() req: AuthenticatedRequest) {
    return this.teamService.join(body, req.user.userId);
  }

  @Get(':id')
  getTeamById(@Param('id') id: string) {
    return this.teamService.findOne(id);
  }
}
