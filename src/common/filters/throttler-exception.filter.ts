/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ThrottlerExceptionFilter.name);

  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    const errorResponse = {
      statusCode: status,
      message: 'Too many requests. Please try again later.',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.warn(`Throttler Exception: ${request.method} ${request.url} - Status: ${status}`);
    response.status(status).json(errorResponse);
  }
}
