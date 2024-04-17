import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type OtpDocument = mongoose.HydratedDocument<Otp>;

@Schema({ timestamps: true })
export class Otp {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop()
  title: String;

  @Prop()
  description: String;

  @Prop()
  otp: string;
  @Prop()
  email: string;
  @Prop({ type: Date })
  otpExpires: Date;
  @Prop()
  retrycount: number;

  @Prop()
  verificationToken: string;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
OtpSchema.index({ userId: 1 });
