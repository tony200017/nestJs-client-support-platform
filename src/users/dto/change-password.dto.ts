import { IsMongoId, IsString, MinLength } from 'class-validator';

export class ChangePasswordrDto {
  @IsString()
  @MinLength(6)
  oldPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
