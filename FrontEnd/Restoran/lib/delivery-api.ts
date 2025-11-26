import { ApiClient } from "./api"
import { Order, OrderStatus } from "@/types"

export interface PaginatedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export const deliveryApi = {
  // Müsait siparişleri getir (Ready durumunda)
  getAvailableOrders: (pageNumber = 1, pageSize = 10) =>
    ApiClient.get<PaginatedResult<Order>>(
      `/Delivery/available-orders?pageNumber=${pageNumber}&pageSize=${pageSize}`
    ),

  // Kendi siparişlerimi getir
  getMyOrders: (pageNumber = 1, pageSize = 10) =>
    ApiClient.get<PaginatedResult<Order>>(
      `/Delivery/my-orders?pageNumber=${pageNumber}&pageSize=${pageSize}`
    ),

  // Sipariş kabul et
  acceptOrder: (orderId: string) =>
    ApiClient.post<Order>(`/Delivery/accept-order/${orderId}`, {}),

  // Sipariş durumunu güncelle
  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    // OrderStatus enum'unu sayısal değere çevir
    const statusMap: Record<string, number> = {
      Pending: 0,
      Confirmed: 1,
      Preparing: 2,
      Ready: 3,
      OutForDelivery: 4,
      Delivered: 5,
      Served: 6,
      Completed: 7,
      Cancelled: 8,
    }
    const statusValue = statusMap[status] ?? 5 // Default: Delivered
    return ApiClient.put<Order>(`/Delivery/update-order-status/${orderId}`, statusValue)
  },

  // Sipariş detaylarını getir
  getOrderDetails: (orderId: string) =>
    ApiClient.get<Order>(`/Delivery/order/${orderId}`),
}

export class DeliveryApiService {
  static async getAvailableOrders(pageNumber: number = 1, pageSize: number = 10) {
    return deliveryApi.getAvailableOrders(pageNumber, pageSize)
  }

  static async getMyOrders(pageNumber: number = 1, pageSize: number = 10) {
    return deliveryApi.getMyOrders(pageNumber, pageSize)
  }

  static async acceptOrder(orderId: string) {
    return deliveryApi.acceptOrder(orderId)
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus) {
    return deliveryApi.updateOrderStatus(orderId, status)
  }

  static async getOrderDetails(orderId: string) {
    return deliveryApi.getOrderDetails(orderId)
  }
}
