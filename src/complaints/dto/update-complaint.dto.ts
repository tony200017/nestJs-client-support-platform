import { PartialType, PickType } from '@nestjs/mapped-types';
import { ComplaintStatus, CreateComplaintDto } from './create-complaint.dto';
import { IsEnum } from 'class-validator';

export class UpdateComplaintDto {
  @IsEnum(ComplaintStatus)
  status: ComplaintStatus;
}
