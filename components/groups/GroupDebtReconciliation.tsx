"use client";

import React from "react";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface DebtReconciliationProps {
  debts: any[];
  members: any;
  userId: string;
}

export function GroupDebtReconciliation({
  debts,
  members,
  userId,
}: DebtReconciliationProps) {
  const [settlingId, setSettlingId] = React.useState<string | null>(null);

  const handleSettle = async (from: string, to: string, amount: number) => {
    setSettlingId(`${from}-${to}`);
    try {
      // await settleDebt(from, to, amount, members[from].groupId)
      // Logic for settlement goes here
    } finally {
      setTimeout(() => setSettlingId(null), 1000);
    }
  };

  return (
    <div className="mb-12 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted opacity-60 font-mono">
          Flow Reconciliation
        </h3>
        <button className="text-[10px] font-black text-primary uppercase tracking-[0.15em] flex items-center gap-1.5 hover:underline group font-mono">
          <Sparkles
            size={14}
            strokeWidth={3}
            className="group-hover:rotate-12 transition-transform shadow-sm"
          />
          Optimize Net Obligations
        </button>
      </div>

      <div className="space-y-4">
        {debts && debts.length > 0 ? (
          debts.map((debt, idx) => {
            const isFromUser = members?.[debt.from]?.userId === userId;
            const isToUser = members?.[debt.to]?.userId === userId;
            const fromName = isFromUser
              ? "You"
              : members?.[debt.from]?.name || "Member";
            const toName = isToUser
              ? "You"
              : members?.[debt.to]?.name || "Member";
            const currentSettlingId = `${debt.from}-${debt.to}`;
            const isSettling = settlingId === currentSettlingId;

            return (
              <motion.div
                layout
                key={currentSettlingId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col sm:flex-row items-center justify-between p-5 bg-highlight/20 rounded-3xl border border-border/10 hover:bg-highlight/40 transition-colors shadow-sm group/row"
              >
                <div className="flex items-center gap-5 mb-4 sm:mb-0">
                  <div className="flex items-center -space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-surface bg-highlight flex items-center justify-center text-xs font-black shadow-ambient overflow-hidden">
                      <div className="bg-primary/20 w-full h-full flex items-center justify-center text-primary uppercase tracking-tighter">
                        {fromName[0]}
                      </div>
                    </div>
                    <div className="bg-surface p-1.5 rounded-full shadow-sm z-10 border border-border/10">
                      <ArrowRight
                        size={14}
                        strokeWidth={3}
                        className="text-text-muted group-hover/row:translate-x-1 transition-transform"
                      />
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-surface bg-highlight flex items-center justify-center text-xs font-black shadow-ambient overflow-hidden">
                      <div className="bg-secondary/20 w-full h-full flex items-center justify-center text-secondary uppercase tracking-tighter">
                        {toName[0]}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-black text-text-primary tracking-tight">
                      <span className={isFromUser ? "text-primary" : ""}>
                        {fromName}
                      </span>
                      <span className="text-text-muted mx-2 font-mono text-[10px] uppercase tracking-widest opacity-50">
                        owes
                      </span>
                      <span className={isToUser ? "text-secondary" : ""}>
                        {toName}
                      </span>
                    </p>
                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest opacity-60 mt-1 font-mono">
                      Settle via UPI / Bank Node
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8 self-end sm:self-auto">
                  <span
                    className={`text-xl font-black font-mono tabular-nums leading-none tracking-tighter ${isToUser ? "text-secondary" : "text-tertiary"}`}
                  >
                    ₹{debt.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() =>
                      handleSettle(debt.from, debt.to, debt.amount)
                    }
                    disabled={isSettling}
                    className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 ${
                      isFromUser
                        ? "bg-linear-to-br from-primary to-primary-container text-white hover:shadow-lg shadow-primary/20"
                        : "bg-secondary/10 text-secondary hover:bg-secondary hover:text-white border border-secondary/20"
                    }`}
                  >
                    {isSettling ? (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2
                          size={12}
                          strokeWidth={3}
                          className="animate-in zoom-in spin-in duration-300"
                        />
                        Processed
                      </div>
                    ) : isFromUser ? (
                      "Initiate Pay"
                    ) : (
                      "Mark Settled"
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="py-12 text-center bg-highlight/10 rounded-4xl border border-dashed border-border/30 animate-in fade-in duration-500">
            <CheckCircle2
              size={32}
              className="text-secondary opacity-30 mx-auto mb-3"
            />
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">
              Collective is Fully Liquidated & Settled
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
