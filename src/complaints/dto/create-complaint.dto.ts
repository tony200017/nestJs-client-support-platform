import { ConfigService } from '@nestjs/config';
import { IsMongoId, IsString, IsEnum, IsArray } from 'class-validator';
import mongoose from 'mongoose';

export enum ComplaintStatus {
  PENDING = 'PENDING',
  INPROGRESS = 'INPROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

export class CreateComplaintDto {
  @IsArray()
  @IsMongoId({ each: true })
  categories: [mongoose.Schema.Types.ObjectId];

  @IsString()
  title: String;

  @IsString()
  description: String;

  //@IsEnum(ComplaintStatus)
  //status: ComplaintStatus;

  @IsMongoId()
  createdBy: mongoose.Types.ObjectId;
}
