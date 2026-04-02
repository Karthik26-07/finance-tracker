export interface GroupMember {
  id: string;
  userId: string | null;
  name: string;
  email?: string | null;
  role: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  createdAt: Date | string | null;
  members: GroupMember[];
}

export interface Debt {
  from: string;
  to: string;
  amount: string | number;
}

export interface GroupDebts {
  members: Record<string, GroupMember>;
  debts: Debt[];
}

export interface GroupTransaction {
  id: string;
  groupId: string;
  paidBy: string;
  title: string;
  totalAmount: string | number;
  date: string | Date;
  splitType: 'equal' | 'exact' | 'shares' | 'percentage' | null;
}
