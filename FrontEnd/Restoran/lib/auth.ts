import { type AppUser, type AuthResponse, UserRole } from "@/types"

export class AuthService {
  private static TOKEN_KEY = "auth_token"
  private static USER_KEY = "auth_user"

  private static MOCK_USERS = [
    {
      email: "admin@gmail.com",
      password: "admin123",
      user: {
        id: "admin-1",
        fullName: "Admin User",
        email: "admin@gmail.com",
        phoneNumber: "+90 555 000 0001",
        roles: [UserRole.Admin],
        isActive: true,
      },
    },
    {
      email: "owner@gmail.com",
      password: "owner123",
      user: {
        id: "owner-1",
        fullName: "Restaurant Owner",
        email: "owner@gmail.com",
        phoneNumber: "+90 555 000 0002",
        roles: [UserRole.Owner],
        isActive: true,
        restaurantId: "1",
      },
    },
    {
      email: "employee@gmail.com",
      password: "employee123",
      user: {
        id: "employee-1",
        fullName: "Restaurant Employee",
        email: "employee@gmail.com",
        phoneNumber: "+90 555 000 0003",
        roles: [UserRole.Employee],
        isActive: true,
        restaurantId: "1",
      },
    },
    {
      email: "customer@gmail.com",
      password: "customer123",
      user: {
        id: "customer-1",
        fullName: "Customer User",
        email: "customer@gmail.com",
        phoneNumber: "+90 555 000 0004",
        roles: [UserRole.Customer],
        isActive: true,
      },
    },
    {
      email: "delivery@gmail.com",
      password: "delivery123",
      user: {
        id: "delivery-1",
        fullName: "Delivery Person",
        email: "delivery@gmail.com",
        phoneNumber: "+90 555 000 0005",
        roles: [UserRole.Delivery],
        isActive: true,
      },
    },
  ]

  static async login(email: string, password: string): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockUser = this.MOCK_USERS.find((u) => u.email === email && u.password === password)

    if (!mockUser) {
      throw new Error("Login failed")
    }

    const token = `mock-jwt-token-${mockUser.user.id}`
    const authResponse: AuthResponse = {
      token,
      user: mockUser.user,
    }

    this.setToken(authResponse.token)
    this.setUser(authResponse.user)
    return authResponse
  }

  static async register(
    fullName: string,
    email: string,
    password: string,
    phoneNumber?: string,
  ): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Check if user already exists
    const existingUser = this.MOCK_USERS.find((u) => u.email === email)
    if (existingUser) {
      throw new Error("User already exists")
    }

    // Create new user with Customer role by default
    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      fullName,
      email,
      phoneNumber: phoneNumber || "",
      roles: [UserRole.Customer],
      isActive: true,
    }

    const token = `mock-jwt-token-${newUser.id}`
    const authResponse: AuthResponse = {
      token,
      user: newUser,
    }

    // Add to mock users list (in-memory only)
    this.MOCK_USERS.push({
      email,
      password,
      user: newUser,
    })

    this.setToken(authResponse.token)
    this.setUser(authResponse.user)
    return authResponse
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
