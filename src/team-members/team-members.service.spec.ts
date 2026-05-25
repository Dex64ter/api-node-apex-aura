import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { TeamMembersService } from './team-members.service';
import { Team } from 'src/teams/schemas/team.schema';
import { TeamMember } from './schemas/team-member.schema';

describe('TeamMembersService', () => {
  let service: TeamMembersService;

  const teamModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
  };

  const teamMemberModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamMembersService,
        { provide: getModelToken(Team.name), useValue: teamModel },
        { provide: getModelToken(TeamMember.name), useValue: teamMemberModel },
      ],
    }).compile();

    service = module.get<TeamMembersService>(TeamMembersService);
  });

  describe('joinByInviteCode', () => {
    const userId = '507f1f77bcf86cd799439011';
    const team = { _id: '507f1f77bcf86cd799439012', name: 'Squad Aura' };

    it('creates membership when invite code is valid', async () => {
      teamModel.findOne.mockResolvedValue(team);
      teamMemberModel.findOne.mockResolvedValue(null);
      teamMemberModel.create.mockResolvedValue({
        populate: jest.fn().mockResolvedValue({}),
      });

      const result = await service.joinByInviteCode(
        { invite_code: 'ab12cd34' },
        userId,
      );

      expect(teamModel.findOne).toHaveBeenCalledWith({
        invite_code: 'AB12CD34',
      });
      expect(teamMemberModel.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: team._id,
        name: team.name,
        role: 'member',
      });
    });

    it('throws NotFoundException when invite code is invalid', async () => {
      teamModel.findOne.mockResolvedValue(null);

      await expect(
        service.joinByInviteCode({ invite_code: 'ZZZZZZZZ' }, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when user is already a member', async () => {
      teamModel.findOne.mockResolvedValue(team);
      teamMemberModel.findOne.mockResolvedValue({ role: 'member' });

      await expect(
        service.joinByInviteCode({ invite_code: 'AB12CD34' }, userId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAllByTeam', () => {
    it('returns members from teammembers collection', async () => {
      const teamId = '507f1f77bcf86cd799439012';
      const members = [{ role: 'boss' }, { role: 'member' }];

      teamModel.findById.mockResolvedValue({ _id: teamId });
      teamMemberModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(members),
      });

      const result = await service.findAllByTeam(teamId);

      expect(result).toEqual(members);
    });
  });

  describe('assertBoss', () => {
    const teamId = '507f1f77bcf86cd799439012';
    const userId = '507f1f77bcf86cd799439011';

    it('throws ForbiddenException when user is not boss', async () => {
      teamMemberModel.findOne.mockResolvedValue({ role: 'member' });

      await expect(service.assertBoss(teamId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
