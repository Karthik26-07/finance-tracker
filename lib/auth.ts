import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from './db'
import { users } from './db/schema'
import { logger } from './logger'

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            await logger.security('AUTH_AUTHORIZE_INVALID_CREDENTIALS', {
              reason: 'missing_email_or_password',
            }, 'warn')
            return null
          }

          const email = credentials.email as string
          const password = credentials.password as string

          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1)

          if (!user) {
            await logger.security('AUTH_AUTHORIZE_USER_NOT_FOUND', { email }, 'warn')
            return null
          }

          const isValid = await bcrypt.compare(password, user.passwordHash)
          if (!isValid) {
            await logger.security('AUTH_AUTHORIZE_INVALID_PASSWORD', { userId: user.id, email }, 'warn')
            return null
          }

          await logger.auth('LOGIN_SUCCESS', { userId: user.id, email })

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.avatarUrl,
          }
        } catch (error) {
          await logger.error(error as Error, {
            action: 'authorize',
            email: (credentials?.email as string) || 'unknown',
          })
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
