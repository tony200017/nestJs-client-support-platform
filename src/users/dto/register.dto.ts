import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class RegisterDto extends OmitType(CreateUserDto, [
  'isAdmin',
  'isActive',
  'isVIP',
  'isEmployee',
] as const) {}
