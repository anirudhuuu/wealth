import { AppLayoutClient } from "@/components/layout/app-layout-client";
import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Dashboard - Expense Tracker",
  description: "View your financial overview",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
