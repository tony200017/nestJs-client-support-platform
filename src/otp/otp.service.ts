import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOtpDto } from './dto/create-otp.dto';
import { UpdateOtpDto } from './dto/update-otp.dto';
import { OtpModule } from './otp.module';
import { InjectModel } from '@nestjs/mongoose';
import { Otp } from './otp.model';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { from } from 'rxjs';
import { error } from 'console';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private otpModel: Model<Otp>,
    private mailService: MailerService,
    private userService: UsersService,
  ) {}

  async verifyOTP(token: string, otp: string) {
    const otpRecord = await this.otpModel.findOne({ verificationToken: token });
    if (!otpRecord) {
      throw new NotFoundException('otp not found');
    }
    if (otpRecord.otpExpires < new Date()) {
      throw new HttpException('expired', 400);
    }
    if (otp != otpRecord.otp) {
      otpRecord.retrycount++;
      otpRecord.save();
      throw new HttpException('wrong otp', 400);
    }

    return { token, status: true }; // Return the generated Token
  }

  async resetPassword(token: string, otp: string, password: string) {
    const otpRecord = await this.otpModel.findOne({ verificationToken: token });
    if (!otpRecord) {
      throw new NotFoundException('otp not found');
    }
    if (otpRecord.otpExpires < new Date()) {
      throw new HttpException('expired', 400);
    }
    if (otp != otpRecord.otp) {
      otpRecord.retrycount++;
      otpRecord.save();
      throw new HttpException('wrong otp', 400);
    }
    await this.userService.resetpassword(otpRecord.userId, password);
    await otpRecord.deleteOne();
    return;
  }

  async generateOTP() {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }

  async generateVerificationToken() {
    let token = randomBytes(20).toString('hex');
    return token;
  }

  async sendemail(email: string, otp: String) {
    this.mailService.sendMail({
      to: email,
      // from: '',
      subject: 'password reset',
      html: `<p>Your OTP is: <h1>${otp}</h1></p>
    <p></p>`,
    });
  }

  async resendemail(Token: string) {
    const otpRecord = await this.otpModel.findOne({ verificationToken: Token });
    if (!otpRecord) {
      throw new NotFoundException();
    }
    if (otpRecord.otpExpires < new Date()) {
      throw new HttpException('expired', 400);
    }
    //send email
    this.sendemail(otpRecord.email, otpRecord.otp);
    return { verficationToken: otpRecord.verificationToken }; // Return the generated OTP
  }

  create(createOtpDto: CreateOtpDto) {
    const createdBird = new this.otpModel(createOtpDto);
    return createdBird.save();
  }
  async sendOtp(email: string) {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      return;
    }
    let otp: CreateOtpDto = new CreateOtpDto();
    otp.otp = await this.generateOTP();
    otp.email = user.email;
    otp.otpExpires = new Date(Date.now() + 10 * 60000); // Set expiration time (10 minutes from now)
    otp.retrycount = 0;
    otp.userId = user.id;
    otp.verificationToken = await this.generateVerificationToken();
    await this.otpModel.create(otp);
    this.sendemail(otp.email, otp.otp);
    return { verficationToken: otp.verificationToken };
  }
}
