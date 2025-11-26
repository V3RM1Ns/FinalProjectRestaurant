"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { employeeApi, type Order } from "@/lib/employee-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ShoppingBag, Eye, Clock, DollarSign, TrendingUp, Package, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Backend enum mappings
enum OrderStatus {
  Pending = 0,
  Confirmed = 1,
  Preparing = 2,
  Ready = 3,
  OutForDelivery = 4,
  Delivered = 5,
  Completed = 6,
  Cancelled = 7
}

enum OrderType {
  DineIn = 0,
  TakeAway = 1,
  Delivery = 2
}

interface OrderStats {
  activeCount: number
  todayOrders: Order[]
  todayRevenue: number
  completedToday: number
}

export default function EmployeeOrdersPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [stats, setStats] = useState<OrderStats>({
    activeCount: 0,
    todayOrders: [],
    todayRevenue: 0,
    completedToday: 0
  })
  const [viewMode, setViewMode] = useState<"all" | "today">("all")

  useEffect(() => {
    if (user?.employerRestaurantId) {
      loadOrders()
      loadStats()
    }
  }, [user, selectedStatus, currentPage, viewMode])

  const loadStats = async () => {
    if (!user?.employerRestaurantId) return

    try {
      const [activeCountRes, todayOrdersRes] = await Promise.all([
        employeeApi.orders.getActiveCount(user.employerRestaurantId),
        employeeApi.orders.getTodayOrders(user.employerRestaurantId)
      ])

      const todayRevenue = todayOrdersRes.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      const completedToday = todayOrdersRes.filter(o => 
        o.status === OrderStatus.Completed || o.status === OrderStatus.Delivered
      ).length

      setStats({
        activeCount: activeCountRes.count || 0,
        todayOrders: todayOrdersRes,
        todayRevenue,
        completedToday
      })
    } catch (error) {
      console.error("İstatistikler yüklenirken hata:", error)
    }
  }

  const loadOrders = async () => {
    if (!user?.employerRestaurantId) return

    try {
      setIsLoading(true)
      
      if (viewMode === "today") {
        const todayOrders = await employeeApi.orders.getTodayOrders(user.employerRestaurantId)
        const filteredOrders = selectedStatus === "all" 
          ? todayOrders 
          : todayOrders.filter(o => OrderStatus[o.status] === selectedStatus)
        setOrders(filteredOrders)
        setTotalPages(1)
      } else {
        const response = selectedStatus === "all" 
          ? await employeeApi.orders.getAll(user.employerRestaurantId, currentPage, 10)
          : await employeeApi.orders.getByStatus(user.employerRestaurantId, selectedStatus, currentPage, 10)
        
        setOrders(response.items || [])
        setTotalPages(response.totalPages || 1)
      }
    } catch (error) {
      console.error("Siparişler yüklenirken hata:", error)
      toast({
        title: "Hata",
        description: "Siparişler yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await employeeApi.orders.updateStatus(orderId, newStatus)
      toast({
        title: "Başarılı",
        description: "Sipariş durumu güncellendi",
      })
      loadOrders()
      loadStats()
    } catch (error) {
      console.error("Sipariş durumu güncellenirken hata:", error)
      toast({
        title: "Hata",
        description: "Sipariş durumu güncellenirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const showOrderDetails = async (orderId: string) => {
    try {
      const order = await employeeApi.orders.getById(orderId)
      setSelectedOrder(order)
      setIsDetailDialogOpen(true)
    } catch (error) {
      console.error("Sipariş detayları yüklenirken hata:", error)
      toast({
        title: "Hata",
        description: "Sipariş detayları yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: number) => {
    const statusConfig: Record<number, { label: string; variant: any }> = {
      [OrderStatus.Pending]: { label: "Bekliyor", variant: "secondary" },
      [OrderStatus.Confirmed]: { label: "Onaylandı", variant: "default" },
      [OrderStatus.Preparing]: { label: "Hazırlanıyor", variant: "default" },
      [OrderStatus.Ready]: { label: "Hazır", variant: "default" },
      [OrderStatus.OutForDelivery]: { label: "Yolda", variant: "default" },
      [OrderStatus.Delivered]: { label: "Teslim Edildi", variant: "default" },
      [OrderStatus.Completed]: { label: "Tamamlandı", variant: "default" },
      [OrderStatus.Cancelled]: { label: "İptal", variant: "destructive" },
    }

    const config = statusConfig[status] || { label: `Durum ${status}`, variant: "secondary" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getOrderTypeLabel = (orderType: number) => {
    const types: Record<number, string> = {
      [OrderType.DineIn]: "Masada Yeme",
      [OrderType.TakeAway]: "Paket Servis",
      [OrderType.Delivery]: "Teslimat",
    }
    return types[orderType] || "Bilinmiyor"
  }

  const getNextStatus = (currentStatus: number): string[] => {
    const statusFlow: Record<number, string[]> = {
      [OrderStatus.Pending]: ["Confirmed", "Cancelled"],
      [OrderStatus.Confirmed]: ["Preparing", "Cancelled"],
      [OrderStatus.Preparing]: ["Ready", "Cancelled"],
      [OrderStatus.Ready]: ["OutForDelivery", "Completed"],
      [OrderStatus.OutForDelivery]: ["Delivered"],
      [OrderStatus.Delivered]: ["Completed"],
    }
    return statusFlow[currentStatus] || []
  }

  if (!user?.employerRestaurantId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Restoran Bilgisi Bulunamadı</CardTitle>
            <CardDescription>Çalıştığınız restoran bilgisine erişilemiyor.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-8 w-8" />
            Siparişler
          </h1>
          <p className="text-muted-foreground">Restoran siparişlerini görüntüleyin ve yönetin</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Siparişler</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCount}</div>
            <p className="text-xs text-muted-foreground">Devam eden siparişler</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugünkü Siparişler</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders.length}</div>
            <p className="text-xs text-muted-foreground">Toplam sipariş</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">Bugün tamamlanan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Günlük Gelir</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{stats.todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Bugünkü toplam</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "all" | "today")}>
        <TabsList>
          <TabsTrigger value="all">Tüm Siparişler</TabsTrigger>
          <TabsTrigger value="today">Bugünkü Siparişler</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-4">
        <Select value={selectedStatus} onValueChange={(value) => {
          setSelectedStatus(value)
          setCurrentPage(1)
        }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Durum Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="Pending">Bekliyor</SelectItem>
            <SelectItem value="Confirmed">Onaylandı</SelectItem>
            <SelectItem value="Preparing">Hazırlanıyor</SelectItem>
            <SelectItem value="Ready">Hazır</SelectItem>
            <SelectItem value="OutForDelivery">Yolda</SelectItem>
            <SelectItem value="Delivered">Teslim Edildi</SelectItem>
            <SelectItem value="Completed">Tamamlandı</SelectItem>
            <SelectItem value="Cancelled">İptal</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => {
          loadOrders()
          loadStats()
        }}>
          Yenile
        </Button>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Sipariş bulunamadı.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      Sipariş #{order.id.substring(0, 8)}
                      {getStatusBadge(order.status)}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(order.orderDate).toLocaleString("tr-TR")}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ₺{order.totalAmount?.toFixed(2)}
                      </span>
                      {order.paymentMethod && (
                        <span className="text-sm">
                          💳 {order.paymentMethod}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Müşteri</p>
                      <p className="font-medium">{order.customerName || "Bilinmiyor"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sipariş Tipi</p>
                      <p className="font-medium">{getOrderTypeLabel(order.type)}</p>
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Ürün Sayısı</p>
                        <p className="font-medium">{order.items.length} ürün</p>
                      </div>
                    )}
                    {order.deliveryAddress && (
                      <div className="col-span-2 md:col-span-3">
                        <p className="text-sm text-muted-foreground">Teslimat Adresi</p>
                        <p className="font-medium text-sm">{order.deliveryAddress}</p>
                      </div>
                    )}
                    {order.specialRequests && (
                      <div className="col-span-2 md:col-span-3">
                        <p className="text-sm text-muted-foreground">Özel Talimatlar</p>
                        <p className="font-medium text-sm">{order.specialRequests}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {/* Quick Actions for Status */}
                    {getNextStatus(order.status).map((nextStatus) => (
                      <Button
                        key={nextStatus}
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(order.id, nextStatus)}
                      >
                        {nextStatus === "Confirmed" && "✓ Onayla"}
                        {nextStatus === "Preparing" && "🍳 Hazırlanıyor"}
                        {nextStatus === "Ready" && "✓ Hazır"}
                        {nextStatus === "OutForDelivery" && "🚗 Teslimat"}
                        {nextStatus === "Delivered" && "✓ Teslim Edildi"}
                        {nextStatus === "Completed" && "✓ Tamamla"}
                        {nextStatus === "Cancelled" && "✗ İptal Et"}
                      </Button>
                    ))}

                    {/* Manual Status Change */}
                    <Select
                      value={OrderStatus[order.status]}
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Bekliyor</SelectItem>
                        <SelectItem value="Confirmed">Onaylandı</SelectItem>
                        <SelectItem value="Preparing">Hazırlanıyor</SelectItem>
                        <SelectItem value="Ready">Hazır</SelectItem>
                        <SelectItem value="OutForDelivery">Yolda</SelectItem>
                        <SelectItem value="Delivered">Teslim Edildi</SelectItem>
                        <SelectItem value="Completed">Tamamlandı</SelectItem>
                        <SelectItem value="Cancelled">İptal</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => showOrderDetails(order.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Detaylar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {viewMode === "all" && totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Önceki
          </Button>
          <span className="py-2 px-4">
            Sayfa {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Sonraki
          </Button>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sipariş Detayları #{selectedOrder?.id.substring(0, 8)}</DialogTitle>
            <DialogDescription>
              {selectedOrder && new Date(selectedOrder.orderDate).toLocaleString("tr-TR")}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Müşteri</p>
                  <p className="font-medium">{selectedOrder.customerName || "Bilinmiyor"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Durum</p>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sipariş Tipi</p>
                  <p className="font-medium">{getOrderTypeLabel(selectedOrder.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Tutar</p>
                  <p className="font-medium text-lg">₺{selectedOrder.totalAmount?.toFixed(2)}</p>
                </div>
                {selectedOrder.paymentMethod && (
                  <div>
                    <p className="text-sm text-muted-foreground">Ödeme Yöntemi</p>
                    <p className="font-medium">{selectedOrder.paymentMethod}</p>
                  </div>
                )}
                {selectedOrder.restaurantName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Restoran</p>
                    <p className="font-medium">{selectedOrder.restaurantName}</p>
                  </div>
                )}
              </div>

              {selectedOrder.deliveryAddress && (
                <div>
                  <p className="text-sm text-muted-foreground">Teslimat Adresi</p>
                  <p className="font-medium">{selectedOrder.deliveryAddress}</p>
                </div>
              )}

              {selectedOrder.specialRequests && (
                <div>
                  <p className="text-sm text-muted-foreground">Özel Talimatlar</p>
                  <p className="font-medium">{selectedOrder.specialRequests}</p>
                </div>
              )}

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-3">Sipariş Kalemleri</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="py-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium">{item.menuItemName}</p>
                              <p className="text-sm text-muted-foreground">
                                Miktar: {item.quantity} x ₺{item.unitPrice.toFixed(2)}
                              </p>
                              {item.notes && (
                                <p className="text-sm text-muted-foreground italic mt-1">
                                  Not: {item.notes}
                                </p>
                              )}
                            </div>
                            <p className="font-bold text-lg">₺{item.subtotal.toFixed(2)}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-semibold">Toplam Tutar</p>
                      <p className="text-2xl font-bold">₺{selectedOrder.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

