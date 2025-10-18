"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { UserRole } from "@/types"

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, hasRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || !hasRole(UserRole.Delivery))) {
      router.push("/")
    }
  }, [user, isLoading, hasRole, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user || !hasRole(UserRole.Delivery)) {
    return null
  }

  return <>{children}</>
}
