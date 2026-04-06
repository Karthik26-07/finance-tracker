'use server'

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { executeServerAction } from "@/lib/server-action-middleware";
import { GroupService } from "./groups.service";

const groupService = new GroupService();

const createGroupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
});

export async function createGroup(formData: FormData) {
  return executeServerAction(
    async (session) => {
      const data = createGroupSchema.parse({
        name: formData.get("name"),
        description: formData.get("description") || null,
        icon: formData.get("icon") || null,
        color: formData.get("color") || null,
      });

      const newGroup = await groupService.createGroup(session!.user.id, data, session!.user);

      revalidatePath("/groups");
      return newGroup;
    },
    { action: "createGroup" }
  );
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
  return executeServerAction(
    async () => {
      const validData = addExpenseSchema.parse(data);
      const tx = await groupService.addGroupExpense(validData);

      revalidatePath("/groups");
      return tx;
    },
    { action: "addGroupExpense" }
  );
}

export async function addMember(groupId: string, data: { name: string, email?: string, userId?: string }) {
  return executeServerAction(
    async () => {
      const member = await groupService.addMember(groupId, data);
      revalidatePath("/groups");
      return member;
    },
    { action: "addMember" }
  );
}

export async function settleDebt(fromMemberId: string, toMemberId: string, amount: number, groupId: string) {
  return executeServerAction(
    async () => {
      await groupService.settleDebt(fromMemberId);
      revalidatePath("/groups");
      return { success: true };
    },
    { action: "settleDebt" }
  );
}
