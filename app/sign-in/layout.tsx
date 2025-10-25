import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Sign In - Wealth",
  description:
    "Sign in to Wealth - Track your expenses, manage investments, and build wealth with our comprehensive financial management tool",
  openGraph: {
    title: "Sign In - Wealth",
    description:
      "Sign in to Wealth - Track your expenses, manage investments, and build wealth with our comprehensive financial management tool",
  },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
