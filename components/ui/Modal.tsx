"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-6xl",
  full: "max-w-[calc(100vw-2rem)]",
};

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  className = "",
  showCloseButton = true,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className={`relative w-full ${sizeClasses[size]} bg-surface rounded-4xl sm:rounded-[2.5rem] border border-border/40 shadow-ambient animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-h-full flex flex-col overflow-hidden ${className}`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 sm:p-8 pb-4 shrink-0">
            <div className="flex-1">
              {title && (
                <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight font-display">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-text-secondary mt-1 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-text-muted hover:text-text-primary hover:bg-highlight/50 rounded-xl transition-all active:scale-95"
                title="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 pt-2">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
