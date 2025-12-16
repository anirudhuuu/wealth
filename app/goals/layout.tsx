import { AppLayout } from "@/components/layout/app-layout";
import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Financial Goals - Wealth",
  description:
    "Set and track your financial goals, monitor savings progress, and achieve your targets with milestone tracking",
  openGraph: {
    title: "Financial Goals - Wealth",
    description:
      "Set and track your financial goals, monitor savings progress, and achieve your targets with milestone tracking",
  },
};

export default function GoalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
