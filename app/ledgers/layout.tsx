import { AppLayout } from "@/components/layout/app-layout";
import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Ledgers - Wealth",
  description:
    "Manage your financial ledgers, track payments and monitor transactions across all your budget books",
  openGraph: {
    title: "Ledgers - Wealth",
    description:
      "Manage your financial ledgers, track payments and monitor transactions across all your budget books",
  },
};

export default function LedgersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
