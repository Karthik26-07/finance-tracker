"use client";

import React from "react";
import {
  Filter,
  Download,
  Receipt,
  ShoppingBag,
  Home,
  Car,
  UtensilsCrossed,
  MoreVertical,
} from "lucide-react";

interface ExpenseJournalProps {
  transactions: any[];
  groupName: string;
}

const CATEGORY_ICONS = {
  food: {
    icon: UtensilsCrossed,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  transport: { icon: Car, color: "text-blue-500", bg: "bg-blue-500/10" },
  home: { icon: Home, color: "text-purple-500", bg: "bg-purple-500/10" },
  shopping: { icon: ShoppingBag, color: "text-pink-500", bg: "bg-pink-500/10" },
  default: { icon: Receipt, color: "text-primary", bg: "bg-primary/10" },
};

export function GroupExpenseJournal({
  transactions,
  groupName,
}: ExpenseJournalProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted opacity-60 font-mono">
          Collective Ledger
        </h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-highlight/30 text-text-secondary rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-highlight transition-all border border-border/10 font-mono">
            <Filter size={12} strokeWidth={3} /> Filter
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-highlight/30 text-text-secondary rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-highlight transition-all border border-border/10 font-mono">
            <Download size={12} strokeWidth={3} /> Export CSV
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {transactions && transactions.length > 0 ? (
          transactions.map((tx, idx) => {
            const cat = tx.categoryId ? "food" : "default"; // Need real mapping
            const {
              icon: Icon,
              color,
              bg,
            } = CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS] ||
            CATEGORY_ICONS.default;

            return (
              <div
                key={tx.id}
                className="group flex items-center justify-between p-4 hover:bg-highlight/20 transition-all rounded-2xl cursor-pointer relative"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full ${bg} ${color} flex items-center justify-center border border-border/10 shadow-sm group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <h4 className="text-sm font-black text-text-primary tracking-tight leading-none">
                        {tx.title}
                      </h4>
                      {isMounted && (
                        <span className="text-[9px] font-black text-text-muted opacity-40 uppercase tracking-widest font-mono">
                          {new Date(tx.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest font-mono opacity-60">
                      Paid by{" "}
                      <span className="text-primary opacity-100 font-black">
                        Alex T.
                      </span>{" "}
                      • Split Equally
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-black text-text-primary tabular-nums tracking-tighter leading-none mb-1.5">
                      ₹{Number(tx.totalAmount).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-secondary font-black tabular-nums font-mono uppercase tracking-widest opacity-80">
                      +₹{(Number(tx.totalAmount) / 2).toLocaleString()}
                    </p>
                  </div>
                  <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-highlight text-text-muted rounded-lg transition-all active:scale-90">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-24 text-center border-t border-border/20 opacity-40">
            <Receipt size={40} className="mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted font-mono">
              Collective ledger is empty
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
