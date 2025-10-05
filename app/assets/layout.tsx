import type React from "react"
import type { Metadata } from "next"
import { AppLayoutClient } from "@/components/layout/app-layout-client"

export const metadata: Metadata = {
  title: "Assets - Expense Tracker",
  description: "Track your investments and wealth",
}

export default function AssetsLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutClient>{children}</AppLayoutClient>
}
