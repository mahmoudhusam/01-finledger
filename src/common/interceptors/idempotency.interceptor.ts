import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { RedisService } from '../services/redis.service';

interface AuthenticatedRequest extends Request {
  user?: { sub: number; email: string; role: string };
}

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const method = req.method.toUpperCase();
    const idempotencyKey = req.header('Idempotency-Key');

    if (['POST', 'PUT', 'PATCH'].includes(method) && idempotencyKey) {
      const userId = this.extractUserIdFromRequest(req);
      if (!userId) {
        return next.handle();
      }

      const redisKey = `finledger:idem:${userId}:${idempotencyKey}`;

      return new Observable((observer) => {
        this.redisService
          .get(redisKey)
          .then((cachedResponse) => {
            if (cachedResponse) {
              observer.next(JSON.parse(cachedResponse));
              observer.complete();
            } else {
              next.handle().subscribe({
                next: (response) => {
                  this.redisService.set(redisKey, JSON.stringify(response), 86400).catch((err) => {
                    console.error('Failed to cache response:', err);
                  });
                  observer.next(response);
                },
                error: (err) => observer.error(err),
                complete: () => observer.complete(),
              });
            }
          })
          .catch((err) => {
            observer.error(err);
          });
      });
    }

    return next.handle();
  }

  private extractUserIdFromRequest(req: AuthenticatedRequest): number | null {
    return req.user?.sub || null;
  }
}
