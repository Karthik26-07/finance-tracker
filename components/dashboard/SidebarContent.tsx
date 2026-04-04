"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ReceiptText, 
  Wallet, 
  Tags, 
  Users, 
  RefreshCcw, 
  CircleDollarSign, 
  PieChart,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: ReceiptText,
  },
  {
    name: "Accounts",
    href: "/accounts",
    icon: Wallet,
  },
  {
    name: "Categories",
    href: "/categories",
    icon: Tags,
  },
  {
    name: "Groups",
    href: "/groups",
    icon: Users,
  },
  {
    name: "Recurring",
    href: "/recurring",
    icon: RefreshCcw,
  },
  {
    name: "Budgets",
    href: "/budgets",
    icon: CircleDollarSign,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: PieChart,
  },
];

interface SidebarContentProps {
  onItemClick?: () => void;
}

export function SidebarContent({ onItemClick }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-elevated border-r border-border/50">
      {/* Logo */}
      <div className="flex items-center gap-3 h-20 px-6 bg-surface/50 backdrop-blur-md">
        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary to-primary-container flex items-center justify-center shadow-lg shadow-primary/20">
          <CircleDollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-text-primary tracking-tight font-display">
            FinTrack
          </h1>
          <p className="text-[10px] text-text-secondary/70 uppercase tracking-widest font-bold font-body">
            Precision Finance
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "group flex items-center gap-3 px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 font-body relative overflow-hidden",
                isActive 
                  ? "bg-primary text-white shadow-xl shadow-primary/20" 
                  : "text-text-secondary hover:bg-highlight hover:text-text-primary"
              )}
            >
              {/* Active Indicator Pulse */}
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-white/40 rounded-full my-3 ml-1" />
              )}
              
              <Icon 
                className={cn(
                  "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                  isActive ? "text-white" : "text-text-secondary/60 group-hover:text-primary"
                )} 
              />
              <span className="flex-1">{item.name}</span>
              
              {/* Hover Glow */}
              {!isActive && (
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-4 bg-surface/50 backdrop-blur-sm border-t border-border/10">
        <Link
          href="/settings"
          onClick={onItemClick}
          className={cn(
            "flex items-center gap-3 px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 font-body",
            pathname === "/settings" 
              ? "bg-primary text-white" 
              : "text-text-secondary hover:bg-highlight hover:text-text-primary"
          )}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
}
