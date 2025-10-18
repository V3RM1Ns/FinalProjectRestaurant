"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { AppUser, UserRole } from "@/types"
import { AuthService } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: AppUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string, phoneNumber?: string) => Promise<void>
  logout: () => void
  hasRole: (role: UserRole) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = AuthService.getUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.login(email, password)
      setUser(response.user)
      router.push(AuthService.getRedirectPath())
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (fullName: string, email: string, password: string, phoneNumber?: string) => {
    try {
      const response = await AuthService.register(fullName, email, password, phoneNumber)
      setUser(response.user)
      router.push(AuthService.getRedirectPath())
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
    router.push("/login")
  }

  const hasRole = (role: UserRole): boolean => {
    return user?.roles?.includes(role) ?? false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
