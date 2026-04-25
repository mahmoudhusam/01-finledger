import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const GetUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const { sub: userId, email, role } = request.user || {};
  if (!userId) {
    return null;
  }
  return { userId, email, role };
});
