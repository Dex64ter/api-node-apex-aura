import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
} from '@nestjs/common';
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
import { CreateTeamTaskDto } from './dto/create-team-task.dto';

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

  @Get(':id')
  getTeamById(@Param('id') id: string) {
    return this.teamService.findOne(id);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @Auth()
  removeTeamById(@Param('id') id: string) {
    return this.teamService.remove(id);
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

  @Get(':id/members')
  @ApiBearerAuth('access-token')
  @Auth()
  @ApiOperation({ summary: 'Listar membros de uma equipe' })
  @ApiResponse({ status: 200, description: 'Membros listados com sucesso' })
  @ApiResponse({ status: 404, description: 'Equipe não encontrada' })
  getTeamMembersById(@Param('id') id: string) {
    return this.teamService.getMembers(id);
  }

  @Post(':teamId/tasks')
  @ApiBearerAuth('access-token')
  @Auth()
  @ApiOperation({ summary: 'Criar uma tarefa para uma equipe' })
  @ApiBody({ type: CreateTeamTaskDto })
  @ApiResponse({ status: 201, description: 'Tarefa criada com sucesso' })
  @ApiResponse({ status: 404, description: 'Equipe não encontrada' })
  createTask(
    @Param('teamId') teamId: string,
    @Body() body: CreateTeamTaskDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.teamService.createTask(teamId, body, req.user.userId);
  }
}
