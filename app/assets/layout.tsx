import { AppLayout } from "@/components/layout/app-layout";
import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Savings & Investments - Wealth",
  description:
    "Manage your investment portfolio, track assets, monitor returns, and analyze your wealth growth across stocks, mutual funds, FDs, and more",
  openGraph: {
    title: "Savings & Investments - Wealth",
    description:
      "Manage your investment portfolio, track assets, monitor returns, and analyze your wealth growth across stocks, mutual funds, FDs, and more",
  },
};

export default function AssetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
