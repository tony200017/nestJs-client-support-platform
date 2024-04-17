import { IsEnum, IsInt, IsMongoId, IsOptional, Min } from 'class-validator';
import { ComplaintStatus } from './create-complaint.dto';
import { Type } from 'class-transformer';

export class QueryDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit: number = 3;
}
