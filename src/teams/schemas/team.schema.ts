import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomInt } from 'crypto';
import { Document, Types } from 'mongoose';

const INVITE_CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generateInviteCode(): string {
  return Array.from(
    { length: 8 },
    () => INVITE_CODE_ALPHABET[randomInt(INVITE_CODE_ALPHABET.length)],
  ).join('');
}

@Schema({ timestamps: true })
export class Team {
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: () => generateInviteCode(), unique: true })
  invite_code: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  created_by: Types.ObjectId;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
