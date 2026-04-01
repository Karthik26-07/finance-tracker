# M2 — Accounts & Wallets

## Purpose
Manage multiple financial accounts: bank accounts, cash wallets, UPI wallets, credit cards, investment accounts.

---

## Features

### Account Management
- [ ] Create account (name, type, opening balance, color, icon)
- [ ] View list of all accounts with current balance
- [ ] Edit account details
- [ ] Archive (soft delete) account
- [ ] Account-specific transaction history

### Transfers
- [ ] Transfer between accounts
- [ ] Creates two linked transactions
- [ ] Atomic DB transaction

---

## Database Schema

### accounts table (`lib/db/schema/accounts.ts`)

```ts
export const accountTypeEnum = pgEnum('account_type', [
  'bank', 'cash', 'credit', 'wallet', 'investment'
])

export const accounts = pgTable('accounts', {
  id:             uuid('id').primaryKey().defaultRandom(),
  userId:         uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:           varchar('name', { length: 100 }).notNull(),
  type:           accountTypeEnum('type').notNull(),
  balance:        numeric('balance', { precision: 15, scale: 2 }).default('0.00'),
  openingBalance: numeric('opening_balance', { precision: 15, scale: 2 }).default('0.00'),
  color:          varchar('color', { length: 7 }),
  icon:           varchar('icon', { length: 50 }),
  isActive:       boolean('is_active').default(true),
  createdAt:      timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).defaultNow(),
})
```

---

## File Structure

```
app/
├── (dashboard)/
│   ├── accounts/
│   │   ├── page.tsx (list)
│   │   └── [id]/
│   │       ├── page.tsx (detail)
│   │       └── edit/page.tsx
└── api/
    └── accounts/
        ├── route.ts (GET list, POST create)
        ├── [id]/route.ts (GET, PUT, DELETE)
        └── transfer/route.ts

actions/
└── accounts.ts

components/
└── accounts/
    ├── AccountCard.tsx
    ├── AccountList.tsx
    ├── AccountForm.tsx
    └── TransferForm.tsx

lib/
├── db/queries/accounts.ts
└── validations/accounts.ts
```

---

## Components to Create

### Pages
- [ ] `app/(dashboard)/accounts/page.tsx` - Account cards grid
- [ ] `app/(dashboard)/accounts/[id]/page.tsx` - Account detail + transactions
- [ ] `app/(dashboard)/accounts/[id]/edit/page.tsx` - Edit form

### Components
- [ ] `components/accounts/AccountCard.tsx` - Balance card with icon
- [ ] `components/accounts/AccountList.tsx` - Grid of cards
- [ ] `components/forms/AccountForm.tsx` - Create/edit modal
- [ ] `components/forms/TransferForm.tsx` - Transfer modal

### Server Actions (`actions/accounts.ts`)
- [ ] `createAccount(input)` - Create new account
- [ ] `updateAccount(id, input)` - Update account
- [ ] `archiveAccount(id)` - Soft delete
- [ ] `transferFunds(input)` - Transfer between accounts

### Validation Schemas (`lib/validations/accounts.ts`)
- [ ] `createAccountSchema` - Name, type, openingBalance, color, icon
- [ ] `updateAccountSchema` - Partial of create
- [ ] `transferSchema` - fromAccountId, toAccountId, amount, date, note

---

## API Routes

### GET /api/accounts
List all accounts for current user

### POST /api/accounts
Create new account

### GET /api/accounts/:id
Get single account

### PUT /api/accounts/:id
Update account

### DELETE /api/accounts/:id
Archive account

### POST /api/accounts/transfer
Transfer between accounts

---

## Transfer Flow

```
User submits transfer form
     │
     ▼
Server Action: transferFunds({ from, to, amount, date, note })
     │
     ▼
DB Transaction:
  1. INSERT transaction (type=transfer, accountId=from)
  2. UPDATE accounts SET balance = balance - amount WHERE id=from
  3. UPDATE accounts SET balance = balance + amount WHERE id=to
     │
     ▼
revalidatePath('/accounts')
```

---

## Design Reference

**Primary:** `docs/design-ref/accounts_wallets_m2/`
- `code.html` — Account cards grid, net worth bento card, transfer funds modal
- `screen.png` — Full visual reference

**Design Plan:** See `docs/04-ui-design-plan.md` for:
- Account type color coding (bank=blue, cash=green, credit=red, wallet=yellow)
- Bento grid layout patterns
- No 1px borders rule (use background shifts instead)

**Equilibrium Finance:** `docs/design-ref/equilibrium_finance/DESIGN.md`
- Surface hierarchy and glassmorphism overlays
- Typography: Manrope (headers), Inter (data/balances)

---

## Design Specifications

### Account Card
```
┌──────────────────────────────┐
│  💳 HDFC Savings             │
│                              │
│  ₹45,230.50                 │
│  ↑ ₹12,000  ↓ ₹8,400       │
│  (this month)                │
└──────────────────────────────┘
```

### Colors by Type
- **bank**: `#4F8EF7` (blue)
- **cash**: `#34D399` (green)
- **credit**: `#F87171` (red)
- **wallet**: `#FBBF24` (yellow)
- **investment**: `#A78BFA` (purple)

---

## Implementation Checklist

### Schema
- [ ] Create accounts table migration
- [ ] Run drizzle-kit generate + migrate

### Queries
- [ ] `getAccountsWithBalance(userId)`
- [ ] `getAccountById(id, userId)`
- [ ] `getAccountTransactions(accountId)`

### Pages
- [ ] Build accounts list page
- [ ] Build account detail page
- [ ] Build transfer modal

### Server Actions
- [ ] Implement CRUD actions
- [ ] Implement transfer action

### Testing
- [ ] Test account creation
- [ ] Test balance updates
- [ ] Test transfer flow
- [ ] Test archive behavior
