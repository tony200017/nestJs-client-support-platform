import { IsBoolean } from 'class-validator';
export class RoleUpdatDto {
  @IsBoolean()
  isAdmin: boolean;
}
