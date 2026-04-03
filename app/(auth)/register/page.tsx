"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { register } from "@/actions/auth";
import Link from "next/link";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const {
    register: registerForm,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("email", data.email);
    formData.set("password", data.password);

    const result = await register(formData);

    if (result && "error" in result) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto grid max-w-275 gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden rounded-4xl bg-linear-to-br from-primary to-primary-container p-10 text-white shadow-ambient xl:block">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em]">
              FinTrack
            </div>
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.28em] text-white/70">
                Precision Wealth
              </p>
              <h1 className="text-4xl font-bold leading-tight">
                Create your account and start planning smarter.
              </h1>
              <p className="max-w-md text-base leading-7 text-white/80">
                Designed for modern finance, the FinTrack workspace keeps
                budgets, accounts, and recurring payments easy to manage.
              </p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-white/70">
                Security-first onboarding
              </p>
              <p className="mt-3 text-sm text-white/80">
                Your data is protected with secure authentication and sensible
                defaults.
              </p>
            </div>
          </div>
        </section>

        <div className="overflow-hidden rounded-4xl border border-border bg-surface shadow-ambient">
          <div className="bg-surface px-8 py-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Create account
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-text-primary">
                  Create account
                </h1>
                <p className="max-w-xl text-base leading-7 text-text-secondary">
                  Start tracking your finances with modern clarity and clean
                  workflows.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 px-8 py-8 bg-background"
          >
            {error && (
              <div className="rounded-3xl border border-accent-danger/20 bg-accent-danger/10 p-4 text-sm text-accent-danger">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-text-primary"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                {...registerForm("name")}
                className="w-full rounded-full border border-border-subtle bg-surface px-5 py-4 text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="John Doe"
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-accent-danger">
                  {errors.name.message}
                </p>
              )}
            </div>

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
                {...registerForm("email")}
                className="w-full rounded-full border border-border-subtle bg-surface px-5 py-4 text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="name@example.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-accent-danger">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-text-primary"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                {...registerForm("password")}
                className="w-full rounded-full border border-border-subtle bg-surface px-5 py-4 text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="At least 8 characters"
                disabled={loading}
              />
              {errors.password && (
                <p className="text-sm text-accent-danger">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-container disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="border-t border-border px-8 py-6 bg-surface">
            <p className="text-center text-sm text-text-secondary">
              Already have an account?{" "}
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
