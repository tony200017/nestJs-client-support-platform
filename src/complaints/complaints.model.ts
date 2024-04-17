import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ComplaintStatus } from './dto/create-complaint.dto';

export type ComplaintDocument = mongoose.HydratedDocument<Complaint>;

@Schema({ timestamps: true })
export class Complaint {
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Category' })
  categories: [mongoose.Schema.Types.ObjectId];

  @Prop()
  title: String;

  @Prop()
  description: String;

  @Prop({ default: ComplaintStatus.PENDING })
  status: ComplaintStatus;

  @Prop({ type: mongoose.Schema.ObjectId, ref: 'User' })
  createdBy: mongoose.Types.ObjectId;
}

export const ComplaintSchema = SchemaFactory.createForClass(Complaint);
ComplaintSchema.index({ createdBy: 1 });
