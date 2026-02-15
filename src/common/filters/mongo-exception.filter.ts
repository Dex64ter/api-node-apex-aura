import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

@Catch(MongoError, MongooseError)
export class MongoExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MongoExceptionFilter.name);

  catch(exception: MongoError | MongooseError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Database Error';

    this.logger.error(`MongoDB Error: ${exception.message}`, exception.stack);

    // Duplicate key error
    if ('code' in exception && exception.code === 11000) {
      status = HttpStatus.CONFLICT;
      message = 'Duplicate entry found';
      error = 'Conflict';
    }
    // Validation error
    else if (exception.name === 'ValidationError') {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      error = 'Validation Error';
    }
    // Connection errors
    else if (
      exception.message.includes('connect') ||
      exception.message.includes('ECONNREFUSED') ||
      exception.message.includes('buffering timed out')
    ) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database connection unavailable. Please try again later.';
      error = 'Service Unavailable';
    }
    // Cast error (invalid ObjectId)
    else if (exception.name === 'CastError') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data format';
      error = 'Bad Request';
    }

    response.status(status).json({
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
