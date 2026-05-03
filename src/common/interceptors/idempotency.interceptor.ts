import {
  ConflictException,
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Request } from 'express';
import { RedisService } from '../redis/redis.service';
import { Observable } from 'rxjs';

interface AuthenticatedRequest extends Request {
  user?: { sub: number; email: string; role: string };
}
const IN_FLIGHT = 'in-flight';
const LOCK_TTL_SECONDS = 30;
const RESULT_TTL_SECONDS = 86400;
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const method = req.method.toUpperCase();
    const idempotencyKey = req.header('Idempotency-Key');

    if (!['POST', 'PUT', 'PATCH'].includes(method) || !idempotencyKey) {
      return next.handle();
    }
    const userId = this.extractUserIdFromRequest(req);
    if (!userId) {
      return next.handle();
    }

    const redisKey = `finledger:idem:${userId}:${idempotencyKey}`;

    return new Observable((observer) => {
      this.redisService
        .setNx(redisKey, IN_FLIGHT, LOCK_TTL_SECONDS)
        .then((claimed) => {
          if (!claimed) {
            return this.redisService.get(redisKey).then((cached) => {
              if (cached && cached !== IN_FLIGHT) {
                observer.next(JSON.parse(cached));
                observer.complete();
              } else {
                observer.error(
                  new ConflictException(
                    'A request with this Idempotency-Key is already being processed',
                  ),
                );
              }
            });
          }

          next.handle().subscribe({
            next: (response) => {
              this.redisService
                .set(redisKey, JSON.stringify(response), RESULT_TTL_SECONDS)
                .catch((err) => console.error('Failed to cache idempotentency result:', err));
              observer.next(response);
            },
            error: (err) => {
              this.redisService.del(redisKey).catch(() => {});
              observer.error(err);
            },
            complete: () => observer.complete(),
          });
        })
        .catch(() => {
          next.handle().subscribe({
            next: (response) => observer.next(response),
            error: (err) => observer.error(err),
            complete: () => observer.complete(),
          });
        });
    });
  }

  private extractUserIdFromRequest(req: AuthenticatedRequest): number | null {
    return req.user?.sub ?? null;
  }
}
