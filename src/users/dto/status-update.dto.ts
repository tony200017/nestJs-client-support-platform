import { IsBoolean } from 'class-validator';

export class statusUpdateDto {
  @IsBoolean()
  isActive: boolean;
}
