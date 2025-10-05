import type React from "react"
import { getUser, getProfile } from "@/lib/auth"
import { redirect } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export async function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const user = await getUser()

  if (!user) {
    redirect("/sign-in")
  }

  if (requireAdmin) {
    const profile = await getProfile(user.id)
    if (!profile?.is_admin) {
      // Non-admin users get sandbox mode, no redirect needed
      // The components will handle showing sandbox data
    }
  }

  return <>{children}</>
}
