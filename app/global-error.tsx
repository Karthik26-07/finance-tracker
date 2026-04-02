"use client";

import { useEffect } from "react";
import Link from "next/link";
import { logger } from "@/lib/logger";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for entire app
 * Catches unhandled errors at app level
 */
export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to our monitoring service
    logger.error(error, {
      context: "global_error_boundary",
      digest: error.digest,
      severity: "critical",
    });
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="w-full max-w-md space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-red-600">
                Application Error
              </h1>
              <p className="text-text-secondary">
                A critical error occurred. Our team has been notified.
              </p>
              {process.env.NODE_ENV === "development" && (
                <pre className="mt-4 overflow-auto rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                  {error.message}
                  {"\n\n"}
                  {error.stack}
                </pre>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={reset}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 transition-colors"
              >
                Try again
              </button>
              <Link
                href="/"
                className="flex-1 rounded-lg border border-primary px-4 py-2 text-center text-primary hover:bg-primary/5 transition-colors"
              >
                Go home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
