# M7 — Group Expenses

## Purpose
Track shared expenses and settlements among a group (trips, flatmates, office lunches).

---

## Features

### Group Management
- [ ] Create group (name, description, icon, color)
- [ ] Add members (app users + external by name/email)
- [ ] Edit group details
- [ ] Archive group (mark inactive)

### Group Expenses
- [ ] Add expense: title, amount, paid by, date, category
- [ ] Split methods: Equal, Percentage, Exact Amount, Shares
- [ ] Exclude members from specific expense
- [ ] Edit/delete expense

### Settlements
- [ ] Record settlement (who paid whom)
- [ ] Auto-creates personal transaction
- [ ] Settlement history

### Balances
- [ ] Who owes whom
- [ ] Net balance per member
- [ ] Debt simplification algorithm

---

## Database Schema

### groups, group_members, group_transactions, group_splits

See `lib/db/schema/groups.ts` for full schema.

---

## File Structure

```
app/
├── (dashboard)/
│   └── groups/
│       ├── page.tsx (list)
│       └── [id]/
│           ├── page.tsx (detail with tabs)
│           ├── edit/page.tsx
│           └── settle/page.tsx
└── api/
    └── groups/
        ├── route.ts
        ├── [id]/route.ts
        ├── [id]/members/route.ts
        ├── [id]/transactions/route.ts
        ├── [id]/balances/route.ts
        └── [id]/settle/route.ts

actions/
└── groups.ts

components/
└── groups/
    ├── GroupList.tsx
    ├── GroupCard.tsx
    ├── GroupDetail.tsx
    ├── GroupExpenseForm.tsx
    ├── SplitMethodSelector.tsx
    ├── BalanceTable.tsx
    └── SettlementForm.tsx

lib/
├── db/queries/groups.ts
├── utils/groups.ts (balance calc, debt simplification)
└── validations/groups.ts
```

---

## Split Methods

### 1. Equal Split
```
Total: ₹2,400  |  4 members  →  Each owes: ₹600
```

### 2. Percentage Split
```
Total: ₹2,400
Ravi:  40% → ₹960
You:   30% → ₹720
Priya: 20% → ₹480
Arun:  10% → ₹240
```

### 3. Exact Amount Split
```
Total: ₹2,400
Ravi:  ₹1,000
You:   ₹800
Priya: ₹400
Arun:  ₹200
```

### 4. Shares Split
```
Total: ₹2,400  |  6 total shares
Ravi:  2 shares → ₹800
You:   2 shares → ₹800
Priya: 1 share  → ₹400
Arun:  1 share  → ₹400
```

---

## Balance Calculation

```ts
// lib/utils/groups.ts
export function calculateGroupBalances(
  groupTransactions: GroupTxWithSplits[],
  settlements: Settlement[]
): Record<string, number> {
  const ledger: Record<string, number> = {}

  for (const tx of groupTransactions) {
    ledger[tx.paidBy] = (ledger[tx.paidBy] ?? 0) + Number(tx.totalAmount)
    for (const split of tx.splits) {
      ledger[split.memberId] = (ledger[split.memberId] ?? 0) - Number(split.amountOwed)
    }
  }

  for (const s of settlements) {
    ledger[s.fromMemberId] = (ledger[s.fromMemberId] ?? 0) + s.amount
    ledger[s.toMemberId]   = (ledger[s.toMemberId]   ?? 0) - s.amount
  }

  return ledger
}
```

### Debt Simplification

```ts
export function simplifyDebts(balances: Record<string, number>) {
  // Minimizes transactions needed to settle all debts
  // Returns optimal settlement plan
}
```

---

## Components to Create

### Pages
- [ ] `app/(dashboard)/groups/page.tsx` - Group list
- [ ] `app/(dashboard)/groups/[id]/page.tsx` - Detail with 3 tabs
- [ ] `app/(dashboard)/groups/[id]/edit/page.tsx` - Edit group
- [ ] `app/(dashboard)/groups/[id]/settle/page.tsx` - Settlement form

### Components
- [ ] `components/groups/GroupList.tsx`
- [ ] `components/groups/GroupCard.tsx`
- [ ] `components/groups/GroupDetail.tsx`
- [ ] `components/forms/GroupExpenseForm.tsx`
- [ ] `components/groups/SplitMethodSelector.tsx`
- [ ] `components/groups/BalanceTable.tsx`
- [ ] `components/groups/SettlementForm.tsx`

### Server Actions (`actions/groups.ts`)
- [ ] `createGroup(input)`
- [ ] `updateGroup(id, input)`
- [ ] `addGroupExpense(input)`
- [ ] `updateGroupExpense(id, input)`
- [ ] `deleteGroupExpense(id)`
- [ ] `settleDebt(input)` - Creates personal transaction

---

## Design Reference

**Primary:** `docs/design-ref/group_expenses_m7/`
- `code.html` — Group cards with balance display, group detail with tabs (Expenses/Balances/Settlements), debt reconciliation, split method selector
- `screen.png` — Full visual reference

**Design Plan:** `docs/04-ui-design-plan.md`
- Split method selector (Equal/Percentage/Exact/Shares)
- Balance visualization (who owes whom)
- Tab navigation pattern

**Equilibrium Finance:** `docs/design-ref/equilibrium_finance/DESIGN.md`
- Card-based group listing
- Settlement flow patterns

---

## UI Screens

### Group List
```
┌──────────────────────────────────────────────────────┐
│  Groups                             [+ New Group]    │
├──────────────────────────────────────────────────────┤
│  ✈️ Goa Trip 2025          4 members                 │
│     You are owed ₹1,200                              │
├──────────────────────────────────────────────────────┤
│  🏠 Flat - HSR Layout       3 members                │
│     You owe ₹2,400                                   │
└──────────────────────────────────────────────────────┘
```

### Group Detail (3 Tabs)
```
┌─ Goa Trip 2025 ───────────────────────────────────────┐
│  [Expenses] [Balances] [Settlements]                  │
├───────────────────────────────────────────────────────┤
│  TAB: Expenses                                        │
│  [+ Add Expense]  [Settle Up]                         │
│  ───────────────────────────────────────────────────  │
│  Hotel Booking    ₹12,000   Paid by: Ravi   14 Jan   │
│    You: ₹3,000  Priya: ₹3,000  Arun: ₹3,000          │
└───────────────────────────────────────────────────────┘
```

---

## Integration with Personal Finance

When settling a group debt:
```ts
// settleDebt action creates personal transaction
await tx.insert(transactions).values({
  userId:     session.user.id,
  accountId:  input.accountId,
  type:       'expense',
  amount:     input.amount,
  note:       `Settlement: ${groupName} — paid to ${memberName}`,
  categoryId: settlementCategoryId,
})
```

---

## Implementation Checklist

### Schema
- [ ] Create groups, group_members, group_transactions, group_splits tables
- [ ] Run drizzle-kit generate + migrate

### Queries
- [ ] `getGroups(userId)`
- [ ] `getGroupDetail(groupId)`
- [ ] `getGroupBalances(groupId)`
- [ ] `getGroupTransactions(groupId)`

### Pages
- [ ] Build group list page
- [ ] Build group detail page with tabs
- [ ] Build add expense modal
- [ ] Build settlement form

### Utils
- [ ] Implement `calculateGroupBalances()`
- [ ] Implement `simplifyDebts()`
- [ ] Implement `computeSplits()` for each method

### Testing
- [ ] Test all split methods
- [ ] Test balance calculations
- [ ] Test settlement flow
- [ ] Test external members
