import { Request, Response, NextFunction } from 'express';
import { ApiError, HttpStatus } from '../types/errors';
import { Prisma } from '@prisma/client';
import { config } from '../config/env';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Internal server error';
  let errors: unknown[] | undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = handlePrismaError(err).statusCode;
    message = handlePrismaError(err).message;
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Invalid data provided';
  }

  const response: Record<string, unknown> = {
    success: false,
    message,
    data: null,
  };

  if (errors) response.errors = errors;
  if (config.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
}

function handlePrismaError(err: Prisma.PrismaClientKnownRequestError) {
  switch (err.code) {
    case 'P2002':
      return {
        statusCode: HttpStatus.CONFLICT,
        message: `Unique constraint violation on: ${(err.meta?.target as string[])?.join(', ')}`,
      };
    case 'P2025':
      return { statusCode: HttpStatus.NOT_FOUND, message: 'Record not found' };
    case 'P2003':
      return { statusCode: HttpStatus.BAD_REQUEST, message: 'Foreign key constraint failed' };
    default:
      return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Database error' };
  }
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route ${req.method} ${req.path}`));
}
