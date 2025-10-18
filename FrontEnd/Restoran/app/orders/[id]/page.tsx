"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Clock, Truck, Package } from "lucide-react"

type OrderStatus = "Pending" | "Preparing" | "OnTheWay" | "Delivered"

const statusConfig = {
  Pending: { label: "Onay Bekliyor", icon: Clock, color: "bg-yellow-500" },
  Preparing: { label: "Hazırlanıyor", icon: Package, color: "bg-blue-500" },
  OnTheWay: { label: "Yolda", icon: Truck, color: "bg-purple-500" },
  Delivered: { label: "Teslim Edildi", icon: CheckCircle2, color: "bg-green-500" },
}

export default function OrderTrackingPage() {
  const params = useParams()
  const [status, setStatus] = useState<OrderStatus>("Pending")
  const [orderDetails] = useState({
    id: params.id,
    restaurantName: "Lezzet Durağı",
    items: [
      { name: "İskender Kebap", quantity: 2, price: 180 },
      { name: "Ayran", quantity: 2, price: 15 },
    ],
    total: 405,
    address: "Kadıköy Moda Caddesi No: 45, İstanbul",
    estimatedTime: "30-40 dk",
  })

  // Simulate real-time status updates (SignalR mockup)
  useEffect(() => {
    const statuses: OrderStatus[] = ["Pending", "Preparing", "OnTheWay", "Delivered"]
    let currentIndex = 0

    const interval = setInterval(() => {
      currentIndex++
      if (currentIndex < statuses.length) {
        setStatus(statuses[currentIndex])
      } else {
        clearInterval(interval)
      }
    }, 5000) // Change status every 5 seconds for demo

    return () => clearInterval(interval)
  }, [])

  const currentStatusIndex = Object.keys(statusConfig).indexOf(status)

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-2">Sipariş Takibi</h1>
      <p className="text-muted-foreground mb-8">Sipariş No: #{orderDetails.id}</p>

      {/* Status Timeline */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sipariş Durumu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(statusConfig).map(([key, config], index) => {
              const Icon = config.icon
              const isActive = index <= currentStatusIndex
              const isCurrent = index === currentStatusIndex

              return (
                <div key={key} className="flex items-start gap-4">
                  <div className="relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isActive ? config.color : "bg-muted"
                      } transition-colors`}
                    >
                      <Icon className={`h-6 w-6 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                    </div>
                    {index < Object.keys(statusConfig).length - 1 && (
                      <div
                        className={`absolute left-1/2 top-12 w-0.5 h-8 -translate-x-1/2 ${
                          isActive ? "bg-primary" : "bg-muted"
                        } transition-colors`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {config.label}
                      </h3>
                      {isCurrent && (
                        <Badge variant="default" className="animate-pulse">
                          Şu an
                        </Badge>
                      )}
                    </div>
                    {isCurrent && (
                      <p className="text-sm text-muted-foreground">Tahmini teslimat: {orderDetails.estimatedTime}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sipariş Detayları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{orderDetails.restaurantName}</h3>
            <div className="space-y-2">
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>₺{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex justify-between font-bold">
            <span>Toplam</span>
            <span>₺{orderDetails.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle>Teslimat Adresi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{orderDetails.address}</p>
        </CardContent>
      </Card>
    </div>
  )
}
