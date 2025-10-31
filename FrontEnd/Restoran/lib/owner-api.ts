import { ApiClient } from "./api"

// Types for Owner API
export interface CreateRestaurantDto {
  name: string
  address: string
  phoneNumber: string
  email?: string
  website?: string
  description: string
  ownerId: string
}

export interface UpdateRestaurantDto {
  name: string
  address: string
  phoneNumber: string
  email?: string
  website?: string
  description: string
}

export interface CreateEmployeeDto {
  fullName: string
  email: string
  password: string
  phoneNumber?: string
  address?: string
  profileImageUrl?: string
}

export interface UpdateEmployeeDto {
  fullName: string
  email: string
  phoneNumber?: string
  address?: string
  profileImageUrl?: string
  password?: string
}

export interface CreateMenuDto {
  name: string
  description: string
  restaurantId: string
}

export interface UpdateMenuDto {
  name: string
  description: string
}

export interface CreateMenuItemDto {
  name: string
  description: string
  price: number
  imageUrl?: string
  category?: string
  isAvailable: boolean
  menuId: string
}

export interface UpdateMenuItemDto {
  name: string
  description: string
  price: number
  imageUrl?: string
  category?: string
  isAvailable: boolean
}

export interface CreateTableDto {
  tableNumber: number
  capacity: number
  status?: string
  location?: string
}

export interface UpdateTableDto {
  tableNumber: number
  capacity: number
  status: string
  location?: string
}

export interface OwnerDashboardDto {
  restaurantId: number
  restaurantName: string
  totalRevenue: number
  todayRevenue: number
  totalOrders: number
  todayOrders: number
  activeReservations: number
  menuItemCount: number
  employeeCount: number
  pendingApplicationsCount: number
  pendingReviewsCount: number
  averageRating: number
  topSellingItems: TopSellingItemDto[]
  recentOrders: RecentOrderDto[]
}

export interface OwnerStatisticsDto {
  totalCustomers: number
  totalOrders: number
  totalRevenue: number
  totalEmployees: number
  totalTables: number
  availableTables: number
  totalMenuItems: number
  averageOrderValue: number
  averageRating: number
  totalReviews: number
}

export interface TopSellingItemDto {
  menuItemId: number
  menuItemName: string
  category: string
  quantitySold: number
  totalRevenue: number
  price: number
}

export interface RecentOrderDto {
  orderId: number
  orderDate: string
  customerName: string
  totalAmount: number
  status: string
  orderType: string
}

export interface RevenueChartDto {
  dailyRevenue: DailyRevenueDto[]
  totalRevenue: number
  averageDailyRevenue: number
}

export interface DailyRevenueDto {
  date: string
  revenue: number
  orderCount: number
}

export interface SalesReportDto {
  startDate: string
  endDate: string
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  categorySales: CategorySalesDto[]
  dailySales: DailyRevenueDto[]
  topProducts: TopSellingItemDto[]
}

export interface CategorySalesDto {
  category: string
  itemsSold: number
  revenue: number
  percentage: number
}

export interface PaginatedResponse<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

// Owner API Service
export const ownerApi = {
  // Restaurant Management
  restaurants: {
    getMyRestaurants: () => 
      ApiClient.get<any[]>("/Owner/restaurants"),
    
    getById: (restaurantId: string) => 
      ApiClient.get<any>(`/Owner/restaurants/${restaurantId}`),
    
    create: (data: CreateRestaurantDto) => 
      ApiClient.post<any>("/Owner/restaurants", data),
    
    update: (restaurantId: string, data: UpdateRestaurantDto) => 
      ApiClient.put<any>(`/Owner/restaurants/${restaurantId}`, data),
    
    delete: (restaurantId: string) => 
      ApiClient.delete<any>(`/Owner/restaurants/${restaurantId}`),
  },

  // Dashboard & Statistics
  dashboard: {
    getDashboard: (restaurantId: string) => 
      ApiClient.get<OwnerDashboardDto>(`/Owner/restaurants/${restaurantId}/dashboard`),
    
    getStatistics: (restaurantId: string) => 
      ApiClient.get<OwnerStatisticsDto>(`/Owner/restaurants/${restaurantId}/statistics`),
    
    getTopSellingItems: (restaurantId: string, count: number = 10) => 
      ApiClient.get<TopSellingItemDto[]>(`/Owner/restaurants/${restaurantId}/top-selling-items?count=${count}`),
    
    getRevenueChart: (restaurantId: string, days: number = 30) => 
      ApiClient.get<RevenueChartDto>(`/Owner/restaurants/${restaurantId}/revenue-chart?days=${days}`),
    
    getTotalRevenue: (restaurantId: string) => 
      ApiClient.get<{ totalRevenue: number }>(`/Owner/restaurants/${restaurantId}/total-revenue`),
    
    getTodayRevenue: (restaurantId: string) => 
      ApiClient.get<{ todayRevenue: number }>(`/Owner/restaurants/${restaurantId}/today-revenue`),
  },

  // Reports
  reports: {
    getSalesReport: (restaurantId: string, startDate: string, endDate: string) => 
      ApiClient.get<SalesReportDto>(
        `/Owner/restaurants/${restaurantId}/sales-report?startDate=${startDate}&endDate=${endDate}`
      ),
    
    getOrdersByDateRange: (restaurantId: string, startDate: string, endDate: string) => 
      ApiClient.get<any[]>(
        `/Owner/restaurants/${restaurantId}/orders-by-date-range?startDate=${startDate}&endDate=${endDate}`
      ),
    
    getCategorySales: (restaurantId: string, startDate: string, endDate: string) => 
      ApiClient.get<CategorySalesDto[]>(
        `/Owner/restaurants/${restaurantId}/category-sales?startDate=${startDate}&endDate=${endDate}`
      ),
  },

  // Employee Management
  employees: {
    getAll: (restaurantId: string, pageNumber: number = 1, pageSize: number = 10) => 
      ApiClient.get<PaginatedResponse<any>>(
        `/Owner/restaurants/${restaurantId}/employees?pageNumber=${pageNumber}&pageSize=${pageSize}`
      ),
    
    getById: (restaurantId: string, employeeId: string) => 
      ApiClient.get<any>(`/Owner/restaurants/${restaurantId}/employees/${employeeId}`),
    
    create: (restaurantId: string, data: CreateEmployeeDto) => 
      ApiClient.post<any>(`/Owner/restaurants/${restaurantId}/employees`, data),
    
    update: (restaurantId: string, employeeId: string, data: UpdateEmployeeDto) => 
      ApiClient.put<any>(`/Owner/restaurants/${restaurantId}/employees/${employeeId}`, data),
    
    delete: (restaurantId: string, employeeId: string) => 
      ApiClient.delete<any>(`/Owner/restaurants/${restaurantId}/employees/${employeeId}`),
    
    getCount: (restaurantId: string) => 
      ApiClient.get<{ count: number }>(`/Owner/restaurants/${restaurantId}/employees/count`),
  },

  // Job Applications
  jobApplications: {
    getAll: (restaurantId: string, pageNumber: number = 1, pageSize: number = 10) => 
      ApiClient.get<PaginatedResponse<any>>(
        `/Owner/restaurants/${restaurantId}/job-applications?pageNumber=${pageNumber}&pageSize=${pageSize}`
      ),
    
    getPending: (restaurantId: string, pageNumber: number = 1, pageSize: number = 10) => 
      ApiClient.get<PaginatedResponse<any>>(
        `/Owner/restaurants/${restaurantId}/job-applications/pending?pageNumber=${pageNumber}&pageSize=${pageSize}`
      ),
    
    getById: (applicationId: number) => 
      ApiClient.get<any>(`/Owner/job-applications/${applicationId}`),
    
    accept: (applicationId: number) => 
      ApiClient.post<any>(`/Owner/job-applications/${applicationId}/accept`, {}),
    
    reject: (applicationId: number, rejectionReason?: string) => 
      ApiClient.post<any>(`/Owner/job-applications/${applicationId}/reject`, rejectionReason),
    
    getPendingCount: (restaurantId: string) => 
      ApiClient.get<{ count: number }>(`/Owner/restaurants/${restaurantId}/job-applications/pending/count`),
  },

  // Reviews
  reviews: {
    getAll: (restaurantId: string, pageNumber: number = 1, pageSize: number = 10) => 
      ApiClient.get<PaginatedResponse<any>>(
        `/Owner/restaurants/${restaurantId}/reviews?pageNumber=${pageNumber}&pageSize=${pageSize}`
      ),
    
    getPending: (restaurantId: string, pageNumber: number = 1, pageSize: number = 10) => 
      ApiClient.get<PaginatedResponse<any>>(
        `/Owner/restaurants/${restaurantId}/reviews/pending?pageNumber=${pageNumber}&pageSize=${pageSize}`
      ),
    
    getById: (reviewId: number) => 
      ApiClient.get<any>(`/Owner/reviews/${reviewId}`),
    
    approve: (reviewId: number) => 
      ApiClient.post<any>(`/Owner/reviews/${reviewId}/approve`, {}),
    
    reject: (reviewId: number) => 
      ApiClient.post<any>(`/Owner/reviews/${reviewId}/reject`, {}),
    
    respond: (reviewId: number, response: string) => 
      ApiClient.post<any>(`/Owner/reviews/${reviewId}/respond`, response),
    
    getPendingCount: (restaurantId: string) => 
      ApiClient.get<{ count: number }>(`/Owner/restaurants/${restaurantId}/reviews/pending/count`),
    
    getAverageRating: (restaurantId: string) => 
      ApiClient.get<{ averageRating: number }>(`/Owner/restaurants/${restaurantId}/average-rating`),
  },

  // Orders
  orders: {
    getAll: (restaurantId: string, pageNumber: number = 1, pageSize: number = 10) => 
      ApiClient.get<PaginatedResponse<any>>(
        `/Owner/restaurants/${restaurantId}/orders?pageNumber=${pageNumber}&pageSize=${pageSize}`
      ),
    
    getByStatus: (restaurantId: string, status: string, pageNumber: number = 1, pageSize: number = 10) => 
      ApiClient.get<PaginatedResponse<any>>(
        `/Owner/restaurants/${restaurantId}/orders/status/${status}?pageNumber=${pageNumber}&pageSize=${pageSize}`
      ),
    
    getById: (orderId: number) => 
      ApiClient.get<any>(`/Owner/orders/${orderId}`),
    
    updateStatus: (orderId: number, newStatus: string) => 
      ApiClient.put<any>(`/Owner/orders/${orderId}/status`, newStatus),
    
    getTotalCount: (restaurantId: string) => 
      ApiClient.get<{ totalOrders: number }>(`/Owner/restaurants/${restaurantId}/orders/count`),
    
    getTodayCount: (restaurantId: string) => 
      ApiClient.get<{ todayOrders: number }>(`/Owner/restaurants/${restaurantId}/orders/today/count`),
  },

  // Reservations
  reservations: {
    getAll: (restaurantId: string, pageNumber: number = 1, pageSize: number = 10) => 
      ApiClient.get<PaginatedResponse<any>>(
        `/Owner/restaurants/${restaurantId}/reservations?pageNumber=${pageNumber}&pageSize=${pageSize}`
      ),
    
    getByStatus: (restaurantId: string, status: string, pageNumber: number = 1, pageSize: number = 10) => 
      ApiClient.get<PaginatedResponse<any>>(
        `/Owner/restaurants/${restaurantId}/reservations/status/${status}?pageNumber=${pageNumber}&pageSize=${pageSize}`
      ),
    
    getById: (reservationId: string) => 
      ApiClient.get<any>(`/Owner/reservations/${reservationId}`),
    
    updateStatus: (reservationId: string, newStatus: string) => 
      ApiClient.put<any>(`/Owner/reservations/${reservationId}/status`, newStatus),
    
    getActiveCount: (restaurantId: string) => 
      ApiClient.get<{ activeReservations: number }>(`/Owner/restaurants/${restaurantId}/reservations/active/count`),
    
    getToday: (restaurantId: string) => 
      ApiClient.get<any[]>(`/Owner/restaurants/${restaurantId}/reservations/today`),
  },

  // Menu Management
  menus: {
    getAll: (restaurantId: string) => 
      ApiClient.get<any[]>(`/Owner/restaurants/${restaurantId}/menus`),
    
    getById: (menuId: string) => 
      ApiClient.get<any>(`/Owner/menus/${menuId}`),
    
    create: (restaurantId: string, data: CreateMenuDto) => 
      ApiClient.post<any>(`/Owner/restaurants/${restaurantId}/menus`, data),
    
    update: (menuId: string, data: UpdateMenuDto) => 
      ApiClient.put<any>(`/Owner/menus/${menuId}`, data),
    
    delete: (menuId: string) => 
      ApiClient.delete<any>(`/Owner/menus/${menuId}`),
  },

  // Menu Items
  menuItems: {
    getAll: (menuId: string, pageNumber: number = 1, pageSize: number = 20) => 
      ApiClient.get<PaginatedResponse<any>>(
        `/Owner/menus/${menuId}/items?pageNumber=${pageNumber}&pageSize=${pageSize}`
      ),
    
    getById: (menuItemId: string) => 
      ApiClient.get<any>(`/Owner/menu-items/${menuItemId}`),
    
    create: (menuId: string, data: CreateMenuItemDto) => 
      ApiClient.post<any>(`/Owner/menus/${menuId}/items`, data),
    
    update: (menuItemId: string, data: UpdateMenuItemDto) => 
      ApiClient.put<any>(`/Owner/menu-items/${menuItemId}`, data),
    
    delete: (menuItemId: string) => 
      ApiClient.delete<any>(`/Owner/menu-items/${menuItemId}`),
    
    updateAvailability: (menuItemId: string, isAvailable: boolean) => 
      ApiClient.patch<any>(`/Owner/menu-items/${menuItemId}/availability`, isAvailable),
    
    getCount: (restaurantId: string) => 
      ApiClient.get<{ count: number }>(`/Owner/restaurants/${restaurantId}/menu-items/count`),
  },

  // Tables
  tables: {
    getAll: (restaurantId: string) => 
      ApiClient.get<any[]>(`/Owner/restaurants/${restaurantId}/tables`),
    
    getById: (tableId: string) => 
      ApiClient.get<any>(`/Owner/tables/${tableId}`),
    
    create: (restaurantId: string, data: CreateTableDto) => 
      ApiClient.post<any>(`/Owner/restaurants/${restaurantId}/tables`, data),
    
    update: (tableId: string, data: UpdateTableDto) => 
      ApiClient.put<any>(`/Owner/tables/${tableId}`, data),
    
    delete: (tableId: string) => 
      ApiClient.delete<any>(`/Owner/tables/${tableId}`),
    
    updateStatus: (tableId: string, newStatus: string) => 
      ApiClient.patch<any>(`/Owner/tables/${tableId}/status`, newStatus),
    
    getAvailableCount: (restaurantId: string) => 
      ApiClient.get<{ count: number }>(`/Owner/restaurants/${restaurantId}/tables/available/count`),
  },
}

