import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Team } from './schemas/team.schema';
import { CreateTeamDto } from './dto/create-team.dto';
import { JoinTeamDto } from 'src/team-members/dto/join-team.dto';
import { CreateTeamTaskDto } from './dto/create-team-task.dto';
import { Task } from 'src/tasks/schemas/tasks.schema';
import { TeamMembersService } from 'src/team-members/team-members.service';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    @InjectModel(Team.name)
    private teamModel: Model<Team>,

    @InjectModel(Task.name)
    private taskModel: Model<Task>,

    private teamMembersService: TeamMembersService,
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

      try {
        await this.teamMembersService.create(team._id, userId, 'boss');
      } catch (memberError) {
        await this.teamModel.findByIdAndDelete(team._id);
        this.logger.error(
          'Rolled back team creation: boss membership failed',
          memberError,
        );
        throw memberError;
      }

      return {
        id: team._id,
        name: team.name,
      };
    } catch (error) {
      this.logger.error('Error creating team', error);
      throw error;
    }
  }

  /** @deprecated Prefira `POST /team-members/join` */
  async join(data: JoinTeamDto, userId: string) {
    return this.teamMembersService.joinByInviteCode(data, userId);
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

      const members = await this.teamMembersService.findAllByTeam(id);

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

  async createTask(teamId: string, data: CreateTeamTaskDto, userId: string) {
    try {
      await this.teamMembersService.assertBoss(teamId, userId);

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
