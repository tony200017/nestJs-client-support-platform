import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateOtpDto } from './create-otp.dto';
import { ResetPasswordDto } from './reset-password.dto';

export class VerifyOtpDto extends PickType(ResetPasswordDto, ['otp']) {}
