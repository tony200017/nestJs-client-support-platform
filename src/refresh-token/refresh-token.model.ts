import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type RefreshTokenDocument = mongoose.HydratedDocument<RefreshToken>;

@Schema({ timestamps: true })
export class RefreshToken {
  @Prop()
  refreshToken: string;
  @Prop({ type: Date })
  tokenExpires: Date;
  @Prop({ type: mongoose.Types.ObjectId })
  userId: mongoose.Types.ObjectId;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
