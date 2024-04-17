import { IsString, MaxLength, MinLength, minLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  otp: string;

  @IsString()
  @MinLength(6)
  password: string;
}
