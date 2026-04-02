"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for dashboard routes
 * Handles all errors in (dashboard) layout
 */
export default function DashboardError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to our monitoring service
    logger.error(error, {
      context: "dashboard_error_boundary",
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-text-primary">
            Something went wrong
          </h2>
          <p className="text-text-secondary">
            An error occurred while processing your request. Please try again.
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-4 overflow-auto rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
              {error.message}
            </pre>
          )}
        </div>
        <button
          onClick={reset}
          className="w-full rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
