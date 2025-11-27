"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ShoppingCart, User, LogOut, MapPin } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { NotificationCenter } from "@/components/notifications/notification-center"

export function Navbar() {
  const { user, logout } = useAuth()
  const { items } = useCart()
  const cartItemCount = items.length

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">RestaurantHub</span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/restaurants">
              <Button variant="ghost">Restoranlar</Button>
            </Link>
            {user && (
              <Link href="/customer/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <NotificationCenter />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />

                  {user.role === "Owner" && (
                    <DropdownMenuItem asChild>
                      <Link href="/owner/dashboard">Owner Paneli</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === "Employee" && (
                    <DropdownMenuItem asChild>
                      <Link href="/employee/dashboard">Çalışan Paneli</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === "Admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard">Admin Paneli</Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profilim</Link>
                  </DropdownMenuItem>
                  {user.role === "Customer" && (
                    <DropdownMenuItem asChild>
                      <Link href="/customer/applications">Başvurularım</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/customer/orders">Siparişlerim</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost">Giriş Yap</Button>
              </Link>
              <Link href="/register">
                <Button>Kayıt Ol</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
