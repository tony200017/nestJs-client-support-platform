import {
  IsDate,
  IsEmail,
  IsMongoId,
  IsNumber,
  IsString,
} from 'class-validator';
import mongoose from 'mongoose';

export class CreateOtpDto {
  @IsString()
  otp: string;
  @IsEmail()
  email: string;
  @IsDate()
  otpExpires: Date;
  @IsNumber()
  retrycount: number;
  @IsMongoId()
  userId: mongoose.Types.ObjectId;
  @IsString()
  verificationToken: string;
}
