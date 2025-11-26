import { ApiClient } from "./api"
import { ChatMessage } from "./signalr-service"

export interface ChatHistory {
  orderId: string
  messages: ChatMessage[]
}

export const chatApi = {
  // Sipariş için chat geçmişini getir
  getChatHistory: (orderId: string) =>
    ApiClient.get<ChatMessage[]>(`/Chat/order/${orderId}/messages`),

  // Mesajı okundu olarak işaretle
  markAsRead: (messageId: string) =>
    ApiClient.post(`/Chat/messages/${messageId}/read`, {}),

  // Tüm mesajları okundu olarak işaretle
  markAllAsRead: (orderId: string) =>
    ApiClient.post(`/Chat/order/${orderId}/mark-all-read`, {}),

  // Okunmamış mesaj sayısını getir
  getUnreadCount: (orderId: string) =>
    ApiClient.get<{ count: number }>(`/Chat/order/${orderId}/unread-count`),
}

