"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Package, Calendar, Users, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Order {
  id: string
  customerName: string
  items: Array<{ name: string; quantity: number }>
  total: number
  status: "Pending" | "Preparing" | "Ready" | "Delivered"
  createdAt: string
  address: string
}

interface Reservation {
  id: string
  customerName: string
  date: string
  time: string
  guestCount: number
  status: "Pending" | "Confirmed" | "Seated" | "Completed"
  tableNumber: string
}

const mockOrders: Order[] = [
  {
    id: "ORD001",
    customerName: "Ahmet Yılmaz",
    items: [
      { name: "İskender Kebap", quantity: 2 },
      { name: "Ayran", quantity: 2 },
    ],
    total: 405,
    status: "Pending",
    createdAt: "2025-10-17T14:30:00",
    address: "Kadıköy, İstanbul",
  },
  {
    id: "ORD002",
    customerName: "Zeynep Kaya",
    items: [
      { name: "Adana Kebap", quantity: 1 },
      { name: "Mercimek Çorbası", quantity: 1 },
    ],
    total: 195,
    status: "Preparing",
    createdAt: "2025-10-17T14:45:00",
    address: "Beşiktaş, İstanbul",
  },
  {
    id: "ORD003",
    customerName: "Mehmet Demir",
    items: [{ name: "Kuzu Tandır", quantity: 1 }],
    total: 235,
    status: "Ready",
    createdAt: "2025-10-17T15:00:00",
    address: "Şişli, İstanbul",
  },
]

const mockReservations: Reservation[] = [
  {
    id: "RES001",
    customerName: "Ayşe Öztürk",
    date: "2025-10-17",
    time: "19:00",
    guestCount: 4,
    status: "Confirmed",
    tableNumber: "12",
  },
  {
    id: "RES002",
    customerName: "Can Yıldız",
    date: "2025-10-17",
    time: "20:00",
    guestCount: 2,
    status: "Pending",
    tableNumber: "5",
  },
  {
    id: "RES003",
    customerName: "Elif Arslan",
    date: "2025-10-17",
    time: "20:30",
    guestCount: 6,
    status: "Confirmed",
    tableNumber: "8",
  },
]

const orderStatusConfig = {
  Pending: { label: "Onay Bekliyor", variant: "secondary" as const, next: "Preparing" },
  Preparing: { label: "Hazırlanıyor", variant: "default" as const, next: "Ready" },
  Ready: { label: "Hazır", variant: "default" as const, next: "Delivered" },
  Delivered: { label: "Teslim Edildi", variant: "outline" as const, next: null },
}

const reservationStatusConfig = {
  Pending: { label: "Onay Bekliyor", variant: "secondary" as const, next: "Confirmed" },
  Confirmed: { label: "Onaylandı", variant: "default" as const, next: "Seated" },
  Seated: { label: "Oturdu", variant: "default" as const, next: "Completed" },
  Completed: { label: "Tamamlandı", variant: "outline" as const, next: null },
}

export default function EmployeeDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      setOrders(mockOrders)
      setReservations(mockReservations)
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    setOrders(
      orders.map((order) => (order.id === orderId ? { ...order, status: newStatus as Order["status"] } : order)),
    )
    toast({ title: "Sipariş durumu güncellendi" })
  }

  const handleUpdateReservationStatus = async (reservationId: string, newStatus: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    setReservations(
      reservations.map((res) =>
        res.id === reservationId ? { ...res, status: newStatus as Reservation["status"] } : res,
      ),
    )
    toast({ title: "Rezervasyon durumu güncellendi" })
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const todayOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt).toDateString()
    const today = new Date().toDateString()
    return orderDate === today
  })

  const todayReservations = reservations.filter((res) => {
    const resDate = new Date(res.date).toDateString()
    const today = new Date().toDateString()
    return resDate === today
  })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Çalışan Paneli</h1>
        <p className="text-muted-foreground">Bugünkü siparişler ve rezervasyonlar</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bekleyen Siparişler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayOrders.filter((o) => o.status === "Pending").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hazırlanan Siparişler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayOrders.filter((o) => o.status === "Preparing").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bekleyen Rezervasyonlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayReservations.filter((r) => r.status === "Pending").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Onaylı Rezervasyonlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayReservations.filter((r) => r.status === "Confirmed").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders and Reservations Tabs */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="orders" className="gap-2">
            <Package className="h-4 w-4" />
            Siparişler ({todayOrders.length})
          </TabsTrigger>
          <TabsTrigger value="reservations" className="gap-2">
            <Calendar className="h-4 w-4" />
            Rezervasyonlar ({todayReservations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          {todayOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Bugün sipariş yok</h3>
                <p className="text-muted-foreground">Yeni siparişler burada görünecek</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {todayOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">Sipariş #{order.id}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(order.createdAt).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </CardDescription>
                      </div>
                      <Badge variant={orderStatusConfig[order.status].variant}>
                        {orderStatusConfig[order.status].label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Müşteri: {order.customerName}</p>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{order.address}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Ürünler:</p>
                      <ul className="space-y-1">
                        {order.items.map((item, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            • {item.name} x{item.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-bold">Toplam: ₺{order.total}</span>
                      {orderStatusConfig[order.status].next && (
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Onay Bekliyor</SelectItem>
                            <SelectItem value="Preparing">Hazırlanıyor</SelectItem>
                            <SelectItem value="Ready">Hazır</SelectItem>
                            <SelectItem value="Delivered">Teslim Edildi</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reservations">
          {todayReservations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Bugün rezervasyon yok</h3>
                <p className="text-muted-foreground">Yeni rezervasyonlar burada görünecek</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {todayReservations.map((reservation) => (
                <Card key={reservation.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">Rezervasyon #{reservation.id}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3" />
                          {reservation.time}
                        </CardDescription>
                      </div>
                      <Badge variant={reservationStatusConfig[reservation.status].variant}>
                        {reservationStatusConfig[reservation.status].label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Müşteri</p>
                        <p className="font-medium">{reservation.customerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Masa</p>
                        <p className="font-medium">Masa {reservation.tableNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Kişi Sayısı</p>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">{reservation.guestCount} Kişi</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Tarih</p>
                        <p className="font-medium">
                          {new Date(reservation.date).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                          })}
                        </p>
                      </div>
                    </div>

                    {reservationStatusConfig[reservation.status].next && (
                      <div className="pt-2 border-t">
                        <Select
                          value={reservation.status}
                          onValueChange={(value) => handleUpdateReservationStatus(reservation.id, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Onay Bekliyor</SelectItem>
                            <SelectItem value="Confirmed">Onaylandı</SelectItem>
                            <SelectItem value="Seated">Oturdu</SelectItem>
                            <SelectItem value="Completed">Tamamlandı</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
