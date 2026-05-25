import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import type { AuthenticatedRequest } from 'src/common/types/auth-request';
import { TeamMembersService } from './team-members.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { JoinTeamDto } from './dto/join-team.dto';

@ApiTags('Team Members')
@Controller('teams/:teamId/members')
export class TeamMembersController {
  constructor(private readonly teamMembersService: TeamMembersService) {}

  @Get()
  @Auth()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Listar membros de um time' })
  @ApiResponse({ status: 200, description: 'Lista de membros' })
  @ApiResponse({ status: 404, description: 'Equipe não encontrada' })
  findAll(@Param('teamId') teamId: string) {
    return this.teamMembersService.findAllByTeam(teamId);
  }

  @Get(':id')
  @Auth()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Buscar membro por ID do vínculo' })
  @ApiResponse({ status: 404, description: 'Membro não encontrado' })
  findOne(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.teamMembersService.findOne(teamId, id);
  }

  @Post()
  @Auth()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Boss adiciona membro ao time' })
  @ApiBody({ type: CreateTeamMemberDto })
  @ApiResponse({ status: 201, description: 'Membro adicionado' })
  @ApiResponse({ status: 403, description: 'Apenas bosses' })
  create(
    @Param('teamId') teamId: string,
    @Body() body: CreateTeamMemberDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.teamMembersService.addByBoss(teamId, body, req.user.userId);
  }

  @Patch(':id')
  @Auth()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Boss altera papel do membro' })
  @ApiBody({ type: UpdateTeamMemberDto })
  @ApiResponse({ status: 403, description: 'Apenas bosses' })
  update(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
    @Body() body: UpdateTeamMemberDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.teamMembersService.updateRole(
      teamId,
      id,
      body,
      req.user.userId,
    );
  }

  @Delete(':id')
  @Auth()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remover membro ou sair do time' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  remove(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.teamMembersService.remove(teamId, id, req.user.userId);
  }
}

@ApiTags('Team Members')
@Controller('team-members')
export class TeamMemberActionsController {
  constructor(private readonly teamMembersService: TeamMembersService) {}

  @Post('join')
  @Auth()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Entrar em um time pelo código de convite' })
  @ApiBody({ type: JoinTeamDto })
  @ApiResponse({ status: 201, description: 'Entrou no time' })
  @ApiResponse({ status: 404, description: 'Código inválido' })
  @ApiResponse({ status: 409, description: 'Já é membro' })
  join(@Body() body: JoinTeamDto, @Request() req: AuthenticatedRequest) {
    return this.teamMembersService.joinByInviteCode(body, req.user.userId);
  }

  @Get('me/teams')
  @Auth()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Listar times do usuário autenticado' })
  findMyTeams(@Request() req: AuthenticatedRequest) {
    return this.teamMembersService.findTeamsByUser(req.user.userId);
  }
}
