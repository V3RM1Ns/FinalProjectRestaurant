import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/contexts/cart-context"
import { Navbar } from "@/components/navigation/navbar"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Restaurant Management System",
  description: "Modern restaurant management and ordering platform",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
