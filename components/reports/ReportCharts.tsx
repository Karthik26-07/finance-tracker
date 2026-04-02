"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from "recharts";

interface MonthlyFlowData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface MonthlyFlowChartProps {
  data: MonthlyFlowData[];
}

export function MonthlyFlowChart({ data }: MonthlyFlowChartProps) {
  return (
    <div className="p-8 bg-surface border border-border/40 rounded-[2.5rem] shadow-ambient overflow-hidden group transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-primary rounded-full shadow-sm shadow-primary/20" />
          <div>
            <h3 className="text-2xl font-black text-text-primary tracking-tight">
              Financial Flow
            </h3>
            <p className="text-xs text-text-muted mt-1 uppercase font-bold tracking-widest opacity-60">
              6-Month Trend Analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 bg-highlight/50 px-5 py-3 rounded-2xl border border-border/40">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-secondary" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              Inflow
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-tertiary" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              Outflow
            </span>
          </div>
        </div>
      </div>

      <div className="h-100 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={12}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border)"
              opacity={0.3}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--color-text-muted)",
                fontSize: 11,
                fontWeight: 700,
              }}
              dy={15}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--color-text-muted)",
                fontSize: 11,
                fontWeight: 700,
              }}
              tickFormatter={(val) => `₹${val / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: "var(--color-highlight)", opacity: 0.2 }}
              contentStyle={{
                borderRadius: "1.5rem",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-2xl)",
                backgroundColor: "var(--color-surface)",
                padding: "20px",
              }}
              itemStyle={{ fontWeight: 800 }}
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="var(--color-secondary)"
              radius={[8, 8, 4, 4]}
              barSize={32}
              animationDuration={2000}
            />
            <Bar
              dataKey="expense"
              name="Expenses"
              fill="var(--color-tertiary)"
              radius={[8, 8, 4, 4]}
              barSize={32}
              animationDuration={2500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface CategoryData {
  name: string;
  value: number | string;
  icon?: string | null;
  color?: string | null;
}

export function CategoryBreakdownReport({ data }: { data: CategoryData[] }) {
  const chartData = data.slice(0, 8).map((d) => ({
    ...d,
    value: parseFloat(d.value.toString()),
  }));

  return (
    <div className="p-8 bg-surface border border-border/40 rounded-[2.5rem] shadow-ambient h-full group transition-all overflow-hidden">
      <div className="mb-10 flex items-center gap-4">
        <div className="w-1.5 h-10 bg-secondary rounded-full shadow-sm shadow-secondary/20" />
        <div>
          <h3 className="text-2xl font-black text-text-primary tracking-tight">
            Allocation
          </h3>
          <p className="text-xs text-text-muted mt-1 uppercase font-bold tracking-widest opacity-60">
            Expenditure Distribution
          </p>
        </div>
      </div>

      <div className="h-87.5 w-full flex items-center justify-center relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em]">
            Cumulative
          </p>
          <p className="text-3xl font-black text-text-primary tracking-tighter">
            ₹
            {chartData
              .reduce((acc, curr) => acc + curr.value, 0)
              .toLocaleString()}
          </p>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={95}
              outerRadius={135}
              paddingAngle={6}
              dataKey="value"
              animationDuration={1800}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || "#CBD5E1"}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "1.25rem",
                border: "none",
                boxShadow: "var(--shadow-2xl)",
                padding: "15px",
              }}
              itemStyle={{ fontWeight: 800 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4">
        {chartData.map((cat, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 bg-highlight/30 rounded-2xl border border-border/40 hover:bg-surface hover:shadow-sm transition-all group/item"
          >
            <div className="flex items-center gap-3">
              <div className="text-xl shadow-sm filter grayscale group-hover/item:grayscale-0 transition-all">
                {cat.icon || "📦"}
              </div>
              <span className="text-[11px] font-bold text-text-primary truncate max-w-22.5">
                {cat.name}
              </span>
            </div>
            <span className="text-[11px] font-black text-text-primary tabular-nums">
              ₹{cat.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CashFlowTrendChart({ data }: { data: MonthlyFlowData[] }) {
  return (
    <div className="p-8 bg-surface border border-border/10 rounded-[2.5rem] shadow-ambient h-full overflow-hidden group transition-all">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-primary rounded-full shadow-sm shadow-primary/20" />
          <div>
            <h3 className="text-2xl font-black text-text-primary tracking-tight">
              Flow Analytics
            </h3>
            <p className="text-xs text-text-muted mt-1 uppercase font-bold tracking-widest opacity-60">
              Net Monthly Savings Curve
            </p>
          </div>
        </div>
        <div className="bg-primary/5 px-4 py-2 rounded-xl text-[10px] font-black text-primary uppercase tracking-[0.2em] border border-primary/10">
          Liquidity Analysis
        </div>
      </div>

      <div className="h-87.5 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border)"
              opacity={0.3}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--color-text-muted)",
                fontSize: 11,
                fontWeight: 700,
              }}
              dy={15}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--color-text-muted)",
                fontSize: 11,
                fontWeight: 700,
              }}
              tickFormatter={(val) => `₹${val / 1000}k`}
            />
            <Tooltip
              cursor={{
                stroke: "var(--color-primary)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              contentStyle={{
                borderRadius: "1.25rem",
                border: "none",
                boxShadow: "var(--shadow-2xl)",
                backgroundColor: "var(--color-surface)",
                padding: "15px",
              }}
              itemStyle={{ fontWeight: 800 }}
            />
            <Area
              type="monotone"
              dataKey="net"
              stroke="var(--color-primary)"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorNet)"
              animationDuration={2500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="p-6 bg-highlight/30 rounded-3xl border border-border/40">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 opacity-60">
            Avg. Savings
          </p>
          <p className="text-xl font-black text-text-primary">
            ₹
            {(
              data.reduce((acc, curr) => acc + curr.net, 0) / data.length
            ).toLocaleString()}
          </p>
        </div>
        <div className="p-6 bg-highlight/30 rounded-3xl border border-border/40">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 opacity-60">
            Retention Rate
          </p>
          <p className="text-xl font-black text-secondary">
            {(
              (data.reduce((acc, curr) => acc + curr.net, 0) /
                data.reduce((acc, curr) => acc + (curr.income || 1), 0)) *
              100
            ).toFixed(1)}
            %
          </p>
        </div>
      </div>
    </div>
  );
}
