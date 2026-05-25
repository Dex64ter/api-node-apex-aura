import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  auraReward: number;

  @Prop({ required: true })
  penaltyAura: number;

  @Prop({ required: true })
  deadline: Date;

  @Prop({
    enum: ['open', 'in_progress', 'pending_review', 'completed', 'expired'],
    default: 'open',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
