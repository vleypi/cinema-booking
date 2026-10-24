import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { FieldErrors } from '@/common/validation/validation-errors.js';

export const INTERNAL_ERROR_MESSAGE = 'Внутренняя ошибка сервера';

export interface IApiErrorBody {
  statusCode: number;
  message: string;
  errors?: FieldErrors;
}

interface IHttpExceptionResponse {
  message?: string | string[];
  errors?: FieldErrors;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  readonly #logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const body = exception instanceof HttpException ? this.#fromHttpException(exception) : this.#fromUnknown(exception);
    const { httpAdapter } = this.httpAdapterHost;

    httpAdapter.reply(host.switchToHttp().getResponse(), body, body.statusCode);
  }

  #fromHttpException(exception: HttpException): IApiErrorBody {
    const response = exception.getResponse();
    const { message, errors } = typeof response === 'string' ? { message: response } : (response as IHttpExceptionResponse);

    return {
      statusCode: exception.getStatus(),
      message: Array.isArray(message) ? message.join('; ') : (message ?? exception.message),
      ...(errors && { errors }),
    };
  }

  #fromUnknown(exception: unknown): IApiErrorBody {
    this.#logger.error(exception instanceof Error ? exception.stack : String(exception));

    return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: INTERNAL_ERROR_MESSAGE };
  }
}
