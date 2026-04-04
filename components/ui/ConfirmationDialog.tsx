"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { Modal } from "./Modal";

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
  const variantStyles = {
    danger: {
      bg: "bg-accent-danger/10",
      text: "text-accent-danger",
      border: "border-accent-danger/20",
      accent: "bg-accent-danger",
      shadow: "shadow-accent-danger/20",
    },
    warning: {
      bg: "bg-accent-warning/10",
      text: "text-accent-warning",
      border: "border-accent-warning/20",
      accent: "bg-accent-warning",
      shadow: "shadow-accent-warning/20",
    },
    info: {
      bg: "bg-primary/10",
      text: "text-primary",
      border: "border-primary/20",
      accent: "bg-primary",
      shadow: "shadow-primary/20",
    },
  };

  const styles = variantStyles[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="sm"
      className="max-w-md"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <div
          className={`p-6 rounded-3xl ${styles.bg} ${styles.text} border ${styles.border} shadow-sm animate-in zoom-in-50 duration-500`}
        >
          <AlertCircle size={40} strokeWidth={2.5} />
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-black text-text-primary tracking-tight font-display">
            {title}
          </h3>
          <p className="text-base text-text-secondary leading-relaxed font-medium px-2">
            {description}
          </p>
        </div>

        <div className="pt-6 w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-4 border border-border/80 rounded-2xl text-[11px] font-black uppercase tracking-widest text-text-primary hover:bg-highlight transition-all active:scale-95 shadow-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-4 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl ${styles.accent} ${styles.shadow} hover:brightness-110`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
