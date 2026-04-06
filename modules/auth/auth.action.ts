'use server'

import { signIn, signOut } from '@/lib/auth'
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '@/lib/validations/auth'
import { revalidatePath } from 'next/cache'
import { executeServerAction } from '@/lib/server-action-middleware'
import {
  AuthError,
  ValidationError,
  ErrorResponse,
  getFormDataString,
} from '@/lib/errors'
import { AuthService } from './auth.service'

const authService = new AuthService()

/**
 * Register new user
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

      await authService.registerUser({ name: safeName, email: safeEmail, safePassword })

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
 */
export async function logout(): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async () => {
      await signOut({ redirect: false })
      return { success: true }
    },
    { action: 'logout' },
    { isPublic: true }
  )
}

/**
 * Update user profile
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

      const { name: safeName, currency: safeCurrency, timezone: safeTimezone } = parsed.data
      if (!safeName) throw new ValidationError('Name is required')

      await authService.updateProfile(session!.user.id, { name: safeName, currency: safeCurrency, timezone: safeTimezone })

      revalidatePath('/settings/profile')
      return { success: true }
    },
    { action: 'updateProfile' }
  )
}

/**
 * Change user password
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

      await authService.changePassword(session!.user.id, parsed.data)

      revalidatePath('/settings/profile')
      return { success: true }
    },
    { action: 'changePassword' }
  )
}

/**
 * Delete user account
 */
export async function deleteAccount(): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async (session) => {
      await authService.deleteAccount(session!.user.id)
      await signOut({ redirect: false })
      return { success: true }
    },
    { action: 'deleteAccount' }
  )
}
