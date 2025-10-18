"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  isOwn: boolean
}

interface ChatDialogProps {
  isOpen: boolean
  onClose: () => void
  restaurantId: string
  restaurantName: string
}

export function ChatDialog({ isOpen, onClose, restaurantId, restaurantName }: ChatDialogProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  // Mock initial messages
  useEffect(() => {
    if (isOpen) {
      const mockMessages: Message[] = [
        {
          id: "1",
          senderId: "restaurant",
          senderName: restaurantName,
          content: "Merhaba! Size nasıl yardımcı olabiliriz?",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          isOwn: false,
        },
      ]
      setMessages(mockMessages)
    }
  }, [isOpen, restaurantName])

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Simulate SignalR real-time message receiving
  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(() => {
      // Randomly receive a message (10% chance every 5 seconds)
      if (Math.random() < 0.1) {
        const responses = [
          "Siparişiniz hazırlanıyor.",
          "Tahmini teslimat süresi 30 dakikadır.",
          "Teşekkür ederiz!",
          "Size yardımcı olabilir miyiz?",
        ]
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            senderId: "restaurant",
            senderName: restaurantName,
            content: randomResponse,
            timestamp: new Date().toISOString(),
            isOwn: false,
          },
        ])
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isOpen, restaurantName])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.fullName,
      content: newMessage,
      timestamp: new Date().toISOString(),
      isOwn: true,
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{restaurantName}</DialogTitle>
          <p className="text-sm text-muted-foreground">Restoran ile mesajlaşın</p>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.isOwn ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[70%] rounded-lg px-4 py-2",
                    message.isOwn ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  {!message.isOwn && <p className="text-xs font-semibold mb-1">{message.senderName}</p>}
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      message.isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
                    )}
                  >
                    {new Date(message.timestamp).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="px-6 py-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Mesajınızı yazın..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
