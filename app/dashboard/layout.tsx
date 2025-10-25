import { AppLayout } from "@/components/layout/app-layout";
import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Summary - Wealth",
  description:
    "Complete financial overview - track your income, expenses, savings, investments, and portfolio performance all in one place",
  openGraph: {
    title: "Summary - Wealth",
    description:
      "Complete financial overview - track your income, expenses, savings, investments, and portfolio performance all in one place",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
