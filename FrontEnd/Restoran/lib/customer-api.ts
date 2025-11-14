import { ApiClient } from "./api"

// Types for Customer API
export interface CreateOrderDto {
  restaurantId: string
  deliveryAddress?: string
  deliveryInstructions?: string
  orderType: string
  paymentMethod?: string
  items: OrderItemDto[]
}

export interface UpdateOrderDto {
  deliveryAddress?: string
  deliveryInstructions?: string
}

export interface OrderItemDto {
  menuItemId: string
  quantity: number
  specialInstructions?: string
}

export interface CreateReservationDto {
  restaurantId: string
  tableId?: string
  reservationDate: string
  partySize: number
  specialRequests?: string
}

export interface UpdateReservationDto {
  reservationDate: string
  partySize: number
  specialRequests?: string
}

export interface CreateReviewDto {
  restaurantId: string
  orderId?: string
  rating: number
  comment: string
}

export interface UpdateReviewDto {
  rating: number
  comment: string
}

export interface CustomerStatisticsDto {
  totalOrders: number
  totalReservations: number
  totalReviews: number
  totalSpent: number
  favoriteRestaurantsCount: number
  averageRatingGiven: number
  favoriteRestaurantName?: string
  favoriteCuisine?: string
}

export interface RewardDto {
  id: string
  name: string
  description: string
  pointsRequired: number
  expiryDate: string
  isRedeemed: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
}

// Customer API Service - Base implementation
export const customerApi = {
  // Restaurant Operations
  restaurants: {
    getAll: (pageNumber: number = 1, pageSize: number = 10) => 
      ApiClient.get<PaginatedResponse<any>>(`/Customer/restaurants?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    
    getById: (restaurantId: string) => 
      ApiClient.get<any>(`/Customer/restaurants/${restaurantId}`),
    
    search: (searchTerm: string) => 
      ApiClient.get<any[]>(`/Customer/restaurants/search?searchTerm=${searchTerm}`),
    
    getByCategory: (category: string) => 
      ApiClient.get<any[]>(`/Customer/restaurants/category/${category}`),
    
    getNearby: (latitude: number, longitude: number, radiusKm: number) => 
      ApiClient.get<any[]>(`/Customer/restaurants/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`),
    
    getTopRated: (count: number = 10) => 
      ApiClient.get<any[]>(`/Customer/restaurants/top-rated?count=${count}`),
  },

  // Menu & Menu Items
  menus: {
    getRestaurantMenus: (restaurantId: string) => 
      ApiClient.get<any[]>(`/Customer/restaurants/${restaurantId}/menus`),
    
    getById: (menuId: string) => 
      ApiClient.get<any>(`/Customer/menus/${menuId}`),
    
    getMenuItems: (menuId: string, pageNumber: number = 1, pageSize: number = 20) => 
      ApiClient.get<PaginatedResponse<any>>(`/Customer/menus/${menuId}/items?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    
    getMenuItemById: (menuItemId: string) => 
      ApiClient.get<any>(`/Customer/menu-items/${menuItemId}`),
    
    getAvailableItems: (restaurantId: string) => 
      ApiClient.get<any[]>(`/Customer/restaurants/${restaurantId}/available-items`),
    
    searchMenuItems: (restaurantId: string, searchTerm: string) => 
      ApiClient.get<any[]>(`/Customer/restaurants/${restaurantId}/menu-items/search?searchTerm=${searchTerm}`),
  },

  // Orders
  orders: {
    getMyOrders: (pageNumber: number = 1, pageSize: number = 10) => 
      ApiClient.get<PaginatedResponse<any>>(`/Customer/orders?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    
    getById: (orderId: string) => 
      ApiClient.get<any>(`/Customer/orders/${orderId}`),
    
    create: (data: CreateOrderDto) => 
      ApiClient.post<any>("/Customer/orders", data),
    
    update: (orderId: string, data: UpdateOrderDto) => 
      ApiClient.put<any>(`/Customer/orders/${orderId}`, data),
    
    cancel: (orderId: string) => 
      ApiClient.delete<any>(`/Customer/orders/${orderId}/cancel`),
    
    getActive: () => 
      ApiClient.get<any[]>("/Customer/orders/active"),
    
    getHistory: () => 
      ApiClient.get<any[]>("/Customer/orders/history"),
    
    getCurrent: () => 
      ApiClient.get<any>("/Customer/orders/current"),
    
    getCount: () => 
      ApiClient.get<{ count: number }>("/Customer/orders/count"),
  },

  // Reservations
  reservations: {
    getMyReservations: (pageNumber: number = 1, pageSize: number = 10) => 
      ApiClient.get<PaginatedResponse<any>>(`/Customer/reservations?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    
    getById: (reservationId: string) => 
      ApiClient.get<any>(`/Customer/reservations/${reservationId}`),
    
    create: (data: CreateReservationDto) => 
      ApiClient.post<any>("/Customer/reservations", data),
    
    update: (reservationId: string, data: UpdateReservationDto) => 
      ApiClient.put<any>(`/Customer/reservations/${reservationId}`, data),
    
    cancel: (reservationId: string) => 
      ApiClient.delete<any>(`/Customer/reservations/${reservationId}/cancel`),
    
    getUpcoming: () => 
      ApiClient.get<any[]>("/Customer/reservations/upcoming"),
    
    getPast: () => 
      ApiClient.get<any[]>("/Customer/reservations/past"),
    
    getAvailableTables: (restaurantId: string, date: string, partySize: number) => 
      ApiClient.get<any[]>(`/Customer/restaurants/${restaurantId}/available-tables?date=${date}&partySize=${partySize}`),
    
    checkTableAvailability: (tableId: string, date: string) => 
      ApiClient.get<{ available: boolean }>(`/Customer/tables/${tableId}/availability?date=${date}`),
  },

  // Reviews
  reviews: {
    getRestaurantReviews: (restaurantId: string, pageNumber: number = 1, pageSize: number = 10) => 
      ApiClient.get<PaginatedResponse<any>>(`/Customer/restaurants/${restaurantId}/reviews?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    
    getMyReviews: (pageNumber: number = 1, pageSize: number = 10) => 
      ApiClient.get<PaginatedResponse<any>>(`/Customer/reviews?pageNumber=${pageNumber}&pageSize=${pageSize}`),
    
    getById: (reviewId: string) => 
      ApiClient.get<any>(`/Customer/reviews/${reviewId}`),
    
    create: (data: CreateReviewDto) => 
      ApiClient.post<any>("/Customer/reviews", data),
    
    update: (reviewId: string, data: UpdateReviewDto) => 
      ApiClient.put<any>(`/Customer/reviews/${reviewId}`, data),
    
    delete: (reviewId: string) => 
      ApiClient.delete<any>(`/Customer/reviews/${reviewId}`),
    
    canReview: (restaurantId: string) => 
      ApiClient.get<{ canReview: boolean }>(`/Customer/restaurants/${restaurantId}/can-review`),
    
    getMyReviewForRestaurant: (restaurantId: string) => 
      ApiClient.get<any>(`/Customer/restaurants/${restaurantId}/my-review`),
    
    getAverageRating: (restaurantId: string) => 
      ApiClient.get<{ averageRating: number }>(`/Customer/restaurants/${restaurantId}/average-rating`),
  },

  // Favorites
  favorites: {
    getAll: () => 
      ApiClient.get<any[]>("/Customer/favorites"),
    
    add: (restaurantId: string) => 
      ApiClient.post<any>(`/Customer/favorites/${restaurantId}`, {}),
    
    remove: (restaurantId: string) => 
      ApiClient.delete<any>(`/Customer/favorites/${restaurantId}`),
    
    isFavorite: (restaurantId: string) => 
      ApiClient.get<{ isFavorite: boolean }>(`/Customer/favorites/${restaurantId}/check`),
  },

  // Customer Profile & Stats
  profile: {
    getStatistics: () => 
      ApiClient.get<CustomerStatisticsDto>("/Customer/statistics"),
    
    getRecommendedRestaurants: (count: number = 10) => 
      ApiClient.get<any[]>(`/Customer/recommended-restaurants?count=${count}`),
    
    getTotalSpent: () => 
      ApiClient.get<{ totalSpent: number }>("/Customer/total-spent"),
    
    getTotalOrders: () => 
      ApiClient.get<{ totalOrders: number }>("/Customer/total-orders"),
    
    getTotalReservations: () => 
      ApiClient.get<{ totalReservations: number }>("/Customer/total-reservations"),
  },

  // Loyalty & Rewards
  loyalty: {
    getPoints: (restaurantId: string) => 
      ApiClient.get<{ points: number }>(`/Customer/restaurants/${restaurantId}/loyalty-points`),
    
    getAvailableRewards: (restaurantId: string) => 
      ApiClient.get<RewardDto[]>(`/Customer/restaurants/${restaurantId}/rewards`),
    
    redeemReward: (rewardId: string) => 
      ApiClient.post<any>(`/Customer/rewards/${rewardId}/redeem`, {}),
  },
}

// Customer API Service - Convenient wrapper class
export class CustomerApi {
  // Restaurant Operations
  static async getRestaurants(pageNumber: number = 1, pageSize: number = 10) {
    return customerApi.restaurants.getAll(pageNumber, pageSize)
  }

  static async getRestaurantById(restaurantId: string) {
    return customerApi.restaurants.getById(restaurantId)
  }

  static async searchRestaurants(searchTerm: string) {
    return customerApi.restaurants.search(searchTerm)
  }

  static async getRestaurantsByCategory(category: string) {
    return customerApi.restaurants.getByCategory(category)
  }

  static async getNearbyRestaurants(latitude: number, longitude: number, radiusKm: number) {
    return customerApi.restaurants.getNearby(latitude, longitude, radiusKm)
  }

  static async getTopRatedRestaurants(count: number = 10) {
    return customerApi.restaurants.getTopRated(count)
  }

  // Menu & Menu Items
  static async getRestaurantMenus(restaurantId: string) {
    return customerApi.menus.getRestaurantMenus(restaurantId)
  }

  static async getMenuById(menuId: string) {
    return customerApi.menus.getById(menuId)
  }

  static async getMenuItems(menuId: string, pageNumber: number = 1, pageSize: number = 20) {
    return customerApi.menus.getMenuItems(menuId, pageNumber, pageSize)
  }

  static async getMenuItemById(menuItemId: string) {
    return customerApi.menus.getMenuItemById(menuItemId)
  }

  static async getAvailableMenuItems(restaurantId: string) {
    return customerApi.menus.getAvailableItems(restaurantId)
  }

  static async searchMenuItems(restaurantId: string, searchTerm: string) {
    return customerApi.menus.searchMenuItems(restaurantId, searchTerm)
  }

  // Orders
  static async getMyOrders(pageNumber: number = 1, pageSize: number = 10) {
    return customerApi.orders.getMyOrders(pageNumber, pageSize)
  }

  static async getOrderById(orderId: string) {
    return customerApi.orders.getById(orderId)
  }

  static async createOrder(data: CreateOrderDto) {
    return customerApi.orders.create(data)
  }

  static async updateOrder(orderId: string, data: UpdateOrderDto) {
    return customerApi.orders.update(orderId, data)
  }

  static async cancelOrder(orderId: string) {
    return customerApi.orders.cancel(orderId)
  }

  static async getActiveOrders() {
    return customerApi.orders.getActive()
  }

  static async getOrderHistory() {
    return customerApi.orders.getHistory()
  }

  static async getCurrentOrder() {
    return customerApi.orders.getCurrent()
  }

  // Reservations
  static async getMyReservations(pageNumber: number = 1, pageSize: number = 10) {
    return customerApi.reservations.getMyReservations(pageNumber, pageSize)
  }

  static async getReservationById(reservationId: string) {
    return customerApi.reservations.getById(reservationId)
  }

  static async createReservation(data: CreateReservationDto) {
    return customerApi.reservations.create(data)
  }

  static async updateReservation(reservationId: string, data: UpdateReservationDto) {
    return customerApi.reservations.update(reservationId, data)
  }

  static async cancelReservation(reservationId: string) {
    return customerApi.reservations.cancel(reservationId)
  }

  static async getUpcomingReservations() {
    return customerApi.reservations.getUpcoming()
  }

  static async getPastReservations() {
    return customerApi.reservations.getPast()
  }

  static async getAvailableTables(restaurantId: string, date: string, partySize: number) {
    return customerApi.reservations.getAvailableTables(restaurantId, date, partySize)
  }

  static async checkTableAvailability(tableId: string, date: string) {
    return customerApi.reservations.checkTableAvailability(tableId, date)
  }

  // Reviews
  static async getRestaurantReviews(restaurantId: string, pageNumber: number = 1, pageSize: number = 10) {
    return customerApi.reviews.getRestaurantReviews(restaurantId, pageNumber, pageSize)
  }

  static async getMyReviews(pageNumber: number = 1, pageSize: number = 10) {
    return customerApi.reviews.getMyReviews(pageNumber, pageSize)
  }

  static async getReviewById(reviewId: string) {
    return customerApi.reviews.getById(reviewId)
  }

  static async createReview(data: CreateReviewDto) {
    return customerApi.reviews.create(data)
  }

  static async updateReview(reviewId: string, data: UpdateReviewDto) {
    return customerApi.reviews.update(reviewId, data)
  }

  static async deleteReview(reviewId: string) {
    return customerApi.reviews.delete(reviewId)
  }

  static async canReviewRestaurant(restaurantId: string) {
    return customerApi.reviews.canReview(restaurantId)
  }

  static async getMyReviewForRestaurant(restaurantId: string) {
    return customerApi.reviews.getMyReviewForRestaurant(restaurantId)
  }

  static async getRestaurantAverageRating(restaurantId: string) {
    return customerApi.reviews.getAverageRating(restaurantId)
  }

  // Favorites
  static async getFavoriteRestaurants() {
    return customerApi.favorites.getAll()
  }

  static async addToFavorites(restaurantId: string) {
    return customerApi.favorites.add(restaurantId)
  }

  static async removeFromFavorites(restaurantId: string) {
    return customerApi.favorites.remove(restaurantId)
  }

  static async isFavoriteRestaurant(restaurantId: string) {
    return customerApi.favorites.isFavorite(restaurantId)
  }

  // Profile & Stats
  static async getStatistics() {
    return customerApi.profile.getStatistics()
  }

  static async getRecommendedRestaurants(count: number = 10) {
    return customerApi.profile.getRecommendedRestaurants(count)
  }

  static async getTotalSpent() {
    return customerApi.profile.getTotalSpent()
  }

  static async getTotalOrders() {
    return customerApi.profile.getTotalOrders()
  }

  static async getTotalReservations() {
    return customerApi.profile.getTotalReservations()
  }

  // Loyalty & Rewards
  static async getLoyaltyPoints(restaurantId: string) {
    return customerApi.loyalty.getPoints(restaurantId)
  }

  static async getAvailableRewards(restaurantId: string) {
    return customerApi.loyalty.getAvailableRewards(restaurantId)
  }

  static async redeemReward(rewardId: string) {
    return customerApi.loyalty.redeemReward(rewardId)
  }
}

