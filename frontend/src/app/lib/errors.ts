// ============================================================================
// Custom Error Types
// ============================================================================

export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error. Please check your connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout. Please try again.') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Please log in to continue.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'You do not have permission to access this.') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found.') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export type AppError =
  | APIError
  | NetworkError
  | ValidationError
  | TimeoutError
  | UnauthorizedError
  | ForbiddenError
  | NotFoundError
  | Error;

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Determines if an error is a network error
 */
export function isNetworkError(error: unknown): error is NetworkError {
  if (error instanceof TypeError) {
    return error.message.includes('fetch') || error.message.includes('network');
  }
  return error instanceof NetworkError;
}

/**
 * Determines if an error is an API error
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Determines if an error is an authorization error
 */
export function isUnauthorized(error: unknown): error is UnauthorizedError {
  return error instanceof UnauthorizedError || (error instanceof APIError && error.statusCode === 401);
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Parse and normalize errors from various sources
 */
export function parseError(error: unknown): AppError {
  // Already a known error type
  if (error instanceof APIError) {
    return error;
  }

  if (error instanceof NetworkError) {
    return error;
  }

  if (error instanceof ValidationError) {
    return error;
  }

  if (error instanceof TimeoutError) {
    return error;
  }

  if (error instanceof UnauthorizedError) {
    return error;
  }

  if (error instanceof ForbiddenError) {
    return error;
  }

  if (error instanceof NotFoundError) {
    return error;
  }

  // Handle native Error objects
  if (error instanceof Error) {
    // Check for specific error types by message or name
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return new UnauthorizedError();
    }

    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return new ForbiddenError();
    }

    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return new NotFoundError();
    }

    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return new NetworkError(error.message);
    }

    if (error.message.includes('timeout')) {
      return new TimeoutError(error.message);
    }

    return error;
  }

  // Handle unknown error types
  return new Error('An unexpected error occurred');
}

/**
 * Log error for debugging (can be extended for error tracking services)
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context || 'Error'}]`, error);
  }

  // TODO: Send to error tracking service (Sentry, etc.)
  // if (isProduction) {
  //   errorTracker.captureException(error);
  // }
}

/**
 * Handle API errors and throw appropriate error types
 */
export function handleAPIError(statusCode: number, body: unknown): never {
  let message = `API Error: ${statusCode}`;
  let code = 'API_ERROR';

  if (typeof body === 'string' && body) {
    message = body;
  } else if (typeof body === 'object' && body !== null) {
    const data = body as any;
    message = data.message || data.error || message;
    code = data.code || code;
  }

  switch (statusCode) {
    case 400:
      throw new ValidationError(message);
    case 401:
      throw new UnauthorizedError(message);
    case 403:
      throw new ForbiddenError(message);
    case 404:
      throw new NotFoundError(message);
    case 408:
    case 504:
      throw new TimeoutError(message);
    default:
      throw new APIError(code, message, statusCode, body);
  }
}
