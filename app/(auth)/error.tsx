"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for auth routes
 * Handles all errors in (auth) layout
 */
export default function AuthError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to our monitoring service
    logger.error(error, {
      context: "auth_error_boundary",
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-text-primary">
            Authentication Error
          </h2>
          <p className="text-text-secondary">
            An error occurred during authentication. Please try again or contact
            support.
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-4 overflow-auto rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
              {error.message}
            </pre>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
          <a
            href="/login"
            className="flex-1 rounded-lg border border-primary px-4 py-2 text-center text-primary hover:bg-primary/5 transition-colors"
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
