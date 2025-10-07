import { AppLayoutClient } from "@/components/layout/app-layout-client";
import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Settings - Wealth",
  description: "Manage your account settings",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
