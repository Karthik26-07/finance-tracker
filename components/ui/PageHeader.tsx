"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showAccent?: boolean;
  children?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  subtitle, 
  showAccent = true, 
  children 
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-start gap-4 sm:gap-6">
        {showAccent && (
          <div className="w-1.5 h-12 bg-primary rounded-full hidden sm:block shadow-sm shadow-primary/20 shrink-0" />
        )}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-text-primary font-display leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-text-secondary text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] font-mono opacity-70">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {children && (
        <div className="flex flex-wrap items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
