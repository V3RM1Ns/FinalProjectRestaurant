"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { ChatDialog } from "./chat-dialog"

interface ChatButtonProps {
  restaurantId: string
  restaurantName: string
}

export function ChatButton({ restaurantId, restaurantName }: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      <ChatDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        restaurantId={restaurantId}
        restaurantName={restaurantName}
      />
    </>
  )
}
