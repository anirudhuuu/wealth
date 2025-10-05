import { AppLayoutClient } from "@/components/layout/app-layout-client";
import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Ledgers - Expense Tracker",
  description: "Manage your ledgers and transactions",
};

export default function LedgersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
