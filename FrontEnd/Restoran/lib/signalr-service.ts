import * as signalR from "@microsoft/signalr"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface ChatMessage {
  id: string
  orderId: string
  senderId: string
  senderName: string
  senderRole: string
  content: string
  isRead: boolean
  timestamp: string
}

export interface UserTypingEvent {
  userId: string
  userName: string
  orderId: string
  isTyping: boolean
  timestamp: string
}

export interface MessageReadEvent {
  messageId: string
  readBy: string
  readAt: string
}

export interface UserJoinedEvent {
  userId: string
  orderId: string
  timestamp: string
}

export class SignalRService {
  private connection: signalR.HubConnection | null = null
  private isConnecting: boolean = false
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5

  constructor() {
    this.connection = null
  }

  // Bağlantıyı başlat
  async connect(token: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log("✅ Already connected to ChatHub")
      return
    }

    if (this.isConnecting) {
      console.log("⏳ Connection attempt already in progress")
      return
    }

    this.isConnecting = true

    try {
      console.log(`🔗 Attempting to connect to SignalR at: ${API_URL}/chatHub`)
      
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_URL}/chatHub`, {
          accessTokenFactory: () => token,
          skipNegotiation: false,
          withCredentials: false,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount < this.maxReconnectAttempts) {
              return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 32000)
            }
            return null
          },
        })
        .configureLogging(signalR.LogLevel.Debug) // Debug modu - daha fazla log görmek için
        .build()

      // Bağlantı olayları
      this.connection.onclose((error) => {
        console.log("❌ ChatHub connection closed", error)
        this.isConnecting = false
      })

      this.connection.onreconnecting((error) => {
        console.log("🔄 ChatHub reconnecting...", error)
        this.reconnectAttempts++
      })

      this.connection.onreconnected((connectionId) => {
        console.log("✅ ChatHub reconnected:", connectionId)
        this.reconnectAttempts = 0
      })

      await this.connection.start()
      console.log("✅ Connected to ChatHub successfully!")
      this.reconnectAttempts = 0
    } catch (error: any) {
      console.error("❌ Failed to connect to ChatHub:", error)
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        apiUrl: API_URL
      })
      this.isConnecting = false
      throw new Error(`SignalR bağlantısı kurulamadı. Backend'in çalıştığından ve ${API_URL} adresinin erişilebilir olduğundan emin olun.`)
    } finally {
      this.isConnecting = false
    }
  }

  // Bağlantıyı kes
  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop()
        console.log("✅ Disconnected from ChatHub")
      } catch (error) {
        console.error("❌ Error disconnecting from ChatHub:", error)
      }
      this.connection = null
    }
  }

  // Bağlantı durumunu kontrol et
  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected
  }

  // Sipariş chat odasına katıl
  async joinOrderChat(orderId: string): Promise<void> {
    if (!this.connection || !this.isConnected()) {
      throw new Error("Not connected to ChatHub")
    }

    try {
      await this.connection.invoke("JoinOrderChat", orderId)
      console.log(`👥 Joined order chat: ${orderId}`)
    } catch (error) {
      console.error("❌ Failed to join order chat:", error)
      throw error
    }
  }

  // Sipariş chat odasından ayrıl
  async leaveOrderChat(orderId: string): Promise<void> {
    if (!this.connection || !this.isConnected()) {
      return
    }

    try {
      await this.connection.invoke("LeaveOrderChat", orderId)
      console.log(`👋 Left order chat: ${orderId}`)
    } catch (error) {
      console.error("❌ Failed to leave order chat:", error)
    }
  }

  // Mesaj gönder
  async sendMessage(orderId: string, content: string): Promise<void> {
    if (!this.connection || !this.isConnected()) {
      throw new Error("Not connected to ChatHub")
    }

    try {
      await this.connection.invoke("SendMessage", orderId, content)
      console.log(`💬 Message sent to order: ${orderId}`)
    } catch (error) {
      console.error("❌ Failed to send message:", error)
      throw error
    }
  }

  // Yazıyor göstergesi gönder
  async sendTypingIndicator(orderId: string, isTyping: boolean): Promise<void> {
    if (!this.connection || !this.isConnected()) {
      return
    }

    try {
      await this.connection.invoke("SendTypingIndicator", orderId, isTyping)
    } catch (error) {
      console.error("❌ Failed to send typing indicator:", error)
    }
  }

  // Mesajı okundu olarak işaretle
  async markMessageAsRead(messageId: string): Promise<void> {
    if (!this.connection || !this.isConnected()) {
      return
    }

    try {
      await this.connection.invoke("MarkMessageAsRead", messageId)
    } catch (error) {
      console.error("❌ Failed to mark message as read:", error)
    }
  }

  // Mesaj alma event listener'ı
  onReceiveMessage(callback: (message: ChatMessage) => void): void {
    if (!this.connection) {
      throw new Error("Not connected to ChatHub")
    }
    this.connection.on("ReceiveMessage", callback)
  }

  // Kullanıcı yazıyor event listener'ı
  onUserTyping(callback: (event: UserTypingEvent) => void): void {
    if (!this.connection) {
      throw new Error("Not connected to ChatHub")
    }
    this.connection.on("UserTyping", callback)
  }

  // Mesaj okundu event listener'ı
  onMessageRead(callback: (event: MessageReadEvent) => void): void {
    if (!this.connection) {
      throw new Error("Not connected to ChatHub")
    }
    this.connection.on("MessageRead", callback)
  }

  // Kullanıcı katıldı event listener'ı
  onUserJoined(callback: (event: UserJoinedEvent) => void): void {
    if (!this.connection) {
      throw new Error("Not connected to ChatHub")
    }
    this.connection.on("UserJoined", callback)
  }

  // Kullanıcı ayrıldı event listener'ı
  onUserLeft(callback: (event: UserJoinedEvent) => void): void {
    if (!this.connection) {
      throw new Error("Not connected to ChatHub")
    }
    this.connection.on("UserLeft", callback)
  }

  // Event listener'ı kaldır
  off(eventName: string): void {
    if (this.connection) {
      this.connection.off(eventName)
    }
  }
}

// Singleton instance
let signalRServiceInstance: SignalRService | null = null

export const getSignalRService = (): SignalRService => {
  if (!signalRServiceInstance) {
    signalRServiceInstance = new SignalRService()
  }
  return signalRServiceInstance
}
