import { type AppUser, type AuthResponse, UserRole } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export class AuthService {
  private static TOKEN_KEY = "auth_token"
  private static USER_KEY = "auth_user"

  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/Account/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Email: email, Password: password }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Login error response:", errorText)

        try {
          const error = JSON.parse(errorText)
          // E-posta doğrulama hatası kontrolü
          if (error.requiresEmailVerification || error.RequiresEmailVerification) {
            const verificationError = new Error(error.message || error.Message || "E-posta doğrulaması gerekli") as any
            verificationError.requiresEmailVerification = true
            throw verificationError
          }
          throw new Error(error.message || error.Message || "Login failed")
        } catch (e: any) {
          if (e.requiresEmailVerification) {
            throw e
          }
          throw new Error("Login failed")
        }
      }

      const data = await response.json()

      // Backend'den gelen response yapısı: { message, token, user: { id, userName, email, firstName, lastName, roles } }
      const user: AppUser = {
        id: data.user.id,
        fullName: data.user.userName || data.user.email,
        email: data.user.email,
        phoneNumber: data.user.phoneNumber || "",
        roles: data.user.roles?.map((role: string) => role as UserRole) || [UserRole.Customer],
        isActive: true,
      }

      const authResponse: AuthResponse = {
        token: data.token,
        user,
      }

      this.setToken(authResponse.token)
      this.setUser(authResponse.user)
      return authResponse
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  static async register(
    fullName: string,
    email: string,
    password: string,
    phoneNumber?: string,
    address?: string,
  ): Promise<AuthResponse> {
    try {
      const requestBody = {
        FullName: fullName,
        Email: email,
        Password: password,
        ConfirmPassword: password,
        Phone: phoneNumber || "",
        Address: address || "",
      }

      console.log("Register request:", requestBody)

      const response = await fetch(`${API_BASE_URL}/Account/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("Register response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Register error response:", errorText)

        try {
          const error = JSON.parse(errorText)
          throw new Error(error.message || error.title || "Registration failed")
        } catch (e) {
          throw new Error(errorText || "Registration failed")
        }
      }

      const data = await response.json()
      console.log("Register success response:", data)

      // Backend'den gelen response yapısı: { message, token, user: { id, userName, email, firstName, lastName } }
      const user: AppUser = {
        id: data.user.id,
        fullName: data.user.userName || fullName,
        email: data.user.email,
        phoneNumber: phoneNumber || "",
        roles: [UserRole.Customer], // Yeni kullanıcı default olarak Customer
        isActive: true,
      }

      const authResponse: AuthResponse = {
        token: data.token,
        user,
      }

      this.setToken(authResponse.token)
      this.setUser(authResponse.user)
      return authResponse
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  static logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY)
      localStorage.removeItem(this.USER_KEY)
    }
  }

  static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.TOKEN_KEY)
    }
    return null
  }

  static setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.TOKEN_KEY, token)
    }
  }

  static getUser(): AppUser | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem(this.USER_KEY)
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  }

  static setUser(user: AppUser): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user))
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getToken()
  }

  static hasRole(role: UserRole): boolean {
    const user = this.getUser()
    return user?.roles?.includes(role) ?? false
  }

  static getPrimaryRole(): UserRole | null {
    const user = this.getUser()
    if (!user?.roles || user.roles.length === 0) return null

    const rolePriority = [UserRole.Admin, UserRole.Owner, UserRole.Employee, UserRole.Delivery, UserRole.Customer]

    for (const role of rolePriority) {
      if (user.roles.includes(role)) return role
    }

    return user.roles[0]
  }

  static getRedirectPath(): string {
    const role = this.getPrimaryRole()

    switch (role) {
      case UserRole.Admin:
        return "/admin/dashboard"
      case UserRole.Owner:
        return "/owner/dashboard"
      case UserRole.Employee:
        return "/employee/dashboard"
      case UserRole.Delivery:
        return "/delivery/orders"
      case UserRole.Customer:
      default:
        return "/customer"
    }
  }
}
