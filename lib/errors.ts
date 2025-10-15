/**
 * Simple Centralized Error Handling
 *
 * Basic error classes and handler as suggested in IMPROVEMENTS.md
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, "DATABASE_ERROR", 500);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;
    super(message, "NOT_FOUND_ERROR", 404);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Please sign in") {
    super(message, "AUTHENTICATION_ERROR", 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "You don't have access") {
    super(message, "AUTHORIZATION_ERROR", 403);
  }
}

/**
 * Simple error handler
 */
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) {
    return new AppError(error.message, "UNKNOWN_ERROR");
  }
  return new AppError("An unexpected error occurred", "UNKNOWN_ERROR");
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: AppError): string {
  switch (error.code) {
    case "DATABASE_ERROR":
      return "System error, please try again later.";
    case "VALIDATION_ERROR":
      return "Please check your input";
    case "AUTHENTICATION_ERROR":
      return "Please sign in to continue.";
    case "AUTHORIZATION_ERROR":
      return "You don't have access";
    case "NOT_FOUND_ERROR":
      return "The requested resource was not found.";
    default:
      return "Something went wrong. Please try again.";
  }
}
