"use client";

import React, { useState, useEffect } from "react";
import { Wallet, TrendingUp, TrendingDown, ClipboardList } from "lucide-react";

interface OverallStatsSummaryProps {
  stats: {
    totalIncome: number;
    totalExpense: number;
    count: number;
    net: number;
  };
}

export function OverallStatsSummary({ stats }: OverallStatsSummaryProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const metrics = [
    {
      label: "Selected Range Income",
      value: stats.totalIncome,
      Icon: TrendingUp,
      color: "secondary",
      borderColor: "border-secondary",
    },
    {
      label: "Selected Range Expense",
      value: stats.totalExpense,
      Icon: TrendingDown,
      color: "tertiary",
      borderColor: "border-tertiary",
    },
    {
      label: "Net Flow Summary",
      value: stats.net,
      Icon: Wallet,
      color: stats.net >= 0 ? "secondary" : "tertiary",
      borderColor: stats.net >= 0 ? "border-secondary" : "border-tertiary",
    },
    {
      label: "Transactions Tracked",
      value: stats.count,
      Icon: ClipboardList,
      color: "primary",
      borderColor: "border-primary",
      isCurrency: false,
    },
  ];

  const formatValue = (m: typeof metrics[0]) => {
    if (m.isCurrency === false) return m.value
    if (!isMounted) return Math.abs(m.value).toFixed(2)
    return Math.abs(m.value).toLocaleString()
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {metrics.map((m, i) => (
        <div
          key={i}
          className="p-5 sm:p-6 bg-surface border border-border/40 rounded-3xl shadow-ambient overflow-hidden group transition-all hover:scale-[1.02] duration-300 cursor-default"
        >
          {/* Decorative Background Icon */}
          <div
            className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none text-${m.color}`}
          >
            <m.Icon size={100} />
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 bg-${m.color}/10 rounded-2xl text-${m.color}`}>
              <m.Icon size={20} />
            </div>
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] font-mono leading-none">
              {m.label}
            </h4>
          </div>

          <div>
            <p
              className={`text-xl sm:text-2xl font-black tracking-tighter tabular-nums font-display ${m.color === "secondary" ? "text-secondary" : m.color === "tertiary" ? "text-tertiary" : "text-text-primary"}`}
            >
              {m.isCurrency === false ? "" : "₹"}{formatValue(m)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-1 h-1 rounded-full bg-${m.color}`} />
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest opacity-60">
                {m.label.split(" ")[0]} Metrics
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
