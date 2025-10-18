"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, Clock } from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  restaurantName: string
  items: Array<{ name: string; quantity: number; price: number }>
  total: number
  status: "Pending" | "Preparing" | "OnTheWay" | "Delivered"
  createdAt: string
}

const mockOrders: Order[] = [
  {
    id: "abc123",
    restaurantName: "Lezzet Durağı",
    items: [
      { name: "İskender Kebap", quantity: 2, price: 180 },
      { name: "Ayran", quantity: 2, price: 15 },
    ],
    total: 405,
    status: "OnTheWay",
    createdAt: "2025-10-17T14:30:00",
  },
  {
    id: "def456",
    restaurantName: "Pizza Palace",
    items: [
      { name: "Margherita Pizza", quantity: 1, price: 120 },
      { name: "Cola", quantity: 1, price: 20 },
    ],
    total: 155,
    status: "Delivered",
    createdAt: "2025-10-15T19:00:00",
  },
]

const statusConfig = {
  Pending: { label: "Onay Bekliyor", variant: "secondary" as const },
  Preparing: { label: "Hazırlanıyor", variant: "default" as const },
  OnTheWay: { label: "Yolda", variant: "default" as const },
  Delivered: { label: "Teslim Edildi", variant: "outline" as const },
}

export default function OrdersPage() {
  const [orders] = useState<Order[]>(mockOrders)

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-2">Siparişlerim</h1>
      <p className="text-muted-foreground mb-8">Geçmiş ve aktif siparişleriniz</p>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Henüz siparişiniz yok</h3>
            <p className="text-muted-foreground mb-4">Favori restoranlarınızdan sipariş verin</p>
            <Link href="/restaurants">
              <Button>Restoranları Keşfet</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{order.restaurantName}</CardTitle>
                    <CardDescription>
                      Sipariş #{order.id} •{" "}
                      {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardDescription>
                  </div>
                  <Badge variant={statusConfig[order.status].variant}>{statusConfig[order.status].label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>₺{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between font-bold">
                  <span>Toplam</span>
                  <span>₺{order.total.toFixed(2)}</span>
                </div>

                {order.status !== "Delivered" && (
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Clock className="mr-2 h-4 w-4" />
                      Siparişi Takip Et
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
