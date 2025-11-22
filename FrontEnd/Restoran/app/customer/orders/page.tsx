'use client'

import { useEffect, useState } from 'react'
import { customerApi } from '@/lib/customer-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, MapPin, Phone, Package, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function CustomerOrdersPage() {
  const [activeOrders, setActiveOrders] = useState<any[]>([])
  const [orderHistory, setOrderHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const [active, history] = await Promise.all([
        customerApi.orders.getActive(),
        customerApi.orders.getHistory(),
      ])
      setActiveOrders(active)
      setOrderHistory(history)
    } catch (error) {
      console.error('Error loading orders:', error)
      toast({
        title: 'Hata',
        description: 'Siparişler yüklenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Siparişi iptal etmek istediğinize emin misiniz?')) return

    try {
      await customerApi.orders.cancel(orderId)
      toast({
        title: 'Başarılı',
        description: 'Sipariş başarıyla iptal edildi',
      })
      loadOrders()
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Sipariş iptal edilirken bir hata oluştu',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      Pending: { label: 'Beklemede', variant: 'secondary' },
      Confirmed: { label: 'Onaylandı', variant: 'default' },
      Preparing: { label: 'Hazırlanıyor', variant: 'default' },
      Ready: { label: 'Hazır', variant: 'default' },
      Served: { label: 'Teslim Edildi', variant: 'default' },
      Completed: { label: 'Tamamlandı', variant: 'default' },
      Cancelled: { label: 'İptal Edildi', variant: 'destructive' },
    }
    const config = statusMap[status] || { label: status, variant: 'secondary' }
    return <Badge variant={config.variant as any}>{config.label}</Badge>
  }

  const OrderCard = ({ order, showCancelButton = false }: any) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{order.restaurantName}</CardTitle>
            <CardDescription>Sipariş #{order.id?.substring(0, 8).toUpperCase()}</CardDescription>
          </div>
          {getStatusBadge(order.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Order Items */}
          <div className="space-y-2">
            {order.orderItems?.map((item: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.menuItemName}
                </span>
                <span className="font-medium">₺{item.subtotal?.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Order Details */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{order.type === 'Delivery' ? 'Teslimat' : order.type === 'Takeout' ? 'Gel-Al' : 'Restoranda'}</span>
            </div>
            {order.deliveryAddress && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{order.deliveryAddress}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {new Date(order.orderDate).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {order.paymentMethod && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">Ödeme:</span>
                <span>{order.paymentMethod}</span>
              </div>
            )}
            {order.specialRequests && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">Not:</span>
                <span>{order.specialRequests}</span>
              </div>
            )}
          </div>

          {/* Total and Actions */}
          <div className="pt-4 border-t flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Toplam</p>
              <p className="text-xl font-bold">₺{order.totalAmount?.toFixed(2)}</p>
            </div>
            {showCancelButton && order.status === 'Pending' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCancelOrder(order.id)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                İptal Et
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Siparişlerim</h1>
        <p className="text-muted-foreground">Aktif ve geçmiş siparişlerinizi görüntüleyin</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active">
            Aktif Siparişler ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            Geçmiş ({orderHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aktif siparişiniz bulunmuyor</p>
                <Button className="mt-4" asChild>
                  <a href="/restaurants">Sipariş Ver</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} showCancelButton />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {orderHistory.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Henüz sipariş geçmişiniz yok</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {orderHistory.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
