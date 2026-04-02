import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/Toaster";

export const metadata: Metadata = {
  title: "FinTrack",
  description:
    "FinTrack — premium finance tracker for budgets, recurring payments, and group spending.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-text-primary">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
