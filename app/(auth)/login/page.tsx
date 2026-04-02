"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { login } from "@/actions/auth";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.set("email", data.email);
    formData.set("password", data.password);

    const result = await login(formData);

    if (result && "error" in result) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto grid max-w-[1100px] gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden rounded-[32px] bg-gradient-to-br from-primary to-primary-container p-10 text-white shadow-ambient xl:block">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-3xl bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em]">
              FinTrack
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                The Precision Architect of Your Portfolio.
              </h1>
              <p className="max-w-lg text-base leading-8 text-white/85">
                Secure your financial life with thoughtfully designed
                dashboards, fast actions, and elegant account insights.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-white/70">
                Advanced Analytics
              </p>
              <p className="mt-4 text-sm text-white/80">
                Real-time spending signals and clear category performance.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                Current Market Index
              </p>
              <div className="mt-4 flex items-center gap-3">
                <p className="text-3xl font-bold">4,281.50</p>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                  +1.24%
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="rounded-[32px] border border-border bg-surface p-8 shadow-ambient">
          <div className="mb-8 space-y-4">
            <p className="text-sm uppercase tracking-[0.24em] text-text-secondary">
              Secure login
            </p>
            <h1 className="text-4xl font-bold text-text-primary">
              Welcome back
            </h1>
            <p className="text-text-secondary">
              Sign in to access your dashboard, budgets, and recurring plans.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-text-primary"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-primary hover:text-primary-container"
                >
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                {...register("password")}
                className="w-full rounded-3xl border border-border-subtle bg-background/80 px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter your password"
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
              className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-container disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 border-t border-border pt-6">
            <p className="text-center text-sm text-text-secondary">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary hover:text-primary-container"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
