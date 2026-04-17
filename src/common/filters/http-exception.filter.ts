/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'object'
        ? (exceptionResponse as any).message
        : exceptionResponse;

    const errorResponse = {
      statusCode: status,
      message: message || 'An error occurred',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(`HTTP Exception: ${request.method} ${request.url} - Status: ${status}`);

    response.status(status).json(errorResponse);
  }
}
