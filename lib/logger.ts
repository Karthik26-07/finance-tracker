import pino from 'pino'

// Initialize Pino logger
const transport =
  process.env.NODE_ENV === 'production'
    ? undefined
    : {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    }

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(typeof window === 'undefined' && process.env.NEXT_RUNTIME === 'nodejs' && transport ? { transport } : {})
})

/**
 * Extract request context for logging (safe for both server and client)
 * Works in Server Components/Actions, gracefully degrades in client components
 */
async function getRequestContext(): Promise<Record<string, string | undefined>> {
  try {
    // Dynamic import to avoid tree-shaking issues with client components
    const { headers } = await import('next/headers')
    const headersList = await headers()
    return {
      ip: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown',
      userAgent: headersList.get('user-agent') || undefined,
      requestPath: headersList.get('x-pathname') || undefined,
    }
  } catch {
    // headers() unavailable in client context - safely ignored
    return {}
  }
}

// Enhanced logger with context injection
export const logger = {
  /**
   * Log security event with user context
   */
  async security(
    event: string,
    data: Record<string, string | number | boolean | undefined>,
    level: 'info' | 'warn' | 'error' = 'info'
  ) {
    const context = await getRequestContext()
    pinoLogger[level](
      {
        event,
        ...context,
        ...data,
      },
      `[SECURITY] ${event}`
    )
  },

  /**
   * Log authentication event
   */
  async auth(
    action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'REGISTER' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'ACCOUNT_DELETE' | 'PROFILE_UPDATE' | 'LOGOUT_REDIRECT_ERROR',
    data: Record<string, string | number | boolean | undefined>
  ) {
    const context = await getRequestContext()
    pinoLogger.info(
      {
        event: `AUTH_${action}`,
        ...context,
        ...data,
      },
      `Authentication: ${action}`
    )
  },

  /**
   * Log database operation
   */
  async db(operation: string, data: Record<string, string | number | boolean | undefined>, duration?: number) {
    const context = await getRequestContext()
    pinoLogger.debug(
      {
        event: 'DB_OPERATION',
        operation,
        duration,
        ...context,
        ...data,
      },
      `DB: ${operation}`
    )
  },

  /**
   * Log error with full context
   */
  async error(error: Error, context: Record<string, string | number | boolean | undefined> = {}) {
    const requestContext = await getRequestContext()
    pinoLogger.error(
      {
        event: 'ERROR',
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        ...requestContext,
        ...context,
      },
      `Error: ${error.message}`
    )
  },

  /**
   * Log info message
   */
  async info(message: string, data?: Record<string, string | number | boolean | undefined>) {
    const context = await getRequestContext()
    pinoLogger.info({ ...context, ...(data || {}) }, message)
  },

  /**
   * Log warning message
   */
  async warn(message: string, data?: Record<string, string | number | boolean | undefined>) {
    const context = await getRequestContext()
    pinoLogger.warn({ ...context, ...(data || {}) }, message)
  },

  /**
   * Log debug message
   */
  async debug(message: string, data?: Record<string, string | number | boolean | undefined>) {
    const context = await getRequestContext()
    pinoLogger.debug({ ...context, ...(data || {}) }, message)
  },
}

export default logger
