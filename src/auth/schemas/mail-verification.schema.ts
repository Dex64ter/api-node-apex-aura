import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class EmailVerification {
  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  code!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ default: false })
  verified!: boolean;
}

export const EmailVerificationSchema =
  SchemaFactory.createForClass(EmailVerification);

// Indexes para excluir caso o email seja verificado
EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
EmailVerificationSchema.index({ email: 1 }, { unique: true });
