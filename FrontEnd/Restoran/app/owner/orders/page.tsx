"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { OwnerApi } from "@/lib/owner-api"
import { UserRole } from "@/types"
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
import { ShoppingBag, Eye } from "lucide-react"
import Link from "next/link"

export default function OwnerOrdersPage() {
  const { hasRole } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const restaurantId = searchParams.get("restaurant")

  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!hasRole(UserRole.Owner)) {
      router.push("/unauthorized")
      return
    }

    if (restaurantId) {
      loadOrders()
    }
  }, [hasRole, router, restaurantId, selectedStatus, currentPage])

  const loadOrders = async () => {
    if (!restaurantId) return

    try {
      setIsLoading(true)
      const response = selectedStatus === "all" 
        ? await OwnerApi.getOrders(restaurantId, currentPage, 10)
        : await OwnerApi.getOrdersByStatus(restaurantId, selectedStatus, currentPage, 10)
      
      setOrders(response.items || [])
      setTotalPages(response.totalPages || 1)
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await OwnerApi.updateOrderStatus(orderId, newStatus)
      loadOrders()
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      Pending: "secondary",
      Confirmed: "default",
      Preparing: "default",
      Ready: "default",
      OutForDelivery: "default",
      Delivered: "default",
      Completed: "default",
      Cancelled: "destructive",
    }

    return (
      <Badge variant={variants[status] || "secondary"}>
        {status}
      </Badge>
    )
  }

  if (!restaurantId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Restoran Seçilmedi</CardTitle>
            <CardDescription>Lütfen bir restoran seçin.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <ShoppingBag className="mr-2" />
            Siparişler
          </h1>
          <p className="text-muted-foreground">Restoran siparişlerini yönetin</p>
        </div>
        <Link href="/owner/dashboard">
          <Button variant="outline">Dashboard'a Dön</Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Durum Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="Pending">Bekleyen</SelectItem>
            <SelectItem value="Confirmed">Onaylandı</SelectItem>
            <SelectItem value="Preparing">Hazırlanıyor</SelectItem>
            <SelectItem value="Ready">Hazır</SelectItem>
            <SelectItem value="OutForDelivery">Yolda</SelectItem>
            <SelectItem value="Delivered">Teslim Edildi</SelectItem>
            <SelectItem value="Completed">Tamamlandı</SelectItem>
            <SelectItem value="Cancelled">İptal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Sipariş bulunamadı.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Sipariş #{order.id}</CardTitle>
                    <CardDescription>
                      {new Date(order.orderDate).toLocaleString("tr-TR")}
                    </CardDescription>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Müşteri</p>
                      <p className="font-medium">{order.customerName || "Bilinmiyor"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Toplam Tutar</p>
                      <p className="font-medium">₺{order.totalAmount?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sipariş Tipi</p>
                      <p className="font-medium">{order.orderType || "Dine-In"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Bekleyen</SelectItem>
                        <SelectItem value="Confirmed">Onaylandı</SelectItem>
                        <SelectItem value="Preparing">Hazırlanıyor</SelectItem>
                        <SelectItem value="Ready">Hazır</SelectItem>
                        <SelectItem value="OutForDelivery">Yolda</SelectItem>
                        <SelectItem value="Delivered">Teslim Edildi</SelectItem>
                        <SelectItem value="Completed">Tamamlandı</SelectItem>
                        <SelectItem value="Cancelled">İptal</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button variant="outline" size="sm">
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

      {totalPages > 1 && (
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
    </div>
  )
}

