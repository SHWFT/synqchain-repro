import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationError } from 'class-validator';

export interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path: string;
  method: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let errorResponse: ErrorResponse;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (status === HttpStatus.UNPROCESSABLE_ENTITY && typeof exceptionResponse === 'object') {
        // Handle validation errors
        errorResponse = {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: exceptionResponse,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
        };
      } else {
        errorResponse = {
          code: this.getErrorCode(status),
          message: typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).message || 'An error occurred',
          details: typeof exceptionResponse === 'object' ? exceptionResponse : undefined,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
        };
      }
    } else {
      // Handle unexpected errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      };

      // Log unexpected errors
      this.logger.error('Unexpected error:', exception);
    }

    // Log the error for monitoring
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${errorResponse.message}`,
      exception instanceof Error ? exception.stack : exception,
    );

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'VALIDATION_ERROR';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMIT_EXCEEDED';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'INTERNAL_SERVER_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }
}
