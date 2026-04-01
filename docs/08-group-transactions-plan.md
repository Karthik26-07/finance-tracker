# 08 — Group Transactions Plan

## Overview

The Group Expenses module handles shared spending between multiple people. It tracks who paid, calculates each person's share, and records settlements. Inspired by Splitwise but tightly integrated with the personal finance layer.

All group mutations use **Server Actions** in `actions/groups.ts`. Balance calculations run server-side via Drizzle queries.

---

## Core Concepts

| Term | Definition |
|------|------------|
| **Group** | A collection of people sharing expenses (e.g., "Goa Trip", "Flatmates") |
| **Group Member** | A participant — can be an app user or an external contact |
| **Group Transaction** | A single shared expense (e.g., "Hotel booking ₹12,000") |
| **Split** | Each member's share of a group transaction |
| **Settlement** | A payment made to resolve a debt between members |
| **Balance** | Net amount a member owes or is owed across all transactions |

---

## Split Methods

### 1. Equal Split
Total divided equally among all members.
```
Total: ₹2,400  |  4 members  →  Each owes: ₹600
```

### 2. Percentage Split
Each member assigned a percentage.
```
Total: ₹2,400
Ravi:  40% → ₹960
You:   30% → ₹720
Priya: 20% → ₹480
Arun:  10% → ₹240
```

### 3. Exact Amount Split
Manually enter each person's amount (must sum to total).
```
Total: ₹2,400
Ravi:  ₹1,000
You:   ₹800
Priya: ₹400
Arun:  ₹200
```

### 4. Shares Split
Assign a number of "shares" to each person; amounts calculated proportionally.
```
Total: ₹2,400  |  6 total shares
Ravi:  2 shares → ₹800
You:   2 shares → ₹800
Priya: 1 share  → ₹400
Arun:  1 share  → ₹400
```

### 5. Exclude Members
Optionally exclude certain members from a given expense.

---

## Balance Calculation (`lib/utils/groups.ts`)

### Net Balance Algorithm

```ts
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

  // Positive = member is owed money
  // Negative = member owes money
  return ledger
}
```

### Debt Simplification Algorithm

Minimizes the number of transactions needed to settle all debts.

```ts
export function simplifyDebts(balances: Record<string, number>) {
  const creditors = Object.entries(balances)
    .filter(([, b]) => b > 0.01)
    .sort((a, b) => b[1] - a[1])

  const debtors = Object.entries(balances)
    .filter(([, b]) => b < -0.01)
    .sort((a, b) => a[1] - b[1])

  const settlements: { from: string; to: string; amount: number }[] = []
  let i = 0, j = 0

  while (i < creditors.length && j < debtors.length) {
    const [creditor, credit] = creditors[i]
    const [debtor, debt]     = debtors[j]
    const amount = Math.min(credit, Math.abs(debt))

    settlements.push({ from: debtor, to: creditor, amount: Math.round(amount * 100) / 100 })

    creditors[i][1] -= amount
    debtors[j][1]   += amount

    if (creditors[i][1] < 0.01) i++
    if (debtors[j][1]   > -0.01) j++
  }

  return settlements
}
```

---

## Server Actions (`actions/groups.ts`)

```ts
'use server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { groups, groupMembers, groupTransactions, groupSplits } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'

export async function createGroup(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const name = formData.get('name') as string

  await db.transaction(async (tx) => {
    const [group] = await tx.insert(groups).values({
      name,
      createdBy: session.user.id,
    }).returning()

    // Add creator as admin member
    await tx.insert(groupMembers).values({
      groupId: group.id,
      userId:  session.user.id,
      role:    'admin',
    })
  })

  revalidatePath('/groups')
}

export async function addGroupExpense(input: AddGroupExpenseInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const splits = computeSplits(input.splitType, input.totalAmount, input.memberShares)

  await db.transaction(async (tx) => {
    const [groupTx] = await tx.insert(groupTransactions).values({
      groupId:     input.groupId,
      title:       input.title,
      totalAmount: input.totalAmount,
      paidBy:      input.paidBy,
      date:        input.date,
      splitType:   input.splitType,
      categoryId:  input.categoryId,
    }).returning()

    await tx.insert(groupSplits).values(
      splits.map(s => ({
        groupTransactionId: groupTx.id,
        memberId:           s.memberId,
        amountOwed:         s.amount,
      }))
    )
  })

  revalidatePath(`/groups/${input.groupId}`)
}

export async function settleDebt(input: SettleDebtInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  await db.transaction(async (tx) => {
    // Mark splits as settled
    await tx.update(groupSplits)
      .set({ isSettled: true, settledAt: new Date() })
      .where(and(
        eq(groupSplits.memberId, input.fromMemberId),
        eq(groupSplits.isSettled, false)
      ))

    // Create personal transaction for the payer
    const [personalTx] = await tx.insert(transactions).values({
      userId:     session.user.id,
      accountId:  input.accountId,
      type:       'expense',
      amount:     input.amount,
      date:       format(new Date(), 'yyyy-MM-dd'),
      note:       `Settlement: ${input.groupName} — paid to ${input.toMemberName}`,
      categoryId: input.settlementCategoryId,
    }).returning()

    // Update account balance
    await tx.update(accounts)
      .set({ balance: sql`balance - ${input.amount}` })
      .where(eq(accounts.id, input.accountId))
  })

  revalidatePath(`/groups/${input.groupId}`)
}
```

---

## UI Screens

### Group List (`/groups`)

```
┌──────────────────────────────────────────────────────┐
│  Groups                             [+ New Group]    │
├──────────────────────────────────────────────────────┤
│  ✈️ Goa Trip 2025          4 members                 │
│     You are owed ₹1,200                              │
├──────────────────────────────────────────────────────┤
│  🏠 Flat - HSR Layout       3 members                │
│     You owe ₹2,400                                   │
├──────────────────────────────────────────────────────┤
│  🍽️ Office Lunch Club       8 members                │
│     Settled up ✅                                    │
└──────────────────────────────────────────────────────┘
```

### Group Detail (`/groups/[id]`)

Page is a **Server Component** — fetches group data, members, transactions, and balances via Drizzle on the server. The tabs (Expenses / Balances / Settlements) switch client-side with no extra fetch.

**Tab 1: Expenses**
```
┌────────────────────────────────────────────────────────┐
│  ✈️ Goa Trip 2025          [+ Add Expense] [Settle Up] │
├────────────────────────────────────────────────────────┤
│  BALANCES                                              │
│  You are owed ₹1,200 by Arun                          │
│  You owe ₹800 to Priya                                │
│  Net: You are owed ₹400                               │
├────────────────────────────────────────────────────────┤
│  14 Jan 2025                                           │
│  Hotel Booking      ₹12,000   Paid by: Ravi            │
│  Split equally · 4 people · You owe ₹3,000            │
│                                                        │
│  Beach Dinner       ₹2,400    Paid by: You             │
│  Split equally · 4 people · You get back ₹1,800       │
└────────────────────────────────────────────────────────┘
```

**Tab 2: Balances**
```
Member      Paid (₹)  Owed (₹)  Net (₹)
──────────────────────────────────────────
Ravi        14,000    6,125     +7,875 ↑
You          4,800    6,125     -1,325 ↓
Priya        3,200    6,125     -2,925 ↓
Arun         2,500    6,125     -3,625 ↓
──────────────────────────────────────────
Total       24,500   24,500
```

**Tab 3: Settlements**
```
  Arun → Ravi        ₹3,625   Pending
  Priya → Ravi       ₹2,925   Pending
  You → Ravi         ₹1,325   ✅ Settled on 20 Jan
```

### Add Group Expense Modal

```
┌──────────────────────────────────────────┐
│  Add Group Expense              [✕]      │
│ ──────────────────────────────────────── │
│  Title:   [Hotel Booking         ]       │
│  Amount:  ₹ [12000              ]       │
│  Paid by: [Ravi              ▼  ]       │
│  Date:    [14 Jan 2025         📅]      │
│  Category:[Accommodation       ▼]       │
│                                          │
│  Split Method:                           │
│  [●Equal] [%Percent] [₹Exact] [Shares]  │
│                                          │
│  Members:         Amount                 │
│  ✅ Ravi          ₹3,000                │
│  ✅ You           ₹3,000                │
│  ✅ Priya         ₹3,000                │
│  ✅ Arun          ₹3,000                │
│  Total split:     ₹12,000 ✅            │
│                                          │
│  [Cancel]        [Add Expense]           │
└──────────────────────────────────────────┘
```

---

## Integration with Personal Finance

When a group expense is settled (you pay someone), the `settleDebt` Server Action automatically creates a corresponding personal transaction:
- **Type**: Expense
- **Amount**: settlement amount
- **Category**: "Group Settlement" (system category)
- **Note**: `"Settlement: Goa Trip — paid to Ravi"`
- **Account**: user's selected account

This keeps personal account balance accurate without manual double-entry.

---

## External Members

Non-app users can be added to groups by name + email:
- They are stored in `group_members` with `userId = NULL`
- Their debts are tracked but settled manually
- If they later join the app, their membership can be linked

---

## Group Archive

Once a trip/event is over:
- Group can be marked as `isActive = false`
- All balances frozen (no new expenses can be added)
- Still viewable in report history
- Can be re-activated if needed
