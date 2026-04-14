import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class TaskExecution {
  @Prop({ type: Types.ObjectId, ref: 'Task' })
  taskId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId!: Types.ObjectId;

  @Prop()
  status!: string; // pending_review, approved, rejected

  @Prop()
  proof!: string; // imagem, texto, etc

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedBy!: Types.ObjectId;
}

export const TaskExecutionSchema = SchemaFactory.createForClass(TaskExecution);
