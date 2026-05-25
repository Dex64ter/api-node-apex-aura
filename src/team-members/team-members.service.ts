import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Team } from 'src/teams/schemas/team.schema';
import { TeamMember } from './schemas/team-member.schema';
import { JoinTeamDto } from './dto/join-team.dto';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

const USER_POPULATE_FIELDS = 'name email avatarUrl aura';

@Injectable()
export class TeamMembersService {
  private readonly logger = new Logger(TeamMembersService.name);

  constructor(
    @InjectModel(Team.name)
    private teamModel: Model<Team>,

    @InjectModel(TeamMember.name)
    private teamMemberModel: Model<TeamMember>,
  ) {}

  /** Cria vínculo usuário ↔ time (uso interno e por boss). */
  async create(
    teamId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    role: 'member' | 'boss',
  ) {
    const teamObjectId = new Types.ObjectId(teamId);
    const userObjectId = new Types.ObjectId(userId);

    const existing = await this.teamMemberModel.findOne({
      teamId: teamObjectId,
      userId: userObjectId,
    });

    if (existing) {
      throw new ConflictException('Usuário já é membro deste time');
    }

    const member = await this.teamMemberModel.create({
      teamId: teamObjectId,
      userId: userObjectId,
      role,
    });

    return member.populate('userId', USER_POPULATE_FIELDS);
  }

  /** Entra no time via código de convite (`POST /team-members/join` ou `/teams/join`). */
  async joinByInviteCode(data: JoinTeamDto, userId: string) {
    const inviteCode = data.invite_code.trim().toUpperCase();
    const team = await this.teamModel.findOne({ invite_code: inviteCode });

    if (!team) {
      throw new NotFoundException('Código de convite inválido');
    }

    await this.create(team._id, userId, 'member');

    return {
      id: team._id,
      name: team.name,
      role: 'member' as const,
    };
  }

  /** Lista membros de um time com dados do usuário. */
  async findAllByTeam(teamId: string) {
    await this.assertTeamExists(teamId);

    return this.teamMemberModel
      .find({ teamId: new Types.ObjectId(teamId) })
      .populate('userId', USER_POPULATE_FIELDS);
  }

  /** Busca um vínculo pelo `_id` do documento em `teammembers`. */
  async findOne(teamId: string, memberId: string) {
    await this.assertTeamExists(teamId);

    const member = await this.teamMemberModel
      .findOne({
        _id: new Types.ObjectId(memberId),
        teamId: new Types.ObjectId(teamId),
      })
      .populate('userId', USER_POPULATE_FIELDS);

    if (!member) {
      throw new NotFoundException('Membro não encontrado neste time');
    }

    return member;
  }

  /** Times em que o usuário participa (para dashboard / perfil). */
  async findTeamsByUser(userId: string) {
    return this.teamMemberModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('teamId', 'name invite_code created_by')
      .populate('userId', USER_POPULATE_FIELDS);
  }

  /** Busca vínculo (teamId + userId) — usado por outros módulos. */
  async findMembership(teamId: string, userId: string) {
    return this.teamMemberModel.findOne({
      teamId: new Types.ObjectId(teamId),
      userId: new Types.ObjectId(userId),
    });
  }

  /** Garante que o usuário é boss; lança 403 se não for. */
  async assertBoss(teamId: string, userId: string) {
    const membership = await this.findMembership(teamId, userId);

    if (!membership || membership.role !== 'boss') {
      throw new ForbiddenException('Você não é um boss deste time');
    }

    return membership;
  }

  /** Boss adiciona membro manualmente (`POST /teams/:teamId/members`). */
  async addByBoss(
    teamId: string,
    data: CreateTeamMemberDto,
    requesterId: string,
  ) {
    await this.assertBoss(teamId, requesterId);
    return this.create(teamId, data.userId, data.role ?? 'member');
  }

  /** Boss altera o papel de um membro (`PATCH /teams/:teamId/members/:id`). */
  async updateRole(
    teamId: string,
    memberId: string,
    data: UpdateTeamMemberDto,
    requesterId: string,
  ) {
    await this.assertBoss(teamId, requesterId);

    const member = await this.findOne(teamId, memberId);

    if (member.role === 'boss' && data.role === 'member') {
      const bossCount = await this.teamMemberModel.countDocuments({
        teamId: new Types.ObjectId(teamId),
        role: 'boss',
      });

      if (bossCount <= 1) {
        throw new ForbiddenException('O time precisa ter pelo menos um boss');
      }
    }

    member.role = data.role;
    await member.save();

    return member.populate('userId', USER_POPULATE_FIELDS);
  }

  /**
   * Remove membro do time (`DELETE /teams/:teamId/members/:id`).
   * Boss pode remover outros; qualquer membro pode sair (remover a si mesmo).
   */
  async remove(teamId: string, memberId: string, requesterId: string) {
    const member = await this.teamMemberModel.findOne({
      _id: new Types.ObjectId(memberId),
      teamId: new Types.ObjectId(teamId),
    });

    if (!member) {
      throw new NotFoundException('Membro não encontrado neste time');
    }

    const requesterMembership = await this.findMembership(teamId, requesterId);

    if (!requesterMembership) {
      throw new ForbiddenException('Você não faz parte deste time');
    }

    const isSelf = member.userId.toString() === requesterId;
    const isBoss = requesterMembership.role === 'boss';

    if (!isSelf && !isBoss) {
      throw new ForbiddenException(
        'Apenas bosses podem remover outros membros',
      );
    }

    if (member.role === 'boss') {
      const bossCount = await this.teamMemberModel.countDocuments({
        teamId: new Types.ObjectId(teamId),
        role: 'boss',
      });

      if (bossCount <= 1) {
        throw new ForbiddenException(
          'Não é possível remover o único boss do time',
        );
      }
    }

    await this.teamMemberModel.findByIdAndDelete(member._id);

    return { message: 'Membro removido do time' };
  }

  private async assertTeamExists(teamId: string) {
    const team = await this.teamModel.findById(teamId);

    if (!team) {
      throw new NotFoundException('Equipe não encontrada');
    }

    return team;
  }
}
