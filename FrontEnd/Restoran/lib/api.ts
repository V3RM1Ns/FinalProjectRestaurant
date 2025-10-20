import { AuthService } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export class ApiClient {
  private static getHeaders(): HeadersInit {
    const token = AuthService.getToken()
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))

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
