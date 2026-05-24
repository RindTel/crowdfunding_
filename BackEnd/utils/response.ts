import { Response } from 'express';
import { HttpStatus } from '../types/errors';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class ResponseBuilder {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = HttpStatus.OK) {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
    } satisfies ApiResponse<T>);
  }

  static created<T>(res: Response, data: T, message = 'Created successfully') {
    return this.success(res, data, message, HttpStatus.CREATED);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    meta: PaginationMeta,
    message = 'Success'
  ) {
    return res.status(HttpStatus.OK).json({
      success: true,
      data,
      message,
      meta,
    } satisfies ApiResponse<T[]>);
  }

  static noContent(res: Response) {
    return res.status(HttpStatus.NO_CONTENT).send();
  }
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
