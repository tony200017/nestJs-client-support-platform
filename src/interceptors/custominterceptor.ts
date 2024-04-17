import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ComplaintsService } from 'src/complaints/complaints.service';

@Injectable()
export class IdAppender implements NestInterceptor {
  constructor(private complaintService: ComplaintsService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const currentCount = await this.complaintService.countDocuments();
    // console.log(request.body);
    request.body.title = `${request.body.title}#${currentCount + 1}`;
    return next.handle();
  }
}
