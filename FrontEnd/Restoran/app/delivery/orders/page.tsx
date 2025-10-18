"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, MapPin, Phone, Clock, DollarSign, CheckCircle, Navigation } from "lucide-react"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface DeliveryOrder {
  id: string
  orderNumber: string
  restaurantName: string
  restaurantAddress: string
  restaurantPhone: string
  customerName: string
  customerAddress: string
  customerPhone: string
  totalAmount: number
  status: "Assigned" | "PickedUp" | "InTransit" | "Delivered"
  orderDate: string
  items: Array<{ name: string; quantity: number }>
  deliveryFee: number
}

export default function DeliveryOrdersPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeOrders, setActiveOrders] = useState<DeliveryOrder[]>([])
  const [completedOrders, setCompletedOrders] = useState<DeliveryOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [todayEarnings, setTodayEarnings] = useState(0)
  const [totalDeliveries, setTotalDeliveries] = useState(0)

  useEffect(() => {
    // Mock API call to fetch delivery orders
    const fetchDeliveryOrders = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800))

      const mockActiveOrders: DeliveryOrder[] = [
        {
          id: "1",
          orderNumber: "#12345",
          restaurantName: "Sultanahmet Köftecisi",
          restaurantAddress: "Sultanahmet Mah. Divan Yolu Cad. No:12, Fatih/İstanbul",
          restaurantPhone: "+90 212 555 0001",
          customerName: "Ahmet Yılmaz",
          customerAddress: "Kadıköy Mah. Bahariye Cad. No:45 D:3, Kadıköy/İstanbul",
          customerPhone: "+90 532 111 2233",
          totalAmount: 125.5,
          status: "Assigned",
          orderDate: new Date().toISOString(),
          items: [
            { name: "İskender Kebap", quantity: 2 },
            { name: "Ayran", quantity: 2 },
          ],
          deliveryFee: 15.0,
        },
        {
          id: "2",
          orderNumber: "#12346",
          restaurantName: "Pizza Napoli",
          restaurantAddress: "Beyoğlu Mah. İstiklal Cad. No:78, Beyoğlu/İstanbul",
          restaurantPhone: "+90 212 555 0002",
          customerName: "Zeynep Kaya",
          customerAddress: "Beşiktaş Mah. Barbaros Bulvarı No:23 D:8, Beşiktaş/İstanbul",
          customerPhone: "+90 533 444 5566",
          totalAmount: 89.0,
          status: "PickedUp",
          orderDate: new Date().toISOString(),
          items: [
            { name: "Margherita Pizza", quantity: 1 },
            { name: "Caesar Salad", quantity: 1 },
          ],
          deliveryFee: 12.0,
        },
      ]

      const mockCompletedOrders: DeliveryOrder[] = [
        {
          id: "3",
          orderNumber: "#12344",
          restaurantName: "Burger House",
          restaurantAddress: "Şişli Mah. Halaskargazi Cad. No:56, Şişli/İstanbul",
          restaurantPhone: "+90 212 555 0003",
          customerName: "Mehmet Demir",
          customerAddress: "Mecidiyeköy Mah. Büyükdere Cad. No:101 D:15, Şişli/İstanbul",
          customerPhone: "+90 534 777 8899",
          totalAmount: 67.5,
          status: "Delivered",
          orderDate: new Date(Date.now() - 3600000).toISOString(),
          items: [{ name: "Classic Burger", quantity: 2 }],
          deliveryFee: 10.0,
        },
      ]

      setActiveOrders(mockActiveOrders)
      setCompletedOrders(mockCompletedOrders)
      setTodayEarnings(37.0)
      setTotalDeliveries(8)
      setLoading(false)
    }

    fetchDeliveryOrders()
  }, [])

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setActiveOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: newStatus as DeliveryOrder["status"] } : order)),
    )

    toast({
      title: "Durum Güncellendi",
      description: `Sipariş durumu ${newStatus} olarak güncellendi`,
    })

    // If delivered, move to completed
    if (newStatus === "Delivered") {
      setTimeout(() => {
        const deliveredOrder = activeOrders.find((o) => o.id === orderId)
        if (deliveredOrder) {
          setActiveOrders((prev) => prev.filter((o) => o.id !== orderId))
          setCompletedOrders((prev) => [{ ...deliveredOrder, status: "Delivered" }, ...prev])
          setTodayEarnings((prev) => prev + deliveredOrder.deliveryFee)
          setTotalDeliveries((prev) => prev + 1)
        }
      }, 500)
    }
  }

  const getStatusBadgeVariant = (status: DeliveryOrder["status"]) => {
    switch (status) {
      case "Assigned":
        return "secondary"
      case "PickedUp":
        return "default"
      case "InTransit":
        return "default"
      case "Delivered":
        return "default"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status: DeliveryOrder["status"]) => {
    switch (status) {
      case "Assigned":
        return "Atandı"
      case "PickedUp":
        return "Alındı"
      case "InTransit":
        return "Yolda"
      case "Delivered":
        return "Teslim Edildi"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Teslimat Paneli</h1>
        <p className="text-muted-foreground">Hoş geldiniz, {user?.fullName}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aktif Teslimatlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-3xl font-bold">{activeOrders.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bugünkü Kazanç</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-3xl font-bold">{todayEarnings.toFixed(2)} ₺</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Teslimat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span className="text-3xl font-bold">{totalDeliveries}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Aktif Siparişler ({activeOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Tamamlanan ({completedOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">Aktif teslimat yok</p>
              </CardContent>
            </Card>
          ) : (
            activeOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Sipariş {order.orderNumber}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(order.orderDate).toLocaleTimeString("tr-TR")}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusBadgeVariant(order.status)}>{getStatusText(order.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Restaurant Info */}
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Restoran
                    </h4>
                    <p className="font-medium">{order.restaurantName}</p>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{order.restaurantAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${order.restaurantPhone}`} className="hover:underline">
                        {order.restaurantPhone}
                      </a>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Navigation className="h-4 w-4" />
                      Müşteri
                    </h4>
                    <p className="font-medium">{order.customerName}</p>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{order.customerAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${order.customerPhone}`} className="hover:underline">
                        {order.customerPhone}
                      </a>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold mb-2">Sipariş İçeriği</h4>
                    <ul className="space-y-1">
                      {order.items.map((item, index) => (
                        <li key={index} className="text-sm">
                          {item.quantity}x {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Toplam Tutar</p>
                      <p className="text-2xl font-bold">{order.totalAmount.toFixed(2)} ₺</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Teslimat Ücreti</p>
                      <p className="text-xl font-semibold text-green-600">{order.deliveryFee.toFixed(2)} ₺</p>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="flex gap-2">
                    <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Assigned">Atandı</SelectItem>
                        <SelectItem value="PickedUp">Alındı</SelectItem>
                        <SelectItem value="InTransit">Yolda</SelectItem>
                        <SelectItem value="Delivered">Teslim Edildi</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" asChild>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.customerAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Navigation className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">Tamamlanmış teslimat yok</p>
              </CardContent>
            </Card>
          ) : (
            completedOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Sipariş {order.orderNumber}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(order.orderDate).toLocaleTimeString("tr-TR")}
                      </CardDescription>
                    </div>
                    <Badge variant="default">Teslim Edildi</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Müşteri</p>
                      <p className="font-medium">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Kazanç</p>
                      <p className="text-xl font-semibold text-green-600">{order.deliveryFee.toFixed(2)} ₺</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
