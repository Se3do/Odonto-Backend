import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, body } = this.toErrorBody(exception);

    if (statusCode >= 500) {
      this.logger.error(
        this.formatRequest(request),
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(statusCode).json({
      ...body,
      path: request.url,
    });
  }

  private toErrorBody(exception: unknown): {
    statusCode: number;
    body: ErrorResponseBody;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      if (
        typeof res === 'object' &&
        res !== null &&
        'message' in res &&
        Array.isArray((res as { message: string[] }).message)
      ) {
        return {
          statusCode: status,
          body: {
            statusCode: status,
            message: (res as { message: string[] }).message,
            error: (res as { error?: string }).error,
          },
        };
      }

      const message =
        typeof res === 'string' ? res : ((res as { message?: string }).message ?? exception.message);

      return {
        statusCode: status,
        body: { statusCode: status, message, error: exception.name },
      };
    }

    if (this.isPrismaError(exception)) {
      const mapping = this.mapPrismaError(exception);
      return {
        statusCode: mapping.statusCode,
        body: {
          statusCode: mapping.statusCode,
          message: mapping.message,
          error: 'DatabaseError',
        },
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: 'InternalServerError',
      },
    };
  }

  private isPrismaError(exception: unknown): boolean {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      typeof (exception as { code?: unknown }).code === 'string'
    );
  }

  private mapPrismaError(exception: unknown): {
    statusCode: number;
    message: string;
  } {
    const err = exception as { code?: string; meta?: { target?: string[] } };

    switch (err.code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          message: `A record with this ${(err.meta?.target ?? ['value']).join(', ')} already exists`,
        };
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Record not found',
        };
      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid reference to a related record',
        };
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error',
        };
    }
  }

  private formatRequest(request: Request): string {
    return `${request.method} ${request.url}`;
  }
}