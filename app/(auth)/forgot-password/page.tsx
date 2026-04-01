"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async () => {
    setError(null);
    setLoading(true);

    // TODO: Implement password reset email sending
    // For now, just simulate success
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface rounded-xl shadow-ambient p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary/15 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2 font-display">
            Check your email
          </h2>
          <p className="text-text-secondary/70 mb-6 font-body">
            We&apos;ve sent a password reset link to your email address.
          </p>
          <Link
            href="/login"
            className="inline-block py-3 px-6 bg-gradient-to-r from-primary to-primary-container text-white font-semibold rounded-lg font-display hover:opacity-95 transition-all shadow-ambient"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-[32px] border border-border bg-surface shadow-ambient">
          <div className="bg-gradient-to-r from-primary to-primary-container px-8 py-10 text-white">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 rounded-3xl bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em]">
                FinTrack
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Reset password</h1>
                <p className="text-sm text-white/80">
                  Enter your email to receive a reset link.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 px-8 py-8 bg-surface"
          >
            {error && (
              <div className="rounded-3xl border border-accent-danger/20 bg-accent-danger/10 p-4 text-sm text-accent-danger">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-text-primary"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full rounded-3xl border border-border-subtle bg-background/80 px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="name@example.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-accent-danger">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-container disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="border-t border-border px-8 py-6">
            <p className="text-center text-sm text-text-secondary">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:text-primary-container"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
