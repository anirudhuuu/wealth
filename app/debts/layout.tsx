import { AppLayout } from "@/components/layout/app-layout";
import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Debts & Loans - Wealth",
  description:
    "Manage your debts and loans with payoff strategies, payment scheduling, interest calculations, and progress tracking",
  openGraph: {
    title: "Debts & Loans - Wealth",
    description:
      "Manage your debts and loans with payoff strategies, payment scheduling, interest calculations, and progress tracking",
  },
};

export default function DebtsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
