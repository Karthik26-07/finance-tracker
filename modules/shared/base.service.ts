import { executeServerAction } from '@/lib/server-action-middleware'
import { ErrorResponse } from '@/lib/errors'
import type { Session } from 'next-auth'

/**
 * Global Base Service for wrapping business logic and UI/Server bridge.
 * Encapsulates the execution wrapper for standard error handling and authorization.
 */
export abstract class BaseService<TContext = any> {
}
