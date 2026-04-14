import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamSchema } from './schemas/team.schema';
import { TeamMemberSchema } from './schemas/team-member.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Team', schema: TeamSchema },
      { name: 'TeamMember', schema: TeamMemberSchema },
    ]),
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
