export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: unknown[];

  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    isOperational = true,
    errors?: unknown[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: unknown[]) {
    return new ApiError(message, HttpStatus.BAD_REQUEST, true, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(message, HttpStatus.UNAUTHORIZED);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(message, HttpStatus.FORBIDDEN);
  }

  static notFound(resource: string) {
    return new ApiError(`${resource} not found`, HttpStatus.NOT_FOUND);
  }

  static conflict(message: string) {
    return new ApiError(message, HttpStatus.CONFLICT);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(message, HttpStatus.INTERNAL_SERVER_ERROR, false);
  }
}
