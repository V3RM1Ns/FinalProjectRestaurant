import { AuthService } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
export const API_SERVER_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5000"

export class ApiClient {
  static get baseURL() {
    return API_BASE_URL
  }

  static get serverURL() {
    return API_SERVER_URL
  }

  private static getHeaders(): HeadersInit {
    const token = AuthService.getToken()
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private static getHeadersWithoutContentType(): HeadersInit {
    const token = AuthService.getToken()
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))

      console.error("API Error Response:", errorData)
      console.error("Response status:", response.status)

      // Backend ModelState hatalarını handle et
      if (errorData.errors) {
        const errorMessages = Object.entries(errorData.errors)
          .map(([field, messages]: [string, any]) => {
            const msgArray = Array.isArray(messages) ? messages : [messages]
            return `${field}: ${msgArray.join(", ")}`
          })
          .join("\n")
        throw new Error(errorMessages)
      }

      // Backend'den gelen title ve errors alanlarını kontrol et
      if (errorData.title) {
        throw new Error(errorData.title)
      }

      throw new Error(errorData.message || errorData.Message || `API Error: ${response.statusText}`)
    }

    // 204 No Content durumu için boş obje döndür
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  static async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: this.getHeaders(),
    })

    return this.handleResponse<T>(response)
  }

  static async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    return this.handleResponse<T>(response)
  }

  static async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    return this.handleResponse<T>(response)
  }

  static async postFormData<T>(endpoint: string, data: FormData): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: this.getHeadersWithoutContentType(),
      body: data,
    })

    return this.handleResponse<T>(response)
  }

  static async putFormData<T>(endpoint: string, data: FormData): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: this.getHeadersWithoutContentType(),
      body: data,
    })

    return this.handleResponse<T>(response)
  }

  static async patch<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    return this.handleResponse<T>(response)
  }

  static async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    })

    return this.handleResponse<T>(response)
  }
}

// Restaurant API
export const restaurantApi = {
  getAll: () => ApiClient.get<any[]>("/Restaurant"),
  getById: (id: string) => ApiClient.get<any>(`/Restaurant/${id}`),
  create: (data: any) => ApiClient.post<any>("/Restaurant", data),
  update: (id: string, data: any) => ApiClient.put<any>(`/Restaurant/${id}`, data),
  delete: (id: string) => ApiClient.delete<any>(`/Restaurant/${id}`),
}

// Menu API
export const menuApi = {
  getByRestaurant: (restaurantId: string) => ApiClient.get<any[]>(`/Menu/restaurant/${restaurantId}`),
  getById: (id: string) => ApiClient.get<any>(`/Menu/${id}`),
  create: (data: any) => ApiClient.post<any>("/Menu", data),
  update: (id: string, data: any) => ApiClient.put<any>(`/Menu/${id}`, data),
  delete: (id: string) => ApiClient.delete<any>(`/Menu/${id}`),
}

// Order API
export const orderApi = {
  getAll: () => ApiClient.get<any[]>("/Order"),
  getById: (id: string) => ApiClient.get<any>(`/Order/${id}`),
  getByCustomer: (customerId: string) => ApiClient.get<any[]>(`/Order/customer/${customerId}`),
  create: (data: any) => ApiClient.post<any>("/Order", data),
  update: (id: string, data: any) => ApiClient.put<any>(`/Order/${id}`, data),
  updateStatus: (id: string, status: string) => ApiClient.patch<any>(`/Order/${id}/status`, { status }),
}

// Reservation API
export const reservationApi = {
  getAll: () => ApiClient.get<any[]>("/Reservation"),
  getById: (id: string) => ApiClient.get<any>(`/Reservation/${id}`),
  getByCustomer: (customerId: string) => ApiClient.get<any[]>(`/Reservation/customer/${customerId}`),
  create: (data: any) => ApiClient.post<any>("/Reservation", data),
  update: (id: string, data: any) => ApiClient.put<any>(`/Reservation/${id}`, data),
  cancel: (id: string) => ApiClient.delete<any>(`/Reservation/${id}`),
}

// Employee API
export const employeeApi = {
  getByRestaurant: (restaurantId: string) => ApiClient.get<any[]>(`/Restaurant/${restaurantId}/employees`),
  create: (restaurantId: string, data: any) => ApiClient.post<any>(`/Restaurant/${restaurantId}/employees`, data),
  update: (restaurantId: string, employeeId: string, data: any) => ApiClient.put<any>(`/Restaurant/${restaurantId}/employees/${employeeId}`, data),
  delete: (restaurantId: string, employeeId: string) => ApiClient.delete<any>(`/Restaurant/${restaurantId}/employees/${employeeId}`),
}

// Job Application API
export const jobApplicationApi = {
  getByRestaurant: (restaurantId: string) => ApiClient.get<any[]>(`/JobApplication/restaurant/${restaurantId}`),
  getById: (id: string) => ApiClient.get<any>(`/JobApplication/${id}`),
  create: (data: FormData) => ApiClient.postFormData<any>('/JobApplication', data),
  accept: (id: string, interviewDate: string) => ApiClient.patch<any>(`/JobApplication/${id}/accept`, { interviewDate }),
  reject: (id: string, reason?: string) => ApiClient.patch<any>(`/JobApplication/${id}/reject`, { reason }),
}

// Job Posting API
export const jobPostingApi = {
  getAll: () => ApiClient.get<any[]>('/JobPosting'),
  getByRestaurant: (restaurantId: string) => ApiClient.get<any[]>(`/JobPosting/restaurant/${restaurantId}`),
  getById: (id: string) => ApiClient.get<any>(`/JobPosting/${id}`),
  getActive: () => ApiClient.get<any[]>('/JobPosting/active'),
  create: (data: any) => ApiClient.post<any>('/JobPosting', data),
  update: (id: string, data: any) => ApiClient.put<any>(`/JobPosting/${id}`, data),
  delete: (id: string) => ApiClient.delete<any>(`/JobPosting/${id}`),
}

// Review API
export const reviewApi = {
  getByRestaurant: (restaurantId: string) => ApiClient.get<any[]>(`/Review/restaurant/${restaurantId}`),
  getById: (id: string) => ApiClient.get<any>(`/Review/${id}`),
  approve: (id: string) => ApiClient.patch<any>(`/Review/${id}/approve`, {}),
  reject: (id: string) => ApiClient.patch<any>(`/Review/${id}/reject`, {}),
  respond: (id: string, response: string) => ApiClient.patch<any>(`/Review/${id}/respond`, { response }),

  // Admin endpoints
  admin: {
    getAll: (pageNumber: number = 1, pageSize: number = 10) =>
      ApiClient.get<any>(`/Admin/reviews?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    getPending: (pageNumber: number = 1, pageSize: number = 10) =>
      ApiClient.get<any>(`/Admin/reviews/pending?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    getReported: (pageNumber: number = 1, pageSize: number = 10) =>
      ApiClient.get<any>(`/Admin/reviews/reported?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    getById: (reviewId: string) => ApiClient.get<any>(`/Admin/reviews/${reviewId}`),
    approve: (reviewId: string) => ApiClient.post<any>(`/Admin/reviews/${reviewId}/approve`, {}),
    reject: (reviewId: string, reason: string) => ApiClient.post<any>(`/Admin/reviews/${reviewId}/reject`, { reason }),
    delete: (reviewId: string) => ApiClient.delete<any>(`/Admin/reviews/${reviewId}`),
  },
}

// Table API
export const tableApi = {
  getByRestaurant: (restaurantId: string) => ApiClient.get<any[]>(`/Table/restaurant/${restaurantId}`),
  getById: (id: string) => ApiClient.get<any>(`/Table/${id}`),
  create: (data: any) => ApiClient.post<any>("/Table", data),
  update: (id: string, data: any) => ApiClient.put<any>(`/Table/${id}`, data),
}

// Loyalty API
export const loyaltyApi = {
  // Admin endpoints
  admin: {
    generateCode: (data: { pointValue: number; description?: string; maxUses?: number; expiryDate?: string; restaurantId?: string }) =>
      ApiClient.post<any>('/Loyalty/admin/codes', data),
    getAllCodes: () => ApiClient.get<any[]>('/Loyalty/admin/codes'),
    getCodeById: (codeId: string) => ApiClient.get<any>(`/Loyalty/admin/codes/${codeId}`),
    deactivateCode: (codeId: string) => ApiClient.patch<any>(`/Loyalty/admin/codes/${codeId}/deactivate`, {}),
  },
  // Customer endpoints
  customer: {
    redeemCode: (code: string) => ApiClient.post<any>('/Loyalty/customer/redeem-code', { code }),
    getBalance: () => ApiClient.get<any[]>('/Loyalty/customer/balance'),
    getHistory: (restaurantId?: string) => ApiClient.get<any[]>(`/Loyalty/customer/history${restaurantId ? `?restaurantId=${restaurantId}` : ''}`),
    redeemReward: (rewardId: string) => ApiClient.post<any>('/Loyalty/customer/redeem-reward', { rewardId }),
    getRedemptions: () => ApiClient.get<any[]>('/Loyalty/customer/redemptions'),
    getRedemptionById: (redemptionId: string) => ApiClient.get<any>(`/Loyalty/customer/redemptions/${redemptionId}`),
  },
  // Owner endpoints
  owner: {
    createReward: (data: any) => ApiClient.post<any>('/Loyalty/owner/rewards', data),
    updateReward: (rewardId: string, data: any) => ApiClient.put<any>(`/Loyalty/owner/rewards/${rewardId}`, data),
    deleteReward: (rewardId: string) => ApiClient.delete<any>(`/Loyalty/owner/rewards/${rewardId}`),
  },
  // Public endpoints
  getRestaurantRewards: (restaurantId: string) => ApiClient.get<any[]>(`/Loyalty/restaurants/${restaurantId}/rewards`),
  getRewardById: (rewardId: string) => ApiClient.get<any>(`/Loyalty/rewards/${rewardId}`),
}

// Default export of ApiClient as 'api' for convenience
export const api = ApiClient

// Admin API
export const adminApi = {
  // User Management
  getUsers: (pageNumber: number = 1, pageSize: number = 10) =>
    ApiClient.get<any>(`/Admin/users?pageNumber=${pageNumber}&pageSize=${pageSize}`),
  toggleUserStatus: (userId: string) =>
    ApiClient.post<any>(`/Admin/users/${userId}/toggle-status`, {}),
  getUserRoles: (userId: string) =>
    ApiClient.get<{ roles: string[] }>(`/Admin/users/${userId}/roles`),
  getAllRoles: () =>
    ApiClient.get<{ roles: string[] }>(`/Admin/roles`),
  addRoleToUser: (userId: string, role: string) =>
    ApiClient.post<any>(`/Admin/users/${userId}/roles`, { Role: role }),
  removeRoleFromUser: (userId: string, role: string) =>
    ApiClient.delete<any>(`/Admin/users/${userId}/roles/${role}`),
  
  // Restaurant Management
  getRestaurants: (pageNumber: number = 1, pageSize: number = 10) =>
    ApiClient.get<any>(`/Admin/restaurants?pageNumber=${pageNumber}&pageSize=${pageSize}`),
  getRestaurantById: (restaurantId: string) =>
    ApiClient.get<any>(`/Admin/restaurants/${restaurantId}`),
  updateRestaurant: (restaurantId: string, data: FormData) =>
    ApiClient.putFormData<any>(`/Admin/restaurants/${restaurantId}`, data),
  toggleRestaurantStatus: (restaurantId: string) =>
    ApiClient.post<any>(`/Admin/restaurants/${restaurantId}/toggle-status`, {}),
  getAllRestaurantCategories: () =>
    ApiClient.get<{ categories: string[] }>(`/Admin/restaurants/categories`),
  updateRestaurantCategory: (restaurantId: string, categoryId: number) =>
    ApiClient.post<any>(`/Admin/restaurants/${restaurantId}/category`, { categoryId }),
}
