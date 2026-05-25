import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamSchema } from 'src/teams/schemas/team.schema';
import { TeamMemberSchema } from './schemas/team-member.schema';
import { TeamMembersService } from './team-members.service';
import {
  TeamMemberActionsController,
  TeamMembersController,
} from './team-members.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Team', schema: TeamSchema },
      { name: 'TeamMember', schema: TeamMemberSchema },
    ]),
  ],
  controllers: [TeamMembersController, TeamMemberActionsController],
  providers: [TeamMembersService],
  exports: [TeamMembersService],
})
export class TeamMembersModule {}
