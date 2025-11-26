"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, MapPin, Phone, Clock, DollarSign, CheckCircle, Navigation, Bike, MessageCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { DeliveryApiService } from "@/lib/delivery-api"
import { Order, OrderStatus } from "@/types"
import { ChatButton } from "@/components/chat/chat-button"

export default function DeliveryOrdersPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [availableOrders, setAvailableOrders] = useState<Order[]>([])
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    // Her 30 saniyede bir yenile
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const [available, myOrdersData] = await Promise.all([
        DeliveryApiService.getAvailableOrders(1, 20),
        DeliveryApiService.getMyOrders(1, 20),
      ])

      setAvailableOrders(available.items || [])
      setMyOrders(myOrdersData.items || [])

      // Aktif siparişi bul (status=4 OutForDelivery durumunda)
      const active = myOrdersData.items?.find(
        (order: Order) => order.status === 4 || order.status === OrderStatus.OutForDelivery,
      )
      setActiveOrder(active || null)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Hata",
        description: "Siparişler yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptOrder = async (orderId: string) => {
    if (activeOrder) {
      toast({
        title: "Uyarı",
        description: "Zaten aktif bir teslimatınız var. Önce onu tamamlayın.",
        variant: "destructive",
      })
      return
    }

    try {
      await DeliveryApiService.acceptOrder(orderId)
      toast({
        title: "Başarılı",
        description: "Sipariş kabul edildi. Teslimat başladı!",
      })
      await fetchOrders()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Sipariş kabul edilirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await DeliveryApiService.updateOrderStatus(orderId, newStatus)
      toast({
        title: "Başarılı",
        description: "Sipariş durumu güncellendi",
      })
      await fetchOrders()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Durum güncellenirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig: Partial<Record<OrderStatus, { label: string; variant: "secondary" | "default" | "outline" }>> = {
      [OrderStatus.Ready]: { label: "Hazır", variant: "secondary" },
      [OrderStatus.OutForDelivery]: { label: "Yolda", variant: "default" },
      [OrderStatus.Delivered]: { label: "Teslim Edildi", variant: "outline" },
      [OrderStatus.Completed]: { label: "Tamamlandı", variant: "outline" },
    }

    const config = statusConfig[status] || { label: status, variant: "secondary" as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bike className="h-8 w-8" />
            Teslimat Paneli
          </h1>
          <p className="text-muted-foreground mt-1">
            Hoş geldiniz, {user?.fullName || "Kurye"}
          </p>
        </div>
        <Button onClick={fetchOrders} disabled={loading}>
          Yenile
        </Button>
      </div>

      {/* Aktif Teslimat */}
      {activeOrder && (
        <Card className="border-primary">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Aktif Teslimat
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Teslimat Adresi:</span>
                </div>
                <p className="text-sm ml-6">{activeOrder.deliveryAddress}</p>
              </div>
              {getStatusBadge(activeOrder.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Sipariş Tutarı</p>
                <p className="text-xl font-bold">{formatCurrency(activeOrder.totalAmount)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Sipariş Zamanı</p>
                <p className="text-sm">{formatDate(activeOrder.orderDate)}</p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <p className="font-medium">Sipariş Detayları</p>
              {(activeOrder.items || activeOrder.orderItems)?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                  <span>
                    {item.quantity}x {item.menuItemName || item.menuItem?.name}
                  </span>
                  <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <ChatButton 
                orderId={activeOrder.id}
                orderInfo={{
                  customerName: activeOrder.customerName,
                  restaurantName: activeOrder.restaurantName
                }}
                className="flex-1"
              />
              <Button
                onClick={() => handleUpdateStatus(activeOrder.id, OrderStatus.Delivered)}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Teslim Edildi Olarak İşaretle
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">
            Müsait Siparişler ({availableOrders.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Aktif Alınan Sipariş ({activeOrder ? 1 : 0})
          </TabsTrigger>
          <TabsTrigger value="history">
            Geçmiş Siparişlerim (
            {myOrders.filter((o) => o.status === OrderStatus.Delivered || o.status === OrderStatus.Completed).length})
          </TabsTrigger>
        </TabsList>

        {/* Müsait Siparişler */}
        <TabsContent value="available" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Yükleniyor...</p>
              </CardContent>
            </Card>
          ) : availableOrders.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Şu anda müsait sipariş bulunmuyor</p>
              </CardContent>
            </Card>
          ) : (
            availableOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Teslimat Adresi:</span>
                      </div>
                      <p className="text-sm ml-6">{order.deliveryAddress}</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Tutar</p>
                      <p className="font-bold">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Ürün Sayısı</p>
                      <p className="font-medium">{order.orderItems?.length || 0} ürün</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Zaman</p>
                      <p className="text-sm">{formatDate(order.orderDate)}</p>
                    </div>
                  </div>

                  {order.specialRequests && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Özel İstekler:</p>
                      <p className="text-sm mt-1">{order.specialRequests}</p>
                    </div>
                  )}

                  <Button
                    onClick={() => handleAcceptOrder(order.id)}
                    disabled={!!activeOrder}
                    className="w-full"
                  >
                    <Bike className="h-4 w-4 mr-2" />
                    {activeOrder ? "Zaten Aktif Teslimatınız Var" : "Siparişi Al"}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Aktif Alınan Sipariş Sekmesi */}
        <TabsContent value="active" className="space-y-4">
          {!activeOrder ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Bike className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Aktif teslimatınız bulunmuyor</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Müsait Siparişler sekmesinden bir sipariş alabilirsiniz
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Aktif Teslimat
                </CardTitle>
                <CardDescription>Sipariş ID: {activeOrder.id.slice(0, 8)}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Teslimat Adresi:</span>
                    </div>
                    <p className="text-sm ml-6">{activeOrder.deliveryAddress}</p>
                    
                    {activeOrder.customerPhone && (
                      <div className="flex items-center gap-2 mt-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Telefon:</span>
                        <a href={`tel:${activeOrder.customerPhone}`} className="text-primary hover:underline">
                          {activeOrder.customerPhone}
                        </a>
                      </div>
                    )}
                  </div>
                  {getStatusBadge(activeOrder.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Sipariş Tutarı</p>
                    <p className="text-xl font-bold">{formatCurrency(activeOrder.totalAmount)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Sipariş Zamanı</p>
                    <p className="text-sm">{formatDate(activeOrder.orderDate)}</p>
                  </div>
                </div>

                {activeOrder.specialRequests && (
                  <div className="pt-4 border-t">
                    <p className="font-medium mb-2">Özel İstekler:</p>
                    <p className="text-sm text-muted-foreground">{activeOrder.specialRequests}</p>
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t">
                  <p className="font-medium">Sipariş Detayları</p>
                  {(activeOrder.items || activeOrder.orderItems)?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                      <span>
                        {item.quantity}x {item.menuItemName || item.menuItem?.name}
                      </span>
                      <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-4">
                  <ChatButton 
                    orderId={activeOrder.id}
                    orderInfo={{
                      customerName: activeOrder.customerName,
                      restaurantName: activeOrder.restaurantName
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleUpdateStatus(activeOrder.id, OrderStatus.Delivered)}
                    className="flex-1"
                    size="lg"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Teslim Edildi Olarak İşaretle
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Geçmiş Siparişler */}
        <TabsContent value="history" className="space-y-4">
          {myOrders
            .filter((order) => order.status === OrderStatus.Delivered || order.status === OrderStatus.Completed)
            .map((order) => (
              <Card key={order.id}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Teslimat Adresi:</p>
                      <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Tutar</p>
                      <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Teslim Zamanı</p>
                      <p className="text-sm">{order.completedAt ? formatDate(order.completedAt) : "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sipariş Zamanı</p>
                      <p className="text-sm">{formatDate(order.orderDate)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
