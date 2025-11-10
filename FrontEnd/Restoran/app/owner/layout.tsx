"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { RestaurantProvider } from "@/contexts/restaurant-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserRole } from "@/types"
import RestaurantSelector from "@/components/owner/restaurant-selector"

const navigation = [
  { name: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
]

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, hasRole } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && (!user || !hasRole(UserRole.Owner))) {
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

  if (!user || !hasRole(UserRole.Owner)) {
    return null
  }

  return (
    <RestaurantProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/40 hidden md:block">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Owner Paneli</h2>
            <RestaurantSelector />
            <nav className="space-y-2 mt-6">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </RestaurantProvider>
  )
}
