'use server'

import { handleActionError, ErrorResponse } from './errors'
import { logger } from './logger'

/**
 * Global server action middleware
 * Wraps all server actions with automatic error handling
 *
 * This eliminates the need for try-catch blocks in each action
 * All errors are automatically caught, logged, and returned as ErrorResponse
 */

interface ActionContext {
  action: string
  userId?: string
  [key: string]: string | number | boolean | undefined
}

/**
 * Safe wrapper for server actions
 * Automatically catches ALL errors and returns proper response
 * No try-catch needed inside the handler
 *
 * @param handler - The server action handler
 * @param context - Action name and context
 * @returns Wrapped handler that automatically handles errors
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function executeServerAction<T = any>(
  handler: () => Promise<T | ErrorResponse | void>,
  context: ActionContext
): Promise<T | ErrorResponse> {
  try {
    const result = await handler()

    // If handler returns error, it's already been logged by the handler
    if (result && typeof result === 'object' && 'error' in result) {
      return result as ErrorResponse
    }

    // Success
    return result as T
  } catch (error) {
    // Global error handler - catches ALL unhandled exceptions
    const errorResponse = await handleActionError(error, {
      action: context.action,
      userId: context.userId,
    })

    // Additional security logging for unexpected errors
    if (error instanceof Error) {
      await logger.security('UNHANDLED_SERVER_ACTION_ERROR', {
        action: context.action,
        userId: context.userId,
        errorType: error.constructor.name,
        message: error.message,
      }, 'error')
    }

    return errorResponse
  }
}

/**
 * Type-safe wrapper with automatic logging
 * Use this for actions that need specific context
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function safeAction<TInput, TOutput = any>(
  name: string,
  handler: (input: TInput) => Promise<TOutput | ErrorResponse>,
  input: TInput,
  userId?: string
): Promise<TOutput | ErrorResponse> {
  const startTime = Date.now()

  try {
    const result = await handler(input)

    // Log successful action
    const duration = Date.now() - startTime
    await logger.info(`Action completed: ${name}`, {
      action: name,
      userId,
      duration,
      status: 'success',
    })

    return result
  } catch (error) {
    const duration = Date.now() - startTime

    // Log failed action
    await logger.error(error as Error, {
      action: name,
      userId,
      duration,
      status: 'failed',
    })

    return handleActionError(error, {
      action: name,
      userId,
    })
  }
}
