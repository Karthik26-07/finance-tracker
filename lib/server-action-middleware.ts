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

/**
 * Centralized security guard for server actions.
 * Verifies session, checks for revocation, and returns the userId.
 * Use this at the start of any protected action for maximum simplicity.
 */
export async function requireAuth(): Promise<string> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new AuthError('UNAUTHORIZED', 'Authentication required')
  }

  // Session Revocation Check (DB-backed)
  const { db } = await import('./db')
  const { sessions } = await import('./db/schema')
  
  const [storedSession] = await db
    .select()
    .from(sessions)
    .where(and(
      eq(sessions.sessionToken, session.user.jti),
      eq(sessions.revoked, false)
    ))
    .limit(1)

  if (!storedSession) {
    await logger.security('AUTH_REVOKED_ATTEMPT', { userId: session.user.id }, 'error')
    throw new AuthError('UNAUTHORIZED', 'Session revoked. Please re-login.')
  }

  return session.user.id
}

export async function executeServerAction<T = any>(
  handler: (session: Session | null) => Promise<T | ErrorResponse | void>,
  context: ActionContext,
  options: ActionOptions = { isPublic: false }
): Promise<T | ErrorResponse> {
  const startTime = Date.now()
  let session: Session | null = null

  try {
    // 1. Authorization check
    if (!options.isPublic) {
      await requireAuth()
      session = await auth() // Get session again for the context, or just return it from requireAuth?
    } else {
       session = await auth() // Still try to get it for public actions (optional info)
    }
    
    // 2. Execute handler
    const result = await handler(session)

    // Log successful action if it's not an error response
    const duration = Date.now() - startTime
    if (!(result && typeof result === 'object' && 'error' in result)) {
      await logger.info(`Action success: ${context.action}`, {
        ...context,
        userId: session?.user?.id,
        duration,
      })
    }

    // Success or returned error
    return (result ?? { success: true }) as T | ErrorResponse
  } catch (error) {
    // Global error handler
    return await handleActionError(error, {
      action: context.action,
      userId: session?.user?.id || context.userId,
    })
  }
}

/**
 * Simplified factory for authenticated server actions.
 * Automatically handles:
 * 1. Session & Revocation checks
 * 2. Zod validation (accepts plain objects or FormData)
 * 3. Standardized error reporting
 * 4. Automatic logging & performance tracking
 */
import { z } from 'zod'
import { ValidationError } from './errors'

export function createAuthenticatedAction<Schema extends z.ZodTypeAny, TOutput>(
  name: string,
  schema: Schema,
  handler: (data: z.infer<Schema>, userId: string) => Promise<TOutput | ErrorResponse>
) {
  return async (input: z.infer<Schema> | FormData): Promise<TOutput | ErrorResponse> => {
    return executeServerAction(
      async (session) => {
        let rawInput = input
        
        // Handle FormData translation automatically
        if (input instanceof FormData) {
          rawInput = Object.fromEntries(input.entries()) as any
        }

        const parsed = schema.safeParse(rawInput)
        if (!parsed.success) {
          const firstError = parsed.error.issues[0]?.message ?? 'Validation failed'
          throw new ValidationError(firstError)
        }

        return handler(parsed.data, session!.user.id)
      },
      { action: name }
    )
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

