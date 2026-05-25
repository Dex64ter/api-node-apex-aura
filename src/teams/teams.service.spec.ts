import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { Team } from './schemas/team.schema';
import { Task } from 'src/tasks/schemas/tasks.schema';
import { TeamMembersService } from 'src/team-members/team-members.service';

describe('TeamsService', () => {
  let service: TeamsService;

  const teamModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const taskModel = {
    create: jest.fn(),
  };

  const teamMembersService = {
    create: jest.fn(),
    joinByInviteCode: jest.fn(),
    findAllByTeam: jest.fn(),
    assertBoss: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        { provide: getModelToken(Team.name), useValue: teamModel },
        { provide: getModelToken(Task.name), useValue: taskModel },
        { provide: TeamMembersService, useValue: teamMembersService },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('registers creator as boss via TeamMembersService', async () => {
      const team = { _id: 'team-1', name: 'Squad' };
      teamModel.findOne.mockResolvedValue(null);
      teamModel.create.mockResolvedValue(team);
      teamMembersService.create.mockResolvedValue({});

      await service.create({ name: 'Squad' }, 'user-1');

      expect(teamMembersService.create).toHaveBeenCalledWith(
        team._id,
        'user-1',
        'boss',
      );
      expect(teamModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('deletes the team when boss membership creation fails', async () => {
      const team = { _id: '507f1f77bcf86cd799439012', name: 'Squad' };
      const memberError = new Error('membership failed');

      teamModel.findOne.mockResolvedValue(null);
      teamModel.create.mockResolvedValue(team);
      teamMembersService.create.mockRejectedValue(memberError);
      teamModel.findByIdAndDelete.mockResolvedValue(team);

      await expect(service.create({ name: 'Squad' }, 'user-1')).rejects.toThrow(
        memberError,
      );

      expect(teamModel.findByIdAndDelete).toHaveBeenCalledWith(team._id);
    });
  });

  describe('join', () => {
    it('delegates to TeamMembersService.joinByInviteCode', async () => {
      teamMembersService.joinByInviteCode.mockResolvedValue({
        id: 'team-1',
        name: 'Squad',
        role: 'member',
      });

      const result = await service.join({ invite_code: 'AB12CD34' }, 'user-2');

      expect(teamMembersService.joinByInviteCode).toHaveBeenCalled();
      expect(result.role).toBe('member');
    });
  });
});
