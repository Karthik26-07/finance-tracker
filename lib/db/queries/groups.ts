import { db } from "../index";
import { groups, groupMembers, groupTransactions, groupSplits } from "../schema/groups";
import { eq, and, desc, sql } from "drizzle-orm";

export async function getGroups(userId: string) {
  const allGroups = await db.query.groups.findMany({
    with: {
      members: true,
    },
  });

  return allGroups.filter((g) => 
    g.members.some((m) => m.userId === userId)
  );
}

export async function getGroupDetails(groupId: string, userId: string) {
  const groupData = await db.query.groups.findFirst({
    where: eq(groups.id, groupId),
    with: {
      members: true,
      transactions: {
        orderBy: [desc(groupTransactions.date)],
        limit: 10,
      },
    },
  });

  if (!groupData) return null;

  // Calculate current user's balance in this group
  // Balance = (Amount Paid by User) - (Amount Owed by User)
  const userMember = groupData.members.find((m) => m.userId === userId);
  if (!userMember) return null;

  const paidResult = await db
    .select({ total: sql<number>`sum(${groupTransactions.totalAmount})` })
    .from(groupTransactions)
    .where(and(eq(groupTransactions.groupId, groupId), eq(groupTransactions.paidBy, userMember.id)));

  const owedResult = await db
    .select({ total: sql<number>`sum(${groupSplits.amountOwed})` })
    .from(groupSplits)
    .where(and(eq(groupSplits.memberId, userMember.id), eq(groupSplits.isSettled, false)));

  const paid = Number(paidResult[0]?.total || 0);
  const owed = Number(owedResult[0]?.total || 0);
  const balance = paid - owed;

  return {
    ...groupData,
    balance,
    paid,
    owed,
  };
}

export async function getGroupTransactions(groupId: string) {
  return db.query.groupTransactions.findMany({
    where: eq(groupTransactions.groupId, groupId),
    orderBy: [desc(groupTransactions.date)],
    with: {
      splits: true,
    },
  });
}

export async function getGroupDebts(groupId: string) {
  // Simple algorithm to calculate who owes whom
  // In a real app, this would be a more complex reconciliation
  const members = await db.query.groupMembers.findMany({
    where: eq(groupMembers.groupId, groupId),
  });

  const transactions = await db.query.groupTransactions.findMany({
    where: eq(groupTransactions.groupId, groupId),
    with: {
      splits: true,
    },
  });

  // Calculate net balance for each member
  const balances: Record<string, number> = {};
  members.forEach((m) => (balances[m.id] = 0));

  transactions.forEach((tx) => {
    // Add full amount to paid member
    balances[tx.paidBy] += Number(tx.totalAmount);
    // Subtract share from each splitting member
    tx.splits.forEach((split) => {
      balances[split.memberId] -= Number(split.amountOwed);
    });
  });

  // Debt flows (A owes B amount)
  const debts: { from: string; to: string; amount: number }[] = [];
  
  const creditors = members
    .filter((m) => balances[m.id] > 0)
    .sort((a, b) => balances[b.id] - balances[a.id]);
  const debtors = members
    .filter((m) => balances[m.id] < 0)
    .sort((a, b) => balances[a.id] - balances[b.id]);

  let cIdx = 0;
  let dIdx = 0;

  while (cIdx < creditors.length && dIdx < debtors.length) {
    const creditor = creditors[cIdx];
    const debtor = debtors[dIdx];
    const amount = Math.min(balances[creditor.id], -balances[debtor.id]);

    if (amount > 0.01) {
      debts.push({
        from: debtor.id,
        to: creditor.id,
        amount: Number(amount.toFixed(2)),
      });
    }

    balances[creditor.id] -= amount;
    balances[debtor.id] += amount;

    if (balances[creditor.id] < 0.01) cIdx++;
    if (balances[debtor.id] > -0.01) dIdx++;
  }

  return {
    members: members.reduce((acc, m) => ({ ...acc, [m.id]: m }), {}),
    debts,
  };
}
