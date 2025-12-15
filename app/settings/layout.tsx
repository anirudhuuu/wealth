import { AppLayout } from "@/components/layout/app-layout";
import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Settings - Wealth",
  description:
    "Manage your account settings and preferences for Wealth personal finance manager",
  openGraph: {
    title: "Settings - Wealth",
    description:
      "Manage your account settings and preferences for Wealth personal finance manager",
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
