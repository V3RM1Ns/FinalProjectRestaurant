import { ApiClient } from "./api"

export interface Reservation {
  id: string
  restaurantId: string
  restaurantName: string
  customerId: string
  customerName: string
  customerEmail: string
  tableId: string
  tableNumber: number
  reservationDate: string
  numberOfGuests: number
  specialRequests?: string
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed" | "NoShow"
  createdAt: string
}

export interface MenuItem {
  id: string
  menuId: string
  name: string
  description?: string
  price: number
  category?: string
  imageUrl?: string
  isAvailable: boolean
  preparationTime?: number
}

export interface Table {
  id: string
  restaurantId: string
  tableNumber: number
  capacity: number
  location?: string
  status: "Available" | "Occupied" | "Reserved" | "OutOfService"
}

export interface Menu {
  id: string
  restaurantId: string
  name: string
  description?: string
  isActive?: boolean
  createdAt?: string
  menuItems?: MenuItem[]
}

export interface PaginatedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export const employeeApi = {
  // Reservation Management
  reservations: {
    getAll: (restaurantId: string, pageNumber = 1, pageSize = 10) =>
      ApiClient.get<PaginatedResult<Reservation>>(
        `/Employee/restaurants/${restaurantId}/reservations?pageNumber=${pageNumber}&pageSize=${pageSize}`
      ),

    getByStatus: (restaurantId: string, status: string, pageNumber = 1, pageSize = 10) =>
      ApiClient.get<PaginatedResult<Reservation>>(
        `/Employee/restaurants/${restaurantId}/reservations/status/${status}?pageNumber=${pageNumber}&pageSize=${pageSize}`
      ),

    getById: (reservationId: string) =>
      ApiClient.get<Reservation>(`/Employee/reservations/${reservationId}`),

    updateStatus: (reservationId: string, newStatus: string) =>
      ApiClient.put<Reservation>(`/Employee/reservations/${reservationId}/status`, newStatus),

    getActiveCount: (restaurantId: string) =>
      ApiClient.get<{ activeReservations: number }>(`/Employee/restaurants/${restaurantId}/reservations/active/count`),

    getToday: (restaurantId: string) =>
      ApiClient.get<Reservation[]>(`/Employee/restaurants/${restaurantId}/reservations/today`),
  },

  // Menu Management
  menus: {
    getAll: (restaurantId: string) =>
      ApiClient.get<Menu[]>(`/Employee/restaurants/${restaurantId}/menus`),

    getById: (menuId: string) =>
      ApiClient.get<Menu>(`/Employee/menus/${menuId}`),

    create: (restaurantId: string, data: { name: string; description?: string; isActive: boolean }) =>
      ApiClient.post<Menu>(`/Employee/restaurants/${restaurantId}/menus`, data),

    update: (menuId: string, data: { name: string; description?: string; isActive: boolean }) =>
      ApiClient.put<Menu>(`/Employee/menus/${menuId}`, data),

    delete: (menuId: string) =>
      ApiClient.delete(`/Employee/menus/${menuId}`),
  },

  // Menu Items Management
  menuItems: {
    getAll: (menuId: string, pageNumber = 1, pageSize = 20) =>
      ApiClient.get<PaginatedResult<MenuItem>>(
        `/Employee/menus/${menuId}/items?pageNumber=${pageNumber}&pageSize=${pageSize}`
      ),

    getById: (menuItemId: string) =>
      ApiClient.get<MenuItem>(`/Employee/menu-items/${menuItemId}`),

    create: (menuId: string, data: Partial<MenuItem>) =>
      ApiClient.post<MenuItem>(`/Employee/menus/${menuId}/items`, data),

    update: (menuItemId: string, data: Partial<MenuItem>) =>
      ApiClient.put<MenuItem>(`/Employee/menu-items/${menuItemId}`, data),

    delete: (menuItemId: string) =>
      ApiClient.delete(`/Employee/menu-items/${menuItemId}`),

    updateAvailability: (menuItemId: string, isAvailable: boolean) =>
      ApiClient.patch(`/Employee/menu-items/${menuItemId}/availability`, isAvailable),

    getCount: (restaurantId: string) =>
      ApiClient.get<{ count: number }>(`/Employee/restaurants/${restaurantId}/menu-items/count`),

    uploadImage: async (file: File): Promise<string> => {
      const formData = new FormData()
      formData.append('file', file)
      
      // AuthService'den token al
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      
      if (!token) {
        throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.')
      }
      
      console.log('Uploading with token:', token ? 'Token found' : 'No token')
      
      const response = await fetch(`${ApiClient.baseURL}/Employee/menu-items/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.')
        }
        const errorData = await response.json().catch(() => ({ message: 'Resim yüklenemedi' }))
        throw new Error(errorData.message || errorData.Message || 'Resim yüklenemedi')
      }
      
      const data = await response.json()
      console.log('Upload response:', data)
      return data.imageUrl || data.ImageUrl || data.url || data.path
    },
  },

  // Table Management
  tables: {
    getAll: (restaurantId: string) =>
      ApiClient.get<Table[]>(`/Employee/restaurants/${restaurantId}/tables`),

    getById: (tableId: string) =>
      ApiClient.get<Table>(`/Employee/tables/${tableId}`),

    create: (restaurantId: string, data: { tableNumber: number; capacity: number; location: string }) =>
      ApiClient.post<Table>(`/Employee/restaurants/${restaurantId}/tables`, data),

    update: (tableId: string, data: { tableNumber: number; capacity: number; location: string; status: string }) =>
      ApiClient.put<Table>(`/Employee/tables/${tableId}`, data),

    delete: (tableId: string) =>
      ApiClient.delete(`/Employee/tables/${tableId}`),

    updateStatus: (tableId: string, newStatus: string) =>
      ApiClient.patch<Table>(`/Employee/tables/${tableId}/status`, newStatus),

    getAvailableCount: (restaurantId: string) =>
      ApiClient.get<{ count: number }>(`/Employee/restaurants/${restaurantId}/tables/available/count`),
  },
}
