# 05 — API Plan

## Overview

All API endpoints are implemented as **Next.js Route Handlers** in `app/api/`. They are fully compatible with REST clients and can be consumed by external integrations. For form mutations from within the app, **Server Actions** in `actions/` are preferred.

## Base URL

```
Development:  http://localhost:3000/api
Production:   https://fintrack.vercel.app/api
```

## Authentication

All endpoints (except `/api/auth/*`) require a valid NextAuth.js session cookie or a Bearer token in the header (for API clients):

```
Authorization: Bearer <nextauth_session_token>
```

Session is retrieved server-side via:

```ts
import { auth } from '@/lib/auth'

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  // ...
}
```

---

## Route Handler Conventions

All Route Handlers follow this structure:

```ts
// app/api/transactions/route.ts
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { transactions } from '@/lib/db/schema'
import { createTransactionSchema } from '@/lib/validations/transactions'
import { eq } from 'drizzle-orm'

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  // parse query params...

  const rows = await db.select().from(transactions)
    .where(eq(transactions.userId, session.user.id))
  return Response.json({ data: rows })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createTransactionSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: { code: 'VALIDATION_ERROR', details: parsed.error.issues } }, { status: 422 })
  }

  const [row] = await db.insert(transactions).values({ ...parsed.data, userId: session.user.id }).returning()
  return Response.json({ data: row }, { status: 201 })
}
```

---

## Auth Endpoints

NextAuth handles auth automatically at `/api/auth/[...nextauth]`.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signin` | Login (handled by NextAuth) |
| POST | `/api/auth/signout` | Logout |
| GET | `/api/auth/session` | Get current session |

Custom auth actions (register, forgot password) use Server Actions.

---

## User Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update profile (name, currency, timezone) |
| DELETE | `/api/users/me` | Delete account + all data |

**GET /api/users/me response:**

```json
{
  "data": {
    "id": "uuid",
    "name": "Ravi Kumar",
    "email": "ravi@example.com",
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "avatarUrl": "https://[project].supabase.co/storage/v1/object/public/avatars/..."
  }
}
```

---

## Upload Endpoint

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upload` | Upload file to Supabase Storage |

**POST /api/upload** — multipart/form-data:

```ts
// app/api/upload/route.ts
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File
  const bucket = (form.get('bucket') as string) ?? 'receipts'  // receipts | avatars

  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })
  if (file.size > 5 * 1024 * 1024) return Response.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  if (!['image/jpeg','image/png','image/webp'].includes(file.type))
    return Response.json({ error: 'Invalid file type' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const path = `${session.user.id}/${Date.now()}-${file.name}`

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, { contentType: file.type })
  if (error) return Response.json({ error: 'Upload failed' }, { status: 500 })

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return Response.json({ url: data.publicUrl }, { status: 201 })
}
```

---

## Account Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/accounts` | List all accounts (with balances) |
| POST | `/api/accounts` | Create account |
| GET | `/api/accounts/[id]` | Get single account |
| PUT | `/api/accounts/[id]` | Update account |
| DELETE | `/api/accounts/[id]` | Archive account |
| POST | `/api/accounts/transfer` | Transfer between accounts |

**GET /api/accounts response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "HDFC Savings",
      "type": "bank",
      "balance": 45230.50,
      "color": "#4F8EF7",
      "icon": "bank"
    }
  ]
}
```

**POST /api/accounts/transfer body:**

```json
{
  "fromAccountId": "uuid",
  "toAccountId": "uuid",
  "amount": 5000.00,
  "date": "2025-01-14",
  "note": "Moving to savings"
}
```

---

## Transaction Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/transactions` | List (paginated, filterable) |
| POST | `/api/transactions` | Create transaction |
| GET | `/api/transactions/[id]` | Get single transaction |
| PUT | `/api/transactions/[id]` | Update transaction |
| DELETE | `/api/transactions/[id]` | Delete transaction |
| DELETE | `/api/transactions` | Bulk delete (body: `{ ids: string[] }`) |
| POST | `/api/transactions/import` | Import from CSV |

**GET /api/transactions query params:**

```
?page=1
&limit=25
&type=expense          # income | expense | transfer
&accountId=uuid
&categoryId=uuid
&dateFrom=2025-01-01
&dateTo=2025-01-31
&minAmount=100
&maxAmount=5000
&tags=food,party
&search=zomato
&sort=date:desc        # date | amount | category
```

**POST /api/transactions body:**

```json
{
  "type": "expense",
  "amount": 450.00,
  "accountId": "uuid",
  "categoryId": "uuid",
  "date": "2025-01-14",
  "time": "13:30",
  "note": "Lunch at Zomato",
  "tags": ["food", "work"],
  "receiptUrl": "https://[project].supabase.co/storage/v1/object/...",
  "isRecurring": false
}
```

---

## Category Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/categories` | List all (system + user categories) |
| POST | `/api/categories` | Create custom category |
| PUT | `/api/categories/[id]` | Update category |
| DELETE | `/api/categories/[id]` | Delete (reassign transactions) |

---

## Group Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/groups` | List user's groups |
| POST | `/api/groups` | Create group |
| GET | `/api/groups/[id]` | Group detail + balances |
| PUT | `/api/groups/[id]` | Update group |
| POST | `/api/groups/[id]/members` | Add member |
| DELETE | `/api/groups/[id]/members/[memberId]` | Remove member |
| GET | `/api/groups/[id]/transactions` | List group transactions |
| POST | `/api/groups/[id]/transactions` | Add group expense |
| PUT | `/api/groups/[id]/transactions/[txId]` | Edit group expense |
| DELETE | `/api/groups/[id]/transactions/[txId]` | Delete group expense |
| GET | `/api/groups/[id]/balances` | Who owes whom |
| POST | `/api/groups/[id]/settle` | Record a settlement |

**GET /api/groups/[id]/balances response:**

```json
{
  "data": {
    "groupId": "uuid",
    "balances": [
      {
        "from": { "id": "member-1", "name": "Ravi" },
        "to":   { "id": "member-2", "name": "You" },
        "amount": 1200.00
      }
    ],
    "memberTotals": [
      { "memberId": "uuid", "name": "You", "paid": 4800, "owed": 3600, "net": 1200 }
    ]
  }
}
```

---

## Recurring Rule Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/recurring` | List all rules |
| POST | `/api/recurring` | Create rule |
| GET | `/api/recurring/[id]` | Get rule + upcoming dates |
| PUT | `/api/recurring/[id]` | Update rule |
| DELETE | `/api/recurring/[id]` | Delete rule |
| PATCH | `/api/recurring/[id]/pause` | Pause rule |
| PATCH | `/api/recurring/[id]/resume` | Resume rule |
| GET | `/api/recurring/preview` | Preview next N occurrences |

**POST /api/recurring body:**

```json
{
  "name": "Netflix Subscription",
  "type": "expense",
  "amount": 649.00,
  "accountId": "uuid",
  "categoryId": "uuid",
  "frequency": "monthly",
  "dayOfMonth": 3,
  "startDate": "2025-01-03",
  "endDate": null,
  "note": "Streaming subscription"
}
```

---

## Report Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/reports/summary` | Income/expense summary for date range |
| GET | `/api/reports/daily` | Daily statement (opening/closing balances) |
| GET | `/api/reports/monthly` | Monthly statement |
| GET | `/api/reports/by-category` | Category breakdown |
| GET | `/api/reports/cashflow` | Income vs expense over months |
| GET | `/api/reports/export` | Export as CSV/PDF (query param: `format=csv|pdf`) |

**GET /api/reports/daily?accountId=&date=2025-01-14:**

```json
{
  "data": {
    "date": "2025-01-14",
    "account": { "id": "uuid", "name": "HDFC Savings" },
    "openingBalance": 46200.50,
    "closingBalance": 45230.50,
    "totalIn": 0,
    "totalOut": 970.00,
    "transactions": [ "..." ]
  }
}
```

---

## Budget Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/budgets` | List budgets with utilization |
| POST | `/api/budgets` | Set budget |
| PUT | `/api/budgets/[id]` | Update budget |
| DELETE | `/api/budgets/[id]` | Delete budget |

---

## Cron Endpoint

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/cron/process-recurring` | Triggered by Vercel Cron at 00:00 UTC |

This endpoint is protected by `Authorization: Bearer ${CRON_SECRET}` and is not meant for public use.

---

## Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      { "field": "amount", "message": "Amount must be positive" }
    ]
  }
}
```

## Standard Error Codes

| Code | HTTP Status |
|------|-------------|
| `UNAUTHORIZED` | 401 |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404 |
| `VALIDATION_ERROR` | 422 |
| `RATE_LIMITED` | 429 |
| `INTERNAL_ERROR` | 500 |

---

## Zod Validation Schemas (`lib/validations/`)

Schemas are defined once and shared between the Route Handler (server validation) and the React Hook Form (client validation):

```ts
// lib/validations/transactions.ts
import { z } from 'zod'

export const createTransactionSchema = z.object({
  type:       z.enum(['income', 'expense', 'transfer']),
  amount:     z.number().positive(),
  accountId:  z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time:       z.string().optional(),
  note:       z.string().max(500).optional(),
  tags:       z.array(z.string()).default([]),
  receiptUrl: z.string().url().optional(),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
```
