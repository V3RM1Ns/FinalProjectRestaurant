"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MessageCircle, Loader2, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { getSignalRService, ChatMessage } from "@/lib/signalr-service"
import { chatApi } from "@/lib/chat-api"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface OrderChatProps {
  orderId: string
  orderInfo?: {
    restaurantName?: string
    customerName?: string
    deliveryPersonName?: string
  }
  isOpen: boolean
  onClose: () => void
}

export function OrderChat({ orderId, orderInfo, isOpen, onClose }: OrderChatProps) {
  const { user, getToken } = useAuth()
  const { toast } = useToast()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Chat'i başlat ve bağlan
  useEffect(() => {
    if (!isOpen || !orderId || !user) return

    const initChat = async () => {
      setIsConnecting(true)
      try {
        // Token'ı al
        const token = await getToken()
        if (!token) {
          throw new Error("Token not found")
        }

        // SignalR servisini al
        const signalRService = getSignalRService()

        // Bağlantı kurulmamışsa kur
        if (!signalRService.isConnected()) {
          await signalRService.connect(token)
        }

        // Chat geçmişini yükle
        const history = await chatApi.getChatHistory(orderId)
        setMessages(history)

        // Chat odasına katıl
        await signalRService.joinOrderChat(orderId)
        setIsConnected(true)

        // Event listener'ları ekle
        signalRService.onReceiveMessage((message) => {
          if (message.orderId === orderId) {
            setMessages((prev) => {
              // Duplicate mesaj kontrolü
              if (prev.some((m) => m.id === message.id)) {
                return prev
              }
              return [...prev, message]
            })

            // Kendi mesajı değilse okundu olarak işaretle
            if (message.senderId !== user.id) {
              signalRService.markMessageAsRead(message.id)
            }
          }
        })

        signalRService.onUserTyping((event) => {
          if (event.orderId === orderId && event.userId !== user.id) {
            setOtherUserTyping(event.isTyping)
            // 3 saniye sonra yazıyor göstergesini kaldır
            if (event.isTyping) {
              setTimeout(() => setOtherUserTyping(false), 3000)
            }
          }
        })

        signalRService.onMessageRead((event) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === event.messageId ? { ...msg, isRead: true } : msg
            )
          )
        })

        // Okunmamış mesajları işaretle
        await chatApi.markAllAsRead(orderId)
      } catch (error: any) {
        console.error("❌ Error initializing chat:", error)
        toast({
          title: "Hata",
          description: error.message || "Chat bağlantısı kurulamadı",
          variant: "destructive",
        })
      } finally {
        setIsConnecting(false)
      }
    }

    initChat()

    // Cleanup
    return () => {
      const signalRService = getSignalRService()
      if (signalRService.isConnected()) {
        signalRService.leaveOrderChat(orderId).catch(console.error)
      }
    }
  }, [isOpen, orderId, user, getToken, toast])

  // Otomatik scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Mesaj gönder
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || isSending || !isConnected) return

    setIsSending(true)
    try {
      const signalRService = getSignalRService()
      await signalRService.sendMessage(orderId, newMessage.trim())
      setNewMessage("")
      
      // Yazıyor göstergesini kapat
      await signalRService.sendTypingIndicator(orderId, false)
    } catch (error: any) {
      console.error("❌ Error sending message:", error)
      toast({
        title: "Hata",
        description: "Mesaj gönderilemedi",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  // Yazıyor göstergesi
  const handleTyping = () => {
    if (!isConnected) return

    const signalRService = getSignalRService()
    signalRService.sendTypingIndicator(orderId, true)

    // Timeout varsa temizle
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // 2 saniye sonra yazıyor göstergesini kapat
    typingTimeoutRef.current = setTimeout(() => {
      signalRService.sendTypingIndicator(orderId, false)
    }, 2000)
  }

  // Mesaj inputu değiştiğinde
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    handleTyping()
  }

  // Mesaj tarihi formatla
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Şimdi"
    if (diffMins < 60) return `${diffMins} dakika önce`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} saat önce`
    
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Sipariş Mesajlaşma
              </DialogTitle>
              {orderInfo && (
                <p className="text-sm text-muted-foreground mt-1">
                  {user?.role === "Customer" 
                    ? orderInfo.deliveryPersonName || "Kurye"
                    : orderInfo.customerName || "Müşteri"}
                </p>
              )}
            </div>
            {isConnected && (
              <Badge variant="outline" className="bg-green-50">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                Çevrimiçi
              </Badge>
            )}
          </div>
        </DialogHeader>

        {isConnecting ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Bağlantı kuruluyor...</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Henüz mesaj yok. İlk mesajı gönderin!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.senderId === user?.id
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-2",
                          isOwn ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-lg px-4 py-2 max-w-[80%]",
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {!isOwn && (
                            <p className="text-xs font-medium mb-1">
                              {message.senderName}
                            </p>
                          )}
                          <p className="text-sm break-words">{message.content}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs opacity-70">
                              {formatMessageTime(message.timestamp)}
                            </p>
                            {isOwn && message.isRead && (
                              <span className="text-xs opacity-70">✓✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                {otherUserTyping && (
                  <div className="flex gap-2">
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Mesajınızı yazın..."
                  disabled={!isConnected || isSending}
                  className="flex-1"
                  maxLength={500}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim() || !isConnected || isSending}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
