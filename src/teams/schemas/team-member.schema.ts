import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class TeamMember {
  @Prop({ type: Types.ObjectId, ref: 'Team' })
  teamId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ enum: ['member', 'boss'], default: 'member' })
  role: string;
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);