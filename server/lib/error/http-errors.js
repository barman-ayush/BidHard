import { AppError } from "./AppError.js"

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details = undefined) {
    super(message, 400, details)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", details = undefined) {
    super(message, 409, details)
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error", details = undefined) {
    super(message, 500, details, false)
  }
}
