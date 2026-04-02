"use client";

import React from "react";
import { AlertCircle, X } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmationDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      bg: "bg-accent-danger/10",
      text: "text-accent-danger",
      border: "border-accent-danger/20",
      button: "bg-accent-danger hover:brightness-110 shadow-lg",
    },
    warning: {
      bg: "bg-accent-warning/10",
      text: "text-accent-warning",
      border: "border-accent-warning/20",
      button: "bg-accent-warning hover:brightness-110 shadow-lg",
    },
    info: {
      bg: "bg-primary/10",
      text: "text-primary",
      border: "border-primary/20",
      button: "bg-primary hover:brightness-110 shadow-lg",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-border/50">
        <div className="p-7">
          <div className="flex items-center justify-between mb-5">
            <div
              className={`p-4 rounded-2xl ${styles.bg} ${styles.text} border ${styles.border}`}
            >
              <AlertCircle size={28} />
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-highlight rounded-xl text-text-muted transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <h3 className="text-2xl font-bold text-text-primary mb-3 font-display">
            {title}
          </h3>
          <p className="text-base text-text-secondary leading-relaxed opacity-90">
            {description}
          </p>

          <div className="mt-10 flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 px-5 py-4 border border-border-subtle rounded-2xl text-text-primary hover:bg-elevated transition-all font-bold active:scale-95"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-5 py-4 text-white rounded-2xl font-bold transition-all active:scale-95 ${styles.button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
