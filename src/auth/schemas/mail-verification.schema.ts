import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class EmailVerification {
  @Prop({ required: true })
  email!: string;

  @Prop()
  code!: string;

  @Prop()
  expiresAt!: Date;

  @Prop({ default: false })
  verified!: boolean;
}

export const EmailVerificationSchema =
  SchemaFactory.createForClass(EmailVerification);
