"use client"

import { OrderChat } from "./order-chat"

interface ChatDialogProps {
  orderId: string
  orderInfo?: {
    restaurantName?: string
    customerName?: string
    deliveryPersonName?: string
  }
  isOpen: boolean
  onClose: () => void
}

export function ChatDialog({ orderId, orderInfo, isOpen, onClose }: ChatDialogProps) {
  return (
    <OrderChat
      orderId={orderId}
      orderInfo={orderInfo}
      isOpen={isOpen}
      onClose={onClose}
    />
  )
}
