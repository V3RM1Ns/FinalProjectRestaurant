"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, Package, Calendar, MessageCircle } from "lucide-react"

interface Notification {
  id: string
  type: "order" | "reservation" | "message"
  title: string
  message: string
  timestamp: string
  isRead: boolean
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Mock initial notifications
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "order",
        title: "Sipariş Durumu Güncellendi",
        message: "Siparişiniz hazırlanıyor",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        isRead: false,
      },
      {
        id: "2",
        type: "reservation",
        title: "Rezervasyon Onaylandı",
        message: "17 Ekim 19:00 rezervasyonunuz onaylandı",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: false,
      },
    ]
    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter((n) => !n.isRead).length)
  }, [])

  // Simulate SignalR real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly receive a notification (5% chance every 10 seconds)
      if (Math.random() < 0.05) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: "order",
          title: "Sipariş Durumu Güncellendi",
          message: "Siparişiniz yola çıktı",
          timestamp: new Date().toISOString(),
          isRead: false,
        }

        setNotifications((prev) => [newNotification, ...prev])
        setUnreadCount((prev) => prev + 1)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "order":
        return <Package className="h-4 w-4" />
      case "reservation":
        return <Calendar className="h-4 w-4" />
      case "message":
        return <MessageCircle className="h-4 w-4" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-semibold">Bildirimler</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-auto p-0 text-xs">
              Tümünü Okundu İşaretle
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Bildirim yok</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn("flex items-start gap-3 p-4 cursor-pointer", !notification.isRead && "bg-accent/50")}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="mt-0.5">{getIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    {!notification.isRead && <div className="h-2 w-2 bg-primary rounded-full shrink-0 mt-1" />}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notification.timestamp).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
