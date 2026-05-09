import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as crypto from 'crypto';
import { tap } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<Response>();
    const requestId = crypto.randomUUID();
    return next.handle().pipe(
      tap(() => {
        response.header('X-Request-ID', requestId);
      }),
    );
  }
}
