import { Test, TestingModule } from '@nestjs/testing';
import {
  TeamMemberActionsController,
  TeamMembersController,
} from './team-members.controller';
import { TeamMembersService } from './team-members.service';

describe('TeamMembersController', () => {
  const teamMembersService = {
    findAllByTeam: jest.fn(),
    findOne: jest.fn(),
    addByBoss: jest.fn(),
    updateRole: jest.fn(),
    remove: jest.fn(),
    joinByInviteCode: jest.fn(),
    findTeamsByUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('TeamMembersController', () => {
    let controller: TeamMembersController;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [TeamMembersController],
        providers: [
          { provide: TeamMembersService, useValue: teamMembersService },
        ],
      }).compile();

      controller = module.get<TeamMembersController>(TeamMembersController);
    });

    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('TeamMemberActionsController', () => {
    let controller: TeamMemberActionsController;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [TeamMemberActionsController],
        providers: [
          { provide: TeamMembersService, useValue: teamMembersService },
        ],
      }).compile();

      controller = module.get<TeamMemberActionsController>(
        TeamMemberActionsController,
      );
    });

    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });
});
