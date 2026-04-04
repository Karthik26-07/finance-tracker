"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

interface DashboardChartsProps {
  dailySpending: { date: string; total: number }[];
  categorySpending: {
    categoryName: string | null;
    categoryColor: string | null;
    total: number | string;
  }[];
}

export function DashboardCharts({
  dailySpending,
  categorySpending,
}: DashboardChartsProps) {

  const chartData = dailySpending.map((d) => ({
    date: format(parseISO(d.date), "MMM d"),
    amount: parseFloat(d.total.toString()),
  }));

  const pieData = categorySpending.slice(0, 6).map((c) => ({
    name: c.categoryName || "Other",
    value: parseFloat(c.total.toString()),
    color: c.categoryColor || "#CBD5E1",
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Spending Trend */}
      <div className="p-5 sm:p-8 bg-surface border border-border/50 rounded-4xl shadow-ambient">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black tracking-tight text-text-primary">
              Spending Trend
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Last 30 days of expenditures
            </p>
          </div>
          <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest">
            Daily
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.15}
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
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--color-text-muted)",
                  fontSize: 9,
                  fontWeight: 600,
                }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--color-text-muted)",
                  fontSize: 9,
                  fontWeight: 600,
                }}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "1.25rem",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-2xl)",
                  backgroundColor: "var(--color-surface)",
                  padding: "12px 16px",
                }}
                itemStyle={{ color: "var(--color-primary)", fontWeight: 700 }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="var(--color-primary)"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorAmt)"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Allocation */}
      <div className="p-5 sm:p-8 bg-surface border border-border/50 rounded-4xl shadow-ambient">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black tracking-tight text-text-primary">
              Allocation
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Expenses by category (Month)
            </p>
          </div>
          <div className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-bold uppercase tracking-widest">
            Breakdown
          </div>
        </div>

        <div className="h-80 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={8}
                dataKey="value"
                animationDuration={1500}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "1rem",
                  border: "none",
                  boxShadow: "var(--shadow-2xl)",
                }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
