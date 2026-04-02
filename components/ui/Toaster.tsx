"use client";

import React from "react";
import { useToastStore, ToastType } from "@/lib/store/useToast";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  AlertTriangle,
} from "lucide-react";

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="text-accent-success w-5 h-5" />,
  error: <AlertCircle className="text-accent-danger w-5 h-5" />,
  info: <Info className="text-primary w-5 h-5" />,
  warning: <AlertTriangle className="text-accent-warning w-5 h-5" />,
};

const backgrounds: Record<ToastType, string> = {
  success: "bg-accent-success/10 border-accent-success/20",
  error: "bg-accent-danger/10 border-accent-danger/20",
  info: "bg-primary/10 border-primary/20",
  warning: "bg-accent-warning/10 border-accent-warning/20",
};

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-200 flex flex-col gap-3 pointer-events-none w-full max-w-sm sm:w-auto">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`pointer-events-auto flex items-center gap-3 bg-surface border p-4 rounded-[1.25rem] shadow-2xl min-w-70 sm:min-w-85 group transition-all animate-in slide-in-from-bottom-2 fade-in duration-300 ${backgrounds[t.type]}`}
        >
          <div className="shrink-0">{icons[t.type]}</div>
          <p className="flex-1 text-sm font-bold text-text-primary">
            {t.message}
          </p>
          <button
            onClick={() => removeToast(t.id)}
            className="p-1.5 hover:bg-black/5 rounded-xl text-text-muted transition-colors sm:opacity-0 sm:group-hover:opacity-100"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
