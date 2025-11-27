import { ApiClient } from "./api"

// Customer API
export const customerApi = {
  // Orders
  orders: {
    getAll: (pageNumber = 1, pageSize = 10) => 
      ApiClient.get<any>(`/Customer/orders?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    create: (data: any) => ApiClient.post<any>("/Customer/orders", data),
    getById: (orderId: string) => ApiClient.get<any>(`/Customer/orders/${orderId}`),
    update: (orderId: string, data: any) => ApiClient.put<any>(`/Customer/orders/${orderId}`, data),
    cancel: (orderId: string) => ApiClient.post<any>(`/Customer/orders/${orderId}/cancel`, {}),
    getActive: (pageNumber = 1, pageSize = 10) => 
      ApiClient.get<any>(`/Customer/orders/active?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    getHistory: (pageNumber = 1, pageSize = 10) => 
      ApiClient.get<any>(`/Customer/orders/history?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    getCurrent: () => ApiClient.get<any[]>("/Customer/orders/current"),
    getCount: () => ApiClient.get<number>("/Customer/orders/count"),
  },

  // Reservations
  reservations: {
    getAll: (pageNumber = 1, pageSize = 10) => 
      ApiClient.get<any>(`/Customer/reservations?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    create: (data: any) => ApiClient.post<any>("/Customer/reservations", data),
    getById: (reservationId: string) => ApiClient.get<any>(`/Customer/reservations/${reservationId}`),
    update: (reservationId: string, data: any) => 
      ApiClient.put<any>(`/Customer/reservations/${reservationId}`, data),
    cancel: (reservationId: string) => 
      ApiClient.post<any>(`/Customer/reservations/${reservationId}/cancel`, {}),
    getUpcoming: (pageNumber = 1, pageSize = 10) => 
      ApiClient.get<any>(`/Customer/reservations/upcoming?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    getPast: (pageNumber = 1, pageSize = 10) => 
      ApiClient.get<any>(`/Customer/reservations/past?pageNumber=${pageNumber}&pageSize=${pageSize}`),
  },

  // Restaurants
  restaurants: {
    getAll: (pageNumber = 1, pageSize = 10) => 
      ApiClient.get<any>(`/Customer/restaurants?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    getById: (restaurantId: string) => ApiClient.get<any>(`/Customer/restaurants/${restaurantId}`),
    search: (searchTerm: string, pageNumber = 1, pageSize = 10) => 
      ApiClient.get<any>(`/Customer/restaurants/search?searchTerm=${searchTerm}&pageNumber=${pageNumber}&pageSize=${pageSize}`),
    getByCategory: (category: string, pageNumber = 1, pageSize = 10) => 
      ApiClient.get<any>(`/Customer/restaurants/category/${category}?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    getNearby: (latitude: number, longitude: number, radiusInKm = 5, pageNumber = 1, pageSize = 10) => 
      ApiClient.get<any>(`/Customer/restaurants/nearby?latitude=${latitude}&longitude=${longitude}&radiusInKm=${radiusInKm}&pageNumber=${pageNumber}&pageSize=${pageSize}`),
    getTopRated: (pageNumber = 1, pageSize = 10) => 
      ApiClient.get<any>(`/Customer/restaurants/top-rated?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    getMenus: (restaurantId: string) => ApiClient.get<any[]>(`/Customer/restaurants/${restaurantId}/menus`),
    getAvailableItems: (restaurantId: string) => 
      ApiClient.get<any[]>(`/Customer/restaurants/${restaurantId}/available-items`),
    searchMenuItems: (restaurantId: string, searchTerm: string) => 
      ApiClient.get<any[]>(`/Customer/restaurants/${restaurantId}/menu-items/search?searchTerm=${searchTerm}`),
    getReviews: (restaurantId: string, pageNumber = 1, pageSize = 10) => 
      ApiClient.get<any>(`/Customer/restaurants/${restaurantId}/reviews?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    canReview: (restaurantId: string) => ApiClient.get<boolean>(`/Customer/restaurants/${restaurantId}/can-review`),
    getMyReview: (restaurantId: string) => ApiClient.get<any>(`/Customer/restaurants/${restaurantId}/my-review`),
    getAverageRating: (restaurantId: string) => 
      ApiClient.get<number>(`/Customer/restaurants/${restaurantId}/average-rating`),
    getAvailableTables: (restaurantId: string, date: string, partySize: number) => 
      ApiClient.get<any[]>(`/Customer/restaurants/${restaurantId}/available-tables?date=${date}&partySize=${partySize}`),
  },

  // Menus
  menus: {
    getById: (menuId: string) => ApiClient.get<any>(`/Customer/menus/${menuId}`),
    getItems: (menuId: string) => ApiClient.get<any[]>(`/Customer/menus/${menuId}/items`),
  },

  // Menu Items
  menuItems: {
    getById: (menuItemId: string) => ApiClient.get<any>(`/Customer/menu-items/${menuItemId}`),
  },

  // Tables
  tables: {
    getAvailability: (tableId: string, date: string, duration: number) => 
      ApiClient.get<any>(`/Customer/tables/${tableId}/availability?date=${date}&duration=${duration}`),
  },

  // Reviews
  reviews: {
    getAll: (pageNumber = 1, pageSize = 10) => 
      ApiClient.get<any>(`/Customer/reviews?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    create: (data: any) => ApiClient.post<any>("/Customer/reviews", data),
    getById: (reviewId: string) => ApiClient.get<any>(`/Customer/reviews/${reviewId}`),
    update: (reviewId: string, data: any) => ApiClient.put<any>(`/Customer/reviews/${reviewId}`, data),
    delete: (reviewId: string) => ApiClient.delete<any>(`/Customer/reviews/${reviewId}`),
  },

  // Favorites
  favorites: {
    getAll: (pageNumber = 1, pageSize = 10) => 
      ApiClient.get<any>(`/Customer/favorites?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    add: (restaurantId: string) => ApiClient.post<any>(`/Customer/favorites/${restaurantId}`, {}),
    remove: (restaurantId: string) => ApiClient.delete<any>(`/Customer/favorites/${restaurantId}`),
    check: (restaurantId: string) => ApiClient.get<boolean>(`/Customer/favorites/${restaurantId}/check`),
  },

  // Statistics
  statistics: {
    getCustomerStatistics: () => ApiClient.get<any>("/Customer/statistics"),
    getRecommendations: (count = 6) => ApiClient.get<any[]>(`/Customer/recommendations?count=${count}`),
    getTotalSpent: () => ApiClient.get<number>("/Customer/total-spent"),
    getTotalOrders: () => ApiClient.get<number>("/Customer/total-orders"),
    getTotalReservations: () => ApiClient.get<number>("/Customer/total-reservations"),
  },

  // Loyalty
  loyalty: {
    getBalance: () => ApiClient.get<any[]>("/Loyalty/customer/balance"),
    getHistory: (restaurantId?: string) => {
      const url = restaurantId 
        ? `/Loyalty/customer/history?restaurantId=${restaurantId}`
        : "/Loyalty/customer/history"
      return ApiClient.get<any[]>(url)
    },
    redeemCode: (code: string) => ApiClient.post<any>("/Loyalty/customer/redeem-code", { code }),
    getPoints: (restaurantId: string) => ApiClient.get<any>(`/Customer/loyalty/${restaurantId}/points`),
    getRewards: (restaurantId: string) => ApiClient.get<any[]>(`/Customer/loyalty/${restaurantId}/rewards`),
    redeemReward: (rewardId: string) => ApiClient.post<any>(`/Customer/loyalty/rewards/${rewardId}/redeem`, {}),
  },
}
