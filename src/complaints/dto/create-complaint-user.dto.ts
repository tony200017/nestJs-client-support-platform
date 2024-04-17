import { OmitType } from '@nestjs/mapped-types';
import { CreateComplaintDto } from './create-complaint.dto';

export class CreateUserComplaintDto extends OmitType(CreateComplaintDto, [
  'createdBy',
] as const) {}
