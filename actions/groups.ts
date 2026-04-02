'use server'

import { db } from "@/lib/db";
import { groups, groupMembers, groupTransactions, groupSplits } from "@/lib/db/schema/groups";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const createGroupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export async function createGroup(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = createGroupSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    icon: formData.get("icon"),
    color: formData.get("color"),
  });

  const [newGroup] = await db
    .insert(groups)
    .values({
      ...data,
      createdBy: session.user.id,
    })
    .returning();

  // Add creator as admin member
  await db.insert(groupMembers).values({
    groupId: newGroup.id,
    userId: session.user.id,
    name: session.user.name || "Owner",
    email: session.user.email,
    role: "admin",
  });

  revalidatePath("/groups");
  return newGroup;
}

const addExpenseSchema = z.object({
  groupId: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  totalAmount: z.string(),
  paidBy: z.string().uuid(), // group member ID
  date: z.string(),
  note: z.string().optional(),
  splitType: z.enum(["equal", "percentage", "exact", "shares"]).default("equal"),
  splits: z.array(z.object({
    memberId: z.string().uuid(),
    amountOwed: z.string(),
  })),
});

export async function addGroupExpense(data: z.infer<typeof addExpenseSchema>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const validData = addExpenseSchema.parse(data);

  const [tx] = await db
    .insert(groupTransactions)
    .values({
      groupId: validData.groupId,
      title: validData.title,
      totalAmount: validData.totalAmount,
      paidBy: validData.paidBy,
      date: validData.date,
      note: validData.note,
      splitType: validData.splitType,
    })
    .returning();

  await db.insert(groupSplits).values(
    validData.splits.map((s) => ({
      groupTransactionId: tx.id,
      memberId: s.memberId,
      amountOwed: s.amountOwed,
    }))
  );

  revalidatePath("/groups");
  return tx;
}

export async function addMember(groupId: string, data: { name: string, email?: string, userId?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [member] = await db
    .insert(groupMembers)
    .values({
      groupId,
      name: data.name,
      email: data.email,
      userId: data.userId,
      role: "member",
    })
    .returning();

  revalidatePath("/groups");
  return member;
}

export async function settleDebt(fromMemberId: string, toMemberId: string, amount: number, groupId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Mark existing splits between these members as settled up to the amount
  await db
    .update(groupSplits)
    .set({ isSettled: true, settledAt: new Date() })
    .where(
      and(
        eq(groupSplits.memberId, fromMemberId),
        eq(groupSplits.isSettled, false)
      )
    );

  revalidatePath("/groups");
  return { success: true };
}
