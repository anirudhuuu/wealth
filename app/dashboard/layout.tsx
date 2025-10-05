import type React from "react"
import type { Metadata } from "next"
import { AppLayoutClient } from "@/components/layout/app-layout-client"

export const metadata: Metadata = {
  title: "Dashboard - Expense Tracker",
  description: "View your financial overview",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutClient>{children}</AppLayoutClient>
}
