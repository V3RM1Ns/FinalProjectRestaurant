"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OrderChat } from "./order-chat"

interface ChatButtonProps {
  orderId: string
  orderInfo?: {
    restaurantName?: string
    customerName?: string
    deliveryPersonName?: string
  }
  unreadCount?: number
  className?: string
}

export function ChatButton({ orderId, orderInfo, unreadCount = 0, className }: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Mesajlaşma
        {unreadCount > 0 && (
          <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-xs">
            {unreadCount}
          </Badge>
        )}
      </Button>

      <OrderChat
        orderId={orderId}
        orderInfo={orderInfo}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
