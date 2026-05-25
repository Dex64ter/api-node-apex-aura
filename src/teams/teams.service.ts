import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team } from './schemas/team.schema';
import { CreateTeamDto } from './dto/create-team.dto';
import { JoinTeamDto } from './dto/join-team.dto';
import { TeamMember } from './schemas/team-member.schema';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    @InjectModel(Team.name)
    private teamModel: Model<Team>,

    @InjectModel(TeamMember.name)
    private teamMemberModel: Model<TeamMember>,
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
      return team;
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
}
