import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      throw new UnauthorizedException('Authorization header not found');
    }

    const token = request.headers.authorization.split(' ')[1];
    try {
      const verifyed = this.jwt.verify(token);
      if (verifyed) {
        request.id = this.jwt.decode(token).id;
        return true;
      } else {
        throw new UnauthorizedException();
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // Handle expired token error
        throw new UnauthorizedException('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        // Handle malformed or incorrectly signed token error
        throw new UnauthorizedException('Invalid token');
      } else {
        // Handle other errors
        throw new UnauthorizedException('Unauthorized');
      }
    }
  }
}
