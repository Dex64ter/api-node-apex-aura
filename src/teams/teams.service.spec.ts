import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { Team } from './schemas/team.schema';
import { TeamMember } from './schemas/team-member.schema';
import { Task } from 'src/tasks/schemas/tasks.schema';

describe('TeamsService', () => {
  let service: TeamsService;

  const teamModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  } as {
    findOne: jest.Mock;
    create: jest.Mock;
    find: jest.Mock;
    findById: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    findByIdAndDelete: jest.Mock;
  };

  const teamMemberModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
  };

  const taskModel = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        { provide: getModelToken(Team.name), useValue: teamModel },
        { provide: getModelToken(TeamMember.name), useValue: teamMemberModel },
        { provide: getModelToken(Task.name), useValue: taskModel },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
  });

  describe('join', () => {
    const userId = 'user-123';
    const team = { _id: 'team-456', name: 'Squad Aura' };

    it('adds user as member when invite code is valid', async () => {
      teamModel.findOne.mockResolvedValue(team);
      teamMemberModel.findOne.mockResolvedValue(null);
      teamMemberModel.create.mockResolvedValue({});

      const result = await service.join({ invite_code: 'ab12cd34' }, userId);

      expect(teamModel.findOne).toHaveBeenCalledWith({
        invite_code: 'AB12CD34',
      });
      expect(teamMemberModel.create).toHaveBeenCalledWith({
        teamId: team._id,
        userId,
        role: 'member',
      });
      expect(result).toEqual({
        id: team._id,
        name: team.name,
        role: 'member',
      });
    });

    it('throws NotFoundException when invite code does not exist', async () => {
      teamModel.findOne.mockResolvedValue(null);

      await expect(
        service.join({ invite_code: 'ZZZZZZZZ' }, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when user is already a member', async () => {
      teamModel.findOne.mockResolvedValue(team);
      teamMemberModel.findOne.mockResolvedValue({ role: 'member' });

      await expect(
        service.join({ invite_code: 'AB12CD34' }, userId),
      ).rejects.toThrow(ConflictException);
      expect(teamMemberModel.create).not.toHaveBeenCalled();
    });

    it('does not update embedded members on the team document', async () => {
      teamModel.findOne.mockResolvedValue(team);
      teamMemberModel.findOne.mockResolvedValue(null);
      teamMemberModel.create.mockResolvedValue({});

      await service.join({ invite_code: 'AB12CD34' }, userId);

      expect(teamModel.create).not.toHaveBeenCalled();
      expect(teamMemberModel.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMembers', () => {
    it('returns members from teammembers collection', async () => {
      const team = { _id: 'team-456' };
      const members = [
        { userId: 'user-1', role: 'boss' },
        { userId: 'user-2', role: 'member' },
      ];

      teamModel.findById.mockResolvedValue(team);
      teamMemberModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(members),
      });

      const result = await service.getMembers(team._id);

      expect(teamMemberModel.find).toHaveBeenCalledWith({ teamId: team._id });
      expect(result).toEqual(members);
    });

    it('throws NotFoundException when team does not exist', async () => {
      teamModel.findById.mockResolvedValue(null);

      await expect(service.getMembers('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
