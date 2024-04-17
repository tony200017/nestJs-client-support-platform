import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

import { UsersService } from '../users/users.service';
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private userService: UsersService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const id = request.id;
    const userRole = await this.userService.getRole(id.toString());
    if (userRole.isAdmin) {
      return true;
    } else {
      return false;
    }
  }
}
