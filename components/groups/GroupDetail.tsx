"use client";

import React from "react";
import { GroupBalanceGrid } from "./GroupBalanceGrid";
import { AddGroupExpenseDialog } from "./AddGroupExpenseDialog";
import { Settings, Users, Calendar, Receipt, Share2, Plus } from "lucide-react";
import { GroupExpenseJournal } from "./GroupExpenseJournal";
import { GroupDebtReconciliation } from "./GroupDebtReconciliation";
import { InviteMemberDialog } from "./InviteMemberDialog";

interface GroupMember {
  id: string;
  userId: string | null;
  name: string;
  email?: string | null;
  role: string;
}

interface Group {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  createdAt: string;
  members: GroupMember[];
}

interface Debt {
  from: string;
  to: string;
  amount: string;
}

interface GroupDetailProps {
  group: Group;
  debts: {
    members: Record<string, GroupMember>;
    debts: Debt[];
  };
  userId: string;
  transactions: unknown[];
}

export function GroupDetail({
  group,
  debts,
  userId,
  transactions,
}: GroupDetailProps) {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = React.useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!group) {
    return (
      <div className="col-span-12 lg:col-span-8 flex flex-col items-center justify-center py-48 bg-highlight/20 border border-dashed border-border/40 rounded-3xl animate-in fade-in zoom-in-95 duration-500">
        <Receipt
          size={64}
          className="text-text-muted opacity-20 mb-6 drop-shadow-sm"
        />
        <h3 className="text-xl font-black text-text-primary tracking-tighter">
          Select a Collective
        </h3>
        <p className="text-sm font-medium text-text-secondary opacity-60 mt-1 uppercase tracking-widest font-mono">
          View shared balances and ledgers
        </p>
      </div>
    );
  }

  return (
    <div className="col-span-12 lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-surface border border-border/50 rounded-3xl p-8 shadow-sm group">
        {/* Detail Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-10">
          <div className="flex gap-6 items-center">
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-xl shadow-primary/10 bg-linear-to-br from-primary to-primary-container text-white`}
              style={
                group.color
                  ? {
                      background: `linear-gradient(to bottom right, ${group.color}, ${group.color})`,
                      color: "#fff",
                    }
                  : undefined
              }
            >
              <Users size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-black text-text-primary tracking-tighter font-display leading-none">
                  {group.name}
                </h2>
                <span className="px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-[9px] font-black uppercase tracking-widest font-mono ring-1 ring-secondary/20">
                  LIVE:FLOW
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-text-secondary opacity-70 mt-3 font-mono">
                <div className="flex items-center gap-1.5">
                  <Calendar
                    size={13}
                    strokeWidth={2.5}
                    className="text-primary"
                  />{" "}
                  {isMounted ? new Date(group.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }) : null}
                </div>
                <button 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors group/member"
                >
                  <Users size={13} strokeWidth={2.5} className="text-primary group-hover/member:scale-110 transition-transform" />{" "}
                  {group.members?.length || 0} Members
                  <Plus size={10} strokeWidth={4} className="ml-0.5 opacity-0 group-hover/member:opacity-100 transition-opacity" />
                </button>
                {group.description && (
                  <div className="flex items-center gap-1.5 opacity-80 italic">
                    • {group.description}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 self-end sm:self-start">
            <button className="p-3 bg-highlight/40 rounded-2xl text-text-secondary hover:bg-highlight hover:text-primary transition-all active:scale-90 shadow-sm border border-border/20">
              <Settings size={18} />
            </button>
            <button className="p-3 bg-highlight/40 rounded-2xl text-text-secondary hover:bg-highlight hover:text-primary transition-all active:scale-90 shadow-sm border border-border/20">
              <Share2 size={18} />
            </button>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-2.5 px-6 py-3 bg-linear-to-br from-primary to-primary-container text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Plus size={16} strokeWidth={3} /> Post Expense
            </button>
          </div>
        </div>

        {/* Balances Overview Bento-ish */}
        <GroupBalanceGrid group={group} />

        {/* Debt Reconciliation (Who owes who) */}
        <GroupDebtReconciliation
          debts={debts?.debts || []}
          members={debts?.members || []}
          userId={userId}
        />

        {/* Expense Journal (Transaction Ledger) */}
        <GroupExpenseJournal
          transactions={transactions}
          groupName={group.name}
        />
      </div>

      <AddGroupExpenseDialog
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        group={group}
        userId={userId}
      />

      <InviteMemberDialog
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        groupId={group.id}
      />
    </div>
  );
}
