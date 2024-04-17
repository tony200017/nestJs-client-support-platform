import {
  IsString,
  IsEmail,
  MinLength,
  IsIn,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  firstName: string;

  @IsString()
  @MinLength(3)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsBoolean()
  @IsOptional()
  isAdmin: boolean;

  @IsBoolean()
  @IsOptional()
  isEmployee: boolean;

  @IsBoolean()
  @IsOptional()
  isVIP: boolean;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
