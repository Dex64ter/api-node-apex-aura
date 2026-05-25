import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamSchema } from './schemas/team.schema';
import { TaskSchema } from 'src/tasks/schemas/tasks.schema';
import { TeamMembersModule } from 'src/team-members/team-members.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Team', schema: TeamSchema },
      { name: 'Task', schema: TaskSchema },
    ]),
    TeamMembersModule,
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
