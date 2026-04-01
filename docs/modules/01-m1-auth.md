# M1 — Auth & User Management

## Purpose
Handle user identity, authentication, and profile management.

---

## Features

### Authentication
- [ ] Register with email + password
- [ ] Login with NextAuth.js JWT session
- [ ] Forgot password (email OTP)
- [ ] Session-based auth guard via `middleware.ts`

### User Profile
- [ ] Name, email, currency preference, timezone
- [ ] Avatar upload (Supabase Storage)
- [ ] Update profile
- [ ] Delete account + all data

---

## Database Schema

### users table (`lib/db/schema/users.ts`)

```ts
export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  name:         varchar('name', { length: 100 }).notNull(),
  email:        varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  currency:     char('currency', { length: 3 }).default('INR'),
  timezone:     varchar('timezone', { length: 50 }).default('Asia/Kolkata'),
  avatarUrl:    text('avatar_url'),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow(),
})
```

---

## File Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── forgot-password/page.tsx
├── api/
│   └── auth/[...nextauth]/route.ts
└── (dashboard)/
    └── settings/profile/page.tsx

actions/
└── auth.ts

lib/
├── auth.ts
├── validations/auth.ts
└── supabase.ts (for avatar upload)
```

---

## Components to Create

### Pages
- [ ] `app/(auth)/login/page.tsx` - Login form (design ref: `login_register_m1/code.html`)
- [ ] `app/(auth)/register/page.tsx` - Registration form
- [ ] `app/(auth)/forgot-password/page.tsx` - Password reset flow
- [ ] `app/(dashboard)/settings/profile/page.tsx` - Profile editor

### Server Actions (`actions/auth.ts`)
- [ ] `register(input)` - Create new user account
- [ ] `login(email, password)` - Authenticate and create session
- [ ] `logout()` - Destroy session
- [ ] `updateProfile(input)` - Update name, currency, timezone
- [ ] `updateAvatar(file)` - Upload avatar to Supabase Storage
- [ ] `deleteAccount()` - Hard delete user + all related data

### Validation Schemas (`lib/validations/auth.ts`)
- [ ] `registerSchema` - Email, password (min 8), name
- [ ] `loginSchema` - Email, password
- [ ] `updateProfileSchema` - Name, currency, timezone
- [ ] `forgotPasswordSchema` - Email

---

## API Routes

### POST /api/auth/[...nextauth]
Handled by NextAuth.js - Credentials provider

### GET /api/auth/session
Get current session

---

## Auth Flow

```
User submits login form
     │
     ▼
Server Action: login(email, password)
     │
     ▼
Drizzle: SELECT * FROM users WHERE email = ?
     │
     ▼
bcrypt.compare(password, hash)
     │
     ▼
NextAuth: Create JWT session
     │
     ▼
Redirect to /dashboard
```

---

## Middleware (`middleware.ts`)

```ts
export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: ['/(dashboard)/:path*'],
}
```

---

## Design Specifications

### Login/Register Page Layout
Based on `design-ref/login_register_m1/code.html`:

```
┌────────────────────────────────────────────────────┐
│  Editorial Panel (left)  │  Form Panel (right)    │
│  - Gradient background   │  - Toggle Login/Signup │
│  - Brand messaging       │  - Social auth buttons │
│  - Feature highlights    │  - Email/password form │
└────────────────────────────────────────────────────┘
```

### Color Palette
- **Primary**: `#003178` (buttons, links)
- **Primary Container**: `#0d47a1` (gradient)
- **Surface Container Lowest**: `#ffffff` (form background)
- **Outline**: `#737783` (input borders)

### Typography
- **Headlines**: Manrope - "Welcome back"
- **Body**: Inter - Form labels, helper text
- **Button**: Manrope bold

### Input Fields
- Background: `surface-container-low` (`#f2f4f6`)
- No border by default
- Focus: 2px ring `primary/20`
- Icon left-aligned with Material Symbols

---

## Implementation Checklist

### Setup
- [ ] Install bcryptjs, next-auth
- [ ] Configure NextAuth in `lib/auth.ts`
- [ ] Add middleware.ts

### Schema
- [ ] Create users table migration
- [ ] Run drizzle-kit generate + migrate

### Auth Pages
- [ ] Build login page with design ref
- [ ] Build register page
- [ ] Build forgot-password page

### Server Actions
- [ ] Implement register action
- [ ] Implement login action
- [ ] Implement profile update
- [ ] Implement avatar upload
- [ ] Implement delete account

### Testing
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test profile update
- [ ] Test avatar upload
- [ ] Test session persistence

---

## Security Notes

1. Passwords hashed with bcryptjs (cost factor 12)
2. JWT sessions - never expose `SUPABASE_SERVICE_ROLE_KEY` to client
3. All mutations require valid session
4. Row-level access: filter by `userId` from session
