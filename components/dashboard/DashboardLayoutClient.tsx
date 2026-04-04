"use client";

import { ReactNode, useState, useEffect } from "react";
import { SidebarContent } from "./SidebarContent";
import { Menu, X, Bell, LogOut, Search, User, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface DashboardLayoutClientProps {
  children: ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function DashboardLayoutClient({ children, user }: DashboardLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    // Perform actual logout logic
    const response = await fetch("/api/auth/signout", { method: "POST" });
    if (response.ok) {
        window.location.href = "/login";
    }
  };

  const getPageTitle = (path: string) => {
    if (path.includes("/dashboard")) return "Overview";
    if (path.includes("/transactions")) return "Transactions";
    if (path.includes("/accounts")) return "Accounts";
    if (path.includes("/categories")) return "Categories";
    if (path.includes("/groups")) return "Group Expenses";
    if (path.includes("/recurring")) return "Recurring Deductions";
    if (path.includes("/budgets")) return "Budgets";
    if (path.includes("/reports")) return "Finance Reports";
    if (path.includes("/settings")) return "Settings";
    return "Dashboard";
  };

  return (
    <div className="flex min-h-screen bg-background font-body selection:bg-primary/10 selection:text-primary">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 hidden lg:block w-75 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-100 lg:hidden bg-black/40 backdrop-blur-sm transition-opacity duration-300 pointer-events-none opacity-0",
          isSidebarOpen && "opacity-100 pointer-events-auto"
        )}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Mobile Sidebar Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-100 w-80 lg:hidden transform transition-transform duration-300 ease-in-out -translate-x-full",
          isSidebarOpen && "translate-x-0"
        )}
      >
        <SidebarContent onItemClick={() => setIsSidebarOpen(false)} />
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary transition-colors lg:hidden rounded-xl hover:bg-highlight/50"
        >
          <X className="w-6 h-6" />
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-75 flex flex-col w-full overflow-hidden">
        {/* Top bar */}
        <header className="h-20 bg-surface/80 backdrop-blur-lg flex items-center justify-between px-4 lg:px-10 border-b border-border/10 sticky top-0 z-40 transition-all">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2.5 text-text-secondary hover:text-text-primary hover:bg-highlight/50 transition-all rounded-xl"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
               <h2 className="text-xl font-bold text-text-primary font-display tracking-tight leading-none">
                {getPageTitle(pathname)}
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                 <span className="text-[10px] uppercase font-bold text-text-secondary/50 tracking-wider">Live System</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            {/* Search - Desktop */}
            <div className="hidden lg:flex items-center bg-elevated/50 border border-border/30 rounded-2xl px-4 py-2 text-text-muted hover:border-primary/30 transition-all cursor-text gap-3 min-w-75">
              <Search className="w-4 h-4" />
              <span className="text-sm font-medium">Search for transactions...</span>
              <kbd className="ml-auto px-2 py-0.5 rounded-md bg-highlight text-[10px] font-bold border border-border/50">⌘K</kbd>
            </div>

            <div className="flex items-center gap-2 lg:gap-4 h-10 pr-1 border-r border-border/10">
                <button className="p-2.5 text-text-secondary/70 hover:text-text-primary hover:bg-highlight/50 transition-all rounded-xl relative group">
                  <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-tertiary border-2 border-surface rounded-full shadow-sm" />
                </button>
            </div>

            {/* User Dropdown Profile */}
            <div className="flex items-center gap-3 pl-1 group cursor-pointer">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-bold text-text-primary leading-none group-hover:text-primary transition-colors">
                  {user.name ?? "Account"}
                </p>
                <p className="text-[10px] font-semibold text-text-secondary/60 mt-1 uppercase tracking-tighter">
                   Professional Plan
                </p>
              </div>
              
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-linear-to-br from-primary to-primary-container p-0.5 shadow-xl shadow-primary/10 group-hover:scale-105 transition-all">
                  <div className="w-full h-full rounded-[14px] bg-surface flex items-center justify-center overflow-hidden">
                     {user.image ? (
                        <img src={user.image} alt="User" />
                     ) : (
                        <User className="w-6 h-6 text-primary" />
                     )}
                  </div>
                </div>
                <div className="lg:hidden absolute -bottom-1 -right-1 w-4 h-4 bg-secondary border-2 border-surface rounded-full shadow-sm" />
              </div>
              
              <button 
                onClick={() => setIsLogoutModalOpen(true)}
                className="hidden lg:flex p-2.5 text-text-secondary/70 hover:text-tertiary hover:bg-tertiary/5 transition-all rounded-xl"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
            
            {/* Mobile Sign out */}
            <button 
               onClick={() => setIsLogoutModalOpen(true)}
               className="lg:hidden p-2.5 text-tertiary hover:bg-tertiary/10 transition-all rounded-xl"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <section className="flex-1 p-4 lg:p-10 overflow-y-auto custom-scrollbar relative">
          <div className="max-w-[1800px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
          
          {/* Subtle Background Accent */}
          <div className="fixed -top-24 -right-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
          <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        </section>
      </main>

      <ConfirmationDialog
        isOpen={isLogoutModalOpen}
        title="Sign Out"
        description="Are you sure you want to log out? Your current session will be terminated."
        confirmText="Log Out"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
}
