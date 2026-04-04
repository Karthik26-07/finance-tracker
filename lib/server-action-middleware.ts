import { auth } from './auth'
import { AuthError, handleActionError, ErrorResponse } from './errors'
import { logger } from './logger'
import type { Session } from 'next-auth'

/**
 * Global server action middleware
 * Wraps all server actions with automatic error handling and authorization
 */

interface ActionContext {
  action: string
  userId?: string
  [key: string]: string | number | boolean | undefined
}

interface ActionOptions {
  isPublic?: boolean
}

/**
 * Safe wrapper for server actions
 * Automatically handles AUTH, logs errors, and returns proper response
 *
 * @param handler - The server action handler, receives session if authenticated
 * @param context - Action name and context for logging
 * @param options - Configure if this action requires auth (default: true)
 */
import { db } from './db'
import { sessions } from './db/schema'
import { eq, and } from 'drizzle-orm'

export async function executeServerAction<T = any>(
  handler: (session: Session | null) => Promise<T | ErrorResponse | void>,
  context: ActionContext,
  options: ActionOptions = { isPublic: false }
): Promise<T | ErrorResponse> {
  const startTime = Date.now()
  let session: Session | null = null

  try {
    // 1. Authorization check
    session = await auth()
    
    if (!options.isPublic) {
      if (!session?.user?.id) {
        throw new AuthError('UNAUTHORIZED', 'Authentication required to perform this action')
      }

      // 1b. HIGH SECURITY: DB-backed revocation check
      // This runs in Node runtime (Server Action context), so DB queries are safe.
      const [storedSession] = await db
        .select()
        .from(sessions)
        .where(and(
          eq(sessions.sessionToken, session.user.jti),
          eq(sessions.revoked, false)
        ))
        .limit(1)

      if (!storedSession) {
        await logger.security('AUTH_ACTION_REVOKED', { 
          action: context.action, 
          jti: session.user.jti, 
          userId: session.user.id 
        }, 'error')
        throw new AuthError('UNAUTHORIZED', 'Session has been revoked. Please log in again.')
      }
    }


    // 2. Execute handler
    const result = await handler(session)

    // Log successful action if it's not a generic response
    const duration = Date.now() - startTime
    if (!(result && typeof result === 'object' && 'error' in result)) {
      await logger.info(`Action success: ${context.action}`, {
        ...context,
        userId: session?.user?.id,
        duration,
      })
    }

    // If handler returns error, it's already been logged or needs to be handled
    if (result && typeof result === 'object' && 'error' in result) {
      return result as ErrorResponse
    }

    // Success
    return result as T
  } catch (error) {
    // Global error handler - catches ALL unhandled exceptions
    const errorResponse = await handleActionError(error, {
      action: context.action,
      userId: session?.user?.id || context.userId,
    })

    // Additional security logging for unexpected errors
    if (error instanceof Error) {
      await logger.error(error, {
        action: context.action,
        userId: session?.user?.id,
        errorType: error.constructor.name,
      })
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
