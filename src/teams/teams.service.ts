import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Team } from './schemas/team.schema';
import { CreateTeamDto } from './dto/create-team.dto';
import { JoinTeamDto } from './dto/join-team.dto';
import { TeamMember } from './schemas/team-member.schema';
import { CreateTeamTaskDto } from './dto/create-team-task.dto';
import { Task } from 'src/tasks/schemas/tasks.schema';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    @InjectModel(Team.name)
    private teamModel: Model<Team>,

    @InjectModel(TeamMember.name)
    private teamMemberModel: Model<TeamMember>,

    @InjectModel(Task.name)
    private taskModel: Model<Task>,
  ) {}

  async create(data: CreateTeamDto, userId: string) {
    try {
      const existing = await this.teamModel.findOne({
        name: data.name,
        created_by: userId,
      });

      if (existing) {
        throw new BadRequestException('Você já tem um time com esse nome');
      }

      const team = await this.teamModel.create({
        ...data,
        created_by: userId,
      });

      await this.teamMemberModel.create({
        teamId: team._id,
        userId,
        role: 'boss',
      });

      return {
        id: team._id,
        name: team.name,
      };
    } catch (error) {
      this.logger.error('Error creating team', error);
      throw error;
    }
  }

  async join(data: JoinTeamDto, userId: string) {
    const inviteCode = data.invite_code.trim().toUpperCase();

    const team = await this.teamModel.findOne({ invite_code: inviteCode });

    if (!team) {
      throw new NotFoundException('Código de convite inválido');
    }

    const existingMember = await this.teamMemberModel.findOne({
      teamId: team._id,
      userId,
    });

    if (existingMember) {
      throw new ConflictException('Você já faz parte deste time');
    }

    await this.teamMemberModel.create({
      teamId: team._id,
      userId,
      role: 'member',
    });

    return {
      id: team._id,
      name: team.name,
      role: 'member',
    };
  }

  async findAll() {
    try {
      return await this.teamModel.find();
    } catch (error) {
      this.logger.error('Error fetching teams', error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const team = await this.teamModel.findById(id).populate('created_by');

      if (!team) {
        throw new NotFoundException('Equipe não encontrada');
      }

      const members = await this.teamMemberModel
        .find({ teamId: team._id })
        .populate('userId', 'name email avatarUrl aura');

      return {
        ...team.toObject(),
        members,
      };
    } catch (error) {
      this.logger.error('Error fetching team', error);
      throw error;
    }
  }

  async update(id: string, data: CreateTeamDto) {
    try {
      const updatedTeam = await this.teamModel.findByIdAndUpdate(id, data, {
        new: true,
      });
      return updatedTeam;
    } catch (error) {
      this.logger.error('Error updating team', error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const deletedTeam = await this.teamModel.findByIdAndDelete(id);
      return deletedTeam;
    } catch (error) {
      this.logger.error('Error deleting team', error);
      throw error;
    }
  }

  async getMembers(id: string) {
    try {
      const team = await this.teamModel.findById(id);

      if (!team) {
        throw new NotFoundException('Equipe não encontrada');
      }

      return this.teamMemberModel
        .find({ teamId: team._id })
        .populate('userId', 'name email avatarUrl aura');
    } catch (error) {
      this.logger.error('Error fetching team members', error);
      throw error;
    }
  }

  async createTask(teamId: string, data: CreateTeamTaskDto, userId: string) {
    try {
      const checkBoss = await this.teamMemberModel.findOne({
        teamId: new Types.ObjectId(teamId),
        userId: new Types.ObjectId(userId),
        role: 'boss',
      });

      if (!checkBoss) {
        throw new ForbiddenException('Você não é um boss deste time');
      }

      const task = await this.taskModel.create({
        ...data,
        teamId: new Types.ObjectId(teamId),
        createdBy: new Types.ObjectId(userId),
        deadline: new Date(data.deadline),
        status: 'open',
      });
      return task;
    } catch (error) {
      this.logger.error('Error creating task', error);
      throw error;
    }
  }
}
