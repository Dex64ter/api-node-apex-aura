import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class TeamMembersSchema {
  _id: string;

  @Prop()
  teamId: string;

  @Prop()
  userId: string;
}
