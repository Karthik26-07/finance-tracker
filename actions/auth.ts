'use server'

import { auth, signIn, signOut } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '@/lib/validations/auth'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'
import { executeServerAction, safeAction } from '@/lib/server-action-middleware'
import {
  AuthError,
  ValidationError,
  ErrorResponse,
  getFormDataString,
} from '@/lib/errors'

/**
 * Register new user
 * Global error handling - no try-catch needed
 */
export async function register(formData: FormData): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async () => {
      const name = getFormDataString(formData, 'name')
      const email = getFormDataString(formData, 'email')
      const password = getFormDataString(formData, 'password')

      const parsed = registerSchema.safeParse({ name, email, password })
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid registration input')
      }

      const { name: safeName, email: safeEmail, password: safePassword } = parsed.data

      // Check if user already exists
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, safeEmail))
        .limit(1)

      if (existing) {
        await logger.security('REGISTER_ATTEMPT_DUPLICATE_EMAIL', { email: safeEmail }, 'warn')
        throw new AuthError('EMAIL_EXISTS', 'An account with this email already exists')
      }

      // Hash password
      const passwordHash = await bcrypt.hash(safePassword, 12)

      // Create user
      await db.insert(users).values({
        name: safeName,
        email: safeEmail,
        passwordHash,
      })

      // Sign in the user
      try {
        await signIn('credentials', {
          email: safeEmail,
          password: safePassword,
          redirect: false,
        })
      } catch (signInError: unknown) {
        if (signInError instanceof Error && 'code' in signInError && (signInError as Record<string, unknown>).code === 'credentials') {
          throw new AuthError('SIGNIN_AFTER_REGISTER_FAILED', 'Failed to sign in after registration')
        }
        throw signInError
      }

      return { success: true }
    },
    { action: 'register' },
    { isPublic: true }
  )
}


/**
 * Login user
 * Global error handling - no try-catch needed
 */
export async function login(formData: FormData): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async () => {
      const email = getFormDataString(formData, 'email')
      const password = getFormDataString(formData, 'password')

      const parsed = loginSchema.safeParse({ email, password })
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid login input')
      }

      try {
        await signIn('credentials', {
          email: parsed.data.email,
          password: parsed.data.password,
          redirect: false,
        })
      } catch (signInError: unknown) {
        if (signInError instanceof Error && 'code' in signInError && (signInError as Record<string, unknown>).code === 'credentials') {
          throw new AuthError('INVALID_CREDENTIALS', 'Invalid email or password')
        }
        throw signInError
      }

      return { success: true }
    },
    { action: 'login' },
    { isPublic: true }
  )
}


/**
 * Logout user
 * Global error handling - no try-catch needed
 */
export async function logout(): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async () => {
      await signOut({ redirect: false })
      return { success: true }
    },
    { action: 'logout' }
  )
}


/**
 * Update user profile
 * Global error handling - no try-catch needed
 */
export async function updateProfile(formData: FormData): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async (session) => {
      const name = getFormDataString(formData, 'name')
      const currency = getFormDataString(formData, 'currency')
      const timezone = getFormDataString(formData, 'timezone')

      const parsed = updateProfileSchema.safeParse({ name, currency, timezone })
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid profile data')
      }

      await db
        .update(users)
        .set({
          name: parsed.data.name,
          currency: parsed.data.currency,
          timezone: parsed.data.timezone,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session!.user.id))

      revalidatePath('/settings/profile')
      return { success: true }
    },
    { action: 'updateProfile' }
  )
}


/**
 * Change user password
 * Global error handling - no try-catch needed
 */
export async function changePassword(formData: FormData): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async (session) => {
      const oldPassword = getFormDataString(formData, 'oldPassword')
      const newPassword = getFormDataString(formData, 'newPassword')

      const parsed = changePasswordSchema.safeParse({ oldPassword, newPassword })
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid password data')
      }

      // Get current user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session!.user.id))
        .limit(1)

      if (!user) {
        throw new AuthError('USER_NOT_FOUND', 'User account not found')
      }

      // Verify old password
      const isValid = await bcrypt.compare(oldPassword, user.passwordHash)
      if (!isValid) {
        throw new AuthError('INVALID_PASSWORD', 'Current password is incorrect')
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12)

      // Update password
      await db
        .update(users)
        .set({
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session!.user.id))

      revalidatePath('/settings/profile')
      return { success: true }
    },
    { action: 'changePassword' }
  )
}


/**
 * Delete user account
 * Global error handling - no try-catch needed
 */
export async function deleteAccount(): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async (session) => {
      const userId = session!.user.id

      // Delete user (cascade will handle related data)
      await db.delete(users).where(eq(users.id, userId))

      await signOut({ redirect: false })
      return { success: true }
    },
    { action: 'deleteAccount' }
  )
}

