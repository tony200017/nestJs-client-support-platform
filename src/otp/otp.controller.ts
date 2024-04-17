import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OtpService } from './otp.service';
import { CreateOtpDto } from './dto/create-otp.dto';
import { UpdateOtpDto } from './dto/update-otp.dto';
import { get } from 'http';
import { VerifyOtpDto } from './dto/update-otp.dto copy';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send/:email')
  async create(@Param('email') email: string) {
    return await this.otpService.sendOtp(email);
  }

  @Get('resend/:Token')
  async resendOTP(@Param('Token') token: string) {
    return await this.otpService.resendemail(token);
  }

  @Post('verify/:Token')
  async verifyOTP(@Param('Token') token: string, @Body() body: VerifyOtpDto) {
    return this.otpService.verifyOTP(token, body.otp);
  }

  @Post('reset/:Token')
  async resetPassword(
    @Param('Token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return await this.otpService.resetPassword(
      token,
      resetPasswordDto.otp,
      resetPasswordDto.password,
    );
  }
}
