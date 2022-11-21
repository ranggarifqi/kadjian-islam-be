import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as _ from 'lodash';

import { Response } from 'express';
import { ErrorResponse } from '../response';

@Catch()
export class DefaultErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorResponse = this.getErrorResponse(exception);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  getErrorResponse(exception: unknown): ErrorResponse {
    console.log(exception);

    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (_.isObject(response)) {
        return response as ErrorResponse;
      }

      return {
        statusCode: exception.getStatus(),
        message: response,
      };
    }
    if (
      exception instanceof Prisma.PrismaClientKnownRequestError ||
      exception instanceof Prisma.PrismaClientUnknownRequestError ||
      exception instanceof Prisma.PrismaClientValidationError
    ) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Unknown error has happened',
    };
  }
}
