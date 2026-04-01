'use server'

import { auth, signIn, signOut } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '@/lib/validations/auth'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function register(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const parsed = registerSchema.safeParse({ name, email, password })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid registration input' }
  }

  const { name: safeName, email: safeEmail, password: safePassword } = parsed.data

  // Check if user already exists
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, safeEmail))
    .limit(1)

  if (existing) {
    return { error: 'An account with this email already exists' }
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
  } catch (error: any) {
    if (error?.code === 'credentials') {
      return { error: 'Failed to sign in after registration' }
    }
    throw error
  }

  redirect('/dashboard')
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const parsed = loginSchema.safeParse({ email, password })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid login input' }
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
  } catch (error: any) {
    if (error?.code === 'credentials') {
      return { error: 'Invalid email or password' }
    }
    throw error
  }

  redirect('/dashboard')
}

export async function logout() {
  await signOut({ redirect: false })
  redirect('/login')
}

export async function updateProfile(formData: FormData) {
  const session = await auth()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const currency = formData.get('currency') as string
  const timezone = formData.get('timezone') as string

  const parsed = updateProfileSchema.safeParse({ name, currency, timezone })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid profile data' }
  }

  const userId = session.user?.id
  if (!userId) {
    return { error: 'Unauthorized' }
  }

  await db
    .update(users)
    .set({
      name: parsed.data.name,
      currency: parsed.data.currency,
      timezone: parsed.data.timezone,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  revalidatePath('/settings/profile')
  return { success: true }
}

export async function changePassword(formData: FormData) {
  const session = await auth()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const oldPassword = formData.get('oldPassword') as string
  const newPassword = formData.get('newPassword') as string

  const parsed = changePasswordSchema.safeParse({ oldPassword, newPassword })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid password data' }
  }

  const userId = session.user?.id
  if (!userId) {
    return { error: 'Unauthorized' }
  }

  // Get current user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    return { error: 'User not found' }
  }

  // Verify old password
  const isValid = await bcrypt.compare(oldPassword, user.passwordHash)
  if (!isValid) {
    return { error: 'Current password is incorrect' }
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
    .where(eq(users.id, userId))

  revalidatePath('/settings/profile')
  return { success: true }
}

export async function deleteAccount() {
  const session = await auth()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const userId = session.user?.id
  if (!userId) {
    return { error: 'Unauthorized' }
  }

  // Delete user (cascade will handle related data)
  await db.delete(users).where(eq(users.id, userId))

  await signOut({ redirect: false })
  redirect('/login')
}
