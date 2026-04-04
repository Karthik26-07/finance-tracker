import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { eq, and } from 'drizzle-orm'
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

          // Dynamic import to stay Edge-safe
          const { db } = await import('./db')
          const { users } = await import('./db/schema')

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
    maxAge: 12 * 60 * 60, // 12 hours (Acting as Refresh Token)
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // 1. Initial Login: Create JTI and register in Database (Runs in Node runtime during login)
      if (user) {
        const jti = globalThis.crypto.randomUUID()
        token.id = user.id as string
        token.jti = jti
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000 // 15 mins (AccessToken window)

        // Track session in DB for revocation (Dynamic import)
        const { db } = await import('./db')
        const { sessions } = await import('./db/schema')
        
        await db.insert(sessions).values({
          userId: user.id as string,
          sessionToken: jti,
          expires: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12h
        })

        return token
      }

      // 2. Sliding Access Window check (No DB check here to stay Edge-compatible)
      const now = Date.now()
      if (now < (token.accessTokenExpires as number)) {
        return token
      }

      // 3. Refresh access window (if within 12h lifetime)
      token.accessTokenExpires = Date.now() + 15 * 60 * 1000
      return token
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id
        session.user.jti = token.jti as string
        session.user.expiresAt = token.accessTokenExpires
      }
      return session
    },
  },
  events: {
    async signOut(message) {
      if ('token' in message && message.token?.jti) {
        const { token } = message
        
        // Dynamic import to stay Edge-safe
        const { db } = await import('./db')
        const { sessions } = await import('./db/schema')

        // Invalidate in DB for security
        await db.update(sessions)
          .set({ revoked: true, updatedAt: new Date() })
          .where(eq(sessions.sessionToken, token.jti as string))
        
        await logger.auth('LOGOUT_REVOKED', { jti: token.jti, userId: token.id as string })
      }
    }
  },


  pages: {
    signIn: '/login',
  },
})
