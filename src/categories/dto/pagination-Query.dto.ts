import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit: number = 3;
}
