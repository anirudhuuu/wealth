import type React from "react"
import type { Metadata } from "next"
import { AppLayoutClient } from "@/components/layout/app-layout-client"

export const metadata: Metadata = {
  title: "Ledgers - Expense Tracker",
  description: "Manage your ledgers and transactions",
}

export default function LedgersLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutClient>{children}</AppLayoutClient>
}
