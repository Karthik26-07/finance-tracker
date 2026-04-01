# 01 — System Architecture

## Overview

FinTrack uses a **Next.js 15 full-stack** architecture with the App Router. The frontend, API routes, and server actions all live in a single Next.js application. Data is persisted in a **PostgreSQL** database managed by Supabase, accessed via **Drizzle ORM**. File uploads (receipts, avatars) are stored in **Supabase Storage**.

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    NEXT.JS APP LAYER                     │
│                                                          │
│   React 19 (App Router)  ─── TailwindCSS + shadcn/ui    │
│   Server Components      ─── Client Components           │
│   Server Actions         ─── Route Handlers (/api/*)    │
│   TanStack Query         ─── Zustand (UI state)         │
└────────────────────────────┬─────────────────────────────┘
                             │ Drizzle ORM (type-safe SQL)
┌────────────────────────────▼─────────────────────────────┐
│                    DATA LAYER                            │
│                                                          │
│   PostgreSQL (Supabase)      ←→  Supabase Storage       │
│   Drizzle ORM + drizzle-kit  ←→  (receipts, avatars)    │
└──────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend / Fullstack
| Concern | Choice | Reason |
|---------|--------|--------|
| Framework | Next.js 15 (App Router) | Full-stack React, SSR, route handlers, server actions |
| Styling | TailwindCSS + shadcn/ui | Utility-first, accessible, consistent components |
| State (UI) | Zustand | Lightweight client-side state for modals, filters |
| Server State | TanStack Query v5 | Cache, background sync, optimistic updates |
| Charts | Recharts + D3.js | Recharts for standard charts, D3 for custom |
| Tables | TanStack Table | Virtualized, sortable, filterable |
| Forms | React Hook Form + Zod | Type-safe, performant, SSR-compatible |
| Date Handling | date-fns | Tree-shakeable, no side-effects |
| Icons | Lucide React | Consistent icon set, works with shadcn/ui |

### Backend (Next.js API Routes + Server Actions)
| Concern | Choice | Reason |
|---------|--------|--------|
| Runtime | Node.js 20 LTS on Vercel | Serverless-compatible |
| API | Next.js Route Handlers | Built-in, no separate server needed |
| ORM | Drizzle ORM | Type-safe, lightweight, excellent migrations |
| Validation | Zod | Shared schemas across server + client |
| Auth | NextAuth.js v5 (Auth.js) | First-class Next.js integration, JWT sessions |
| Password Hashing | bcryptjs | User credential security |
| Logging | Pino | Structured, lightweight logging |
| Scheduled Jobs | Vercel Cron (cron.json) | Serverless-native recurring job execution |

### Database & Storage
| Concern | Choice |
|---------|--------|
| Primary DB | PostgreSQL 15 (Supabase managed) |
| ORM / Query Builder | Drizzle ORM |
| Migrations | drizzle-kit (push / generate) |
| File Storage | Supabase Storage (S3-compatible) |
| Connection Pooling | Supabase built-in PgBouncer |

### DevOps
| Concern | Choice |
|---------|--------|
| Hosting | Vercel (single deployment — full-stack) |
| Database | Supabase (managed PostgreSQL + Storage) |
| CI/CD | GitHub Actions + Vercel auto-deploy |
| Monitoring | Sentry (errors) |
| Local Dev | Docker Compose (Postgres only for local) |

---

## Project Structure

```
fintrack/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (no layout)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (dashboard)/              # Protected route group
│   │   ├── layout.tsx            # Auth guard + sidebar
│   │   ├── dashboard/page.tsx
│   │   ├── accounts/
│   │   ├── transactions/
│   │   ├── categories/
│   │   ├── groups/
│   │   ├── recurring/
│   │   ├── budgets/
│   │   ├── reports/
│   │   └── settings/
│   └── api/                      # Route Handlers
│       ├── auth/[...nextauth]/   # NextAuth handler
│       ├── transactions/
│       ├── accounts/
│       ├── categories/
│       ├── groups/
│       ├── recurring/
│       ├── budgets/
│       ├── reports/
│       └── cron/
│           └── process-recurring/ # Called by Vercel Cron
│
├── components/                   # Shared UI components
│   ├── ui/                       # shadcn/ui components
│   ├── charts/                   # Chart wrappers
│   ├── forms/                    # Form components
│   └── layout/                   # Sidebar, nav, header
│
├── lib/                          # Core utilities
│   ├── db/
│   │   ├── index.ts              # Drizzle client
│   │   └── schema/               # Drizzle schema files
│   │       ├── users.ts
│   │       ├── accounts.ts
│   │       ├── transactions.ts
│   │       ├── categories.ts
│   │       ├── groups.ts
│   │       ├── recurring.ts
│   │       ├── budgets.ts
│   │       └── index.ts          # Re-export all schemas
│   ├── auth.ts                   # NextAuth config
│   ├── supabase.ts               # Supabase Storage client
│   ├── validations/              # Zod schemas (shared server+client)
│   └── utils/                    # Date helpers, formatters, currency
│
├── actions/                      # Next.js Server Actions
│   ├── transactions.ts
│   ├── accounts.ts
│   ├── categories.ts
│   ├── groups.ts
│   ├── recurring.ts
│   └── budgets.ts
│
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript type definitions
├── drizzle.config.ts             # Drizzle Kit config
├── vercel.json                   # Vercel Cron config
└── middleware.ts                 # Auth middleware (protect routes)
```

---

## Data Flow — Transaction Creation

```
User fills form (React Hook Form + Zod client validation)
     │
     ▼
Server Action: createTransaction()  OR  POST /api/transactions
     │
     ▼
Zod server-side validation
     │
     ▼
Drizzle ORM:
  ├─ Insert into transactions table
  ├─ Update account balance (in same DB transaction)
  ├─ If group tx: create splits
  ├─ If recurring: schedule next occurrence
  └─ Return new transaction row
     │
     ▼
revalidatePath('/transactions')  →  UI reflects new data
TanStack Query cache invalidated →  Background refetch
```

---

## Data Flow — Recurring Deduction Processing

```
Vercel Cron fires at 00:00 UTC → POST /api/cron/process-recurring
     │
     ▼
RecurringJob.process()
  ├─ SELECT all active recurring_rules WHERE next_run_date <= TODAY
  ├─ For each rule (in a DB transaction):
  │    ├─ INSERT transaction record
  │    ├─ UPDATE account balance
  │    ├─ COMPUTE next_run_date based on frequency
  │    └─ UPDATE recurring_rule.next_run_date + last_run_date
  └─ Return processed count
```

---

## Authentication Flow (NextAuth.js v5)

```
User submits login form
     │
     ▼
NextAuth Credentials provider
  ├─ Lookup user by email (Drizzle query)
  ├─ bcrypt.compare(password, hash)
  └─ Return user object → JWT session
     │
     ▼
middleware.ts runs on every (dashboard)/* route
  ├─ auth() → check session
  └─ Redirect to /login if no session
```

---

## Supabase Storage — File Upload Flow

```
User selects receipt image
     │
     ▼
Client-side: resize/compress image (browser Canvas API)
     │
     ▼
POST /api/upload  (multipart/form-data)
     │
     ▼
Server Route Handler:
  ├─ Validate file type (image/jpeg, image/png, image/webp only)
  ├─ Validate file size (max 5MB)
  ├─ Generate path: receipts/{userId}/{transactionId}/{timestamp}.webp
  └─ supabase.storage.from('receipts').upload(path, buffer)
     │
     ▼
Return public URL → stored in transactions.receipt_url
```

---

## Supabase Storage Configuration

### Buckets

| Bucket | Public | Max File Size | Allowed Types |
|--------|--------|---------------|---------------|
| `receipts` | false (authenticated) | 5 MB | image/jpeg, image/png, image/webp |
| `avatars` | true | 2 MB | image/jpeg, image/png, image/webp |

### Storage Client (`lib/supabase.ts`)

```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // server-only
)

// Upload a receipt and return its public URL
export async function uploadReceipt(
  userId: string,
  file: Buffer,
  mimeType: string,
  filename: string
): Promise<string> {
  const path = `${userId}/${Date.now()}-${filename}`
  const { error } = await supabase.storage
    .from('receipts')
    .upload(path, file, { contentType: mimeType, upsert: false })
  if (error) throw error

  const { data } = supabase.storage.from('receipts').getPublicUrl(path)
  return data.publicUrl
}

// Delete a receipt by its URL path
export async function deleteReceipt(url: string): Promise<void> {
  const path = url.split('/receipts/')[1]
  if (!path) return
  await supabase.storage.from('receipts').remove([path])
}
```

### Supabase Storage Policies (SQL)

```sql
-- receipts: only owner can read/write
CREATE POLICY "Users can upload their own receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read their own receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own receipts"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- avatars: public read, owner write
CREATE POLICY "Public avatar read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Environment Variables

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."   # Server-only — never expose to client

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"   # or production URL

# Vercel Cron security
CRON_SECRET="..."   # Passed in Authorization header by Vercel
```

---

## Vercel Cron Configuration (`vercel.json`)

```json
{
  "crons": [
    {
      "path": "/api/cron/process-recurring",
      "schedule": "0 0 * * *"
    }
  ]
}
```

The cron route handler validates `Authorization: Bearer ${CRON_SECRET}` before executing.

---

## Module Boundaries

```
app/
├── (auth)/         # Public — login, register, password reset
├── (dashboard)/    # Protected — all app modules
│   ├── dashboard/   # M5: Analytics widgets
│   ├── accounts/    # M2: Accounts & wallets
│   ├── transactions/# M3: Transaction CRUD + list
│   ├── categories/  # M4: Category management
│   ├── groups/      # M7: Group expenses
│   ├── recurring/   # M8: Recurring deductions
│   ├── budgets/     # M9: Budget management
│   └── reports/     # M6: All report views
└── api/            # Route Handlers (REST-compatible)

actions/            # Server Actions (form submissions, mutations)
lib/db/schema/      # Drizzle table definitions (source of truth)
lib/validations/    # Zod schemas shared across client + server
```

---

## Security Considerations

- All passwords hashed with bcryptjs (cost factor 12)
- NextAuth JWT sessions — access via `auth()` server-side or `useSession()` client-side
- All mutations validated with Zod (server-side) before Drizzle queries
- Drizzle uses parameterized queries — no SQL injection risk
- Row-level access: every query filters by `userId` from the session
- Supabase Storage policies restrict file access to file owners
- `SUPABASE_SERVICE_ROLE_KEY` is never exposed to the browser
- `CRON_SECRET` guards the recurring job endpoint from unauthorized triggering
- CORS handled natively by Next.js Route Handlers
- Rate limiting on auth endpoints via `next-rate-limit` or Vercel Edge middleware
