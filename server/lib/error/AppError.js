// Base class: Inherit this to create other error subclasses
export class AppError extends Error {
  constructor(
    message,
    statusCode = 500,
    details = undefined,
    isOperational = true
  ) {
    super(message);

    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}
