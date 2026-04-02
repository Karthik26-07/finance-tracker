import { logger } from './logger'

/**
 * Custom error types for the application
 */
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

/**
 * Authentication-specific errors
 */
export class AuthError extends AppError {
  constructor(code: string, message: string, statusCode: number = 401) {
    super(code, message, statusCode, true)
    Object.setPrototypeOf(this, AuthError.prototype)
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400, true)
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

/**
 * Database errors
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super('DATABASE_ERROR', message, 500, true)
    Object.setPrototypeOf(this, DatabaseError.prototype)
  }
}

/**
 * Rate limit errors
 */
export class RateLimitError extends AppError {
  constructor() {
    super('RATE_LIMIT', 'Too many requests. Please try again later.', 429, true)
    Object.setPrototypeOf(this, RateLimitError.prototype)
  }
}

/**
 * Account locked errors
 */
export class AccountLockedError extends AppError {
  constructor(public unlockTime?: Date) {
    super('ACCOUNT_LOCKED', 'Account is temporarily locked due to too many failed login attempts.', 429, true)
    Object.setPrototypeOf(this, AccountLockedError.prototype)
  }
}

/**
 * Error response interface for client
 */
export interface ErrorResponse {
  error: string
  code?: string
  timestamp?: string
}

/**
 * Success response interface
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SuccessResponse<T = any> {
  success: true
  data?: T
  timestamp?: string
}

/**
 * Generic action response
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionResponse<T = any> = (SuccessResponse<T> | ErrorResponse) & {
  timestamp: string
}

/**
 * Handle errors safely for server actions
 * Returns consistent error response and logs full error details
 */
export async function handleActionError(
  error: unknown,
  context: Record<string, string | number | boolean | undefined> = {}
): Promise<ErrorResponse> {
  if (error instanceof AuthError) {
    await logger.security(`AUTH_ERROR: ${error.code}`, {
      ...context,
      message: error.message,
      statusCode: error.statusCode,
    }, 'warn')
    return {
      error: error.message,
      code: error.code,
    }
  }

  if (error instanceof ValidationError) {
    await logger.debug('Validation error', {
      ...context,
      message: error.message,
    })
    return {
      error: error.message,
      code: error.code,
    }
  }

  if (error instanceof RateLimitError) {
    await logger.security('RATE_LIMIT_EXCEEDED', context, 'warn')
    return {
      error: error.message,
      code: error.code,
    }
  }

  if (error instanceof AccountLockedError) {
    await logger.security('ACCOUNT_LOCKED', {
      ...context,
      unlockTime: error.unlockTime?.toISOString(),
    }, 'warn')
    return {
      error: error.message,
      code: error.code,
    }
  }

  if (error instanceof AppError) {
    await logger.error(error, {
      ...context,
      code: error.code,
      statusCode: error.statusCode,
    })
    return {
      error: error.message,
      code: error.code,
    }
  }

  // Unknown error - log full details, return generic message
  if (error instanceof Error) {
    await logger.error(error, {
      ...context,
      type: 'UNKNOWN_ERROR',
    })
  } else {
    await logger.error(new Error('Unknown error type'), {
      ...context,
      errorValue: JSON.stringify(error),
    })
  }

  return {
    error: 'An unexpected error occurred. Please try again later.',
    code: 'INTERNAL_SERVER_ERROR',
  }
}

/**
 * Validate FormData input exists and is not null
 */
export function getFormDataString(formData: FormData, field: string): string {
  const value = formData.get(field)
  if (!value || typeof value !== 'string') {
    throw new ValidationError(`${field} is required and must be a string`)
  }
  return value.trim()
}

/**
 * Validate FormData input is non-empty
 */
export function getFormDataOptional(formData: FormData, field: string): string | null {
  const value = formData.get(field)
  if (!value) return null
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} must be a string`)
  }
  return value.trim() || null
}
