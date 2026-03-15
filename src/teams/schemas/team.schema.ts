import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { customAlphabet } from 'nanoid';

const generateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

@Schema({ timestamps: true })
export class Team {
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: () => generateCode(), unique: true })
  invite_code: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  created_by: Types.ObjectId;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
