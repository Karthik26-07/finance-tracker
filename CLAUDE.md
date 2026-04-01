# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint

npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
npm run db:seed      # Seed database
```

## Architecture Overview

**Stack**: Next.js 15 App Router, React 19, TypeScript, PostgreSQL (Supabase), Drizzle ORM, NextAuth v5, TailwindCSS v4

**Module Dependency Order**:
1. M1: Auth & User Management (in progress)
2. M2: Accounts
3. M3: Transactions (core)
4. M4: Categories
5. M5: Dashboard
6. M6: Reports
7. M7-M10: Advanced features

### Directory Structure

```
app/                  # Next.js App Router
  (auth)/             # Auth pages (login, register, forgot-password)
  (dashboard)/        # Protected dashboard pages
  layout.tsx          # Root layout with fonts
actions/              # Server actions (auth.ts)
lib/
  auth.ts             # NextAuth v5 configuration (JWT sessions, Credentials provider)
  db/
    index.ts          # Drizzle DB instance
    schema/           # Table definitions (users, accounts, transactions, categories, etc.)
    queries/          # DB query functions
  validations/        # Zod schemas for form validation
components/           # Shared UI components (shadcn/ui in components/ui/)
```

### Key Patterns

**Authentication**: NextAuth v5 with JWT strategy. Server actions use `auth()` to get session. All auth operations (register, login, logout, updateProfile, changePassword, deleteAccount) are in `actions/auth.ts`.

**Database**: Drizzle ORM with PostgreSQL. Schema files export tables with relations. Use `eq()` from drizzle-orm for WHERE clauses. All tables use UUID primary keys with `defaultRandom()`.

**Validation**: Zod schemas in `lib/validations/`. Server actions validate input with `safeParse()` before DB operations.

**Server Actions**: All form submissions go through server actions marked `'use server'`. Actions return `{ error?: string }` or `{ success: true }`.

**Design System**: "Precision Architect" financial theme
- Primary: #003178 (navy), Secondary: #006b5f (emerald), Tertiary: #71000c (coral)
- Fonts: Sora (display/headings), DM Sans (body), JetBrains Mono (code/data)
- No 1px borders; use background shifts for separation
- Tabular-nums for currency display

## Environment Variables

Required in `.env.local`:
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Base URL (http://localhost:3000 for dev)

See `.env.local.example` for full list.
