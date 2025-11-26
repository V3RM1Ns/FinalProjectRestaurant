'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { customerApi } from '@/lib/customer-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Clock, MapPin, Package, CheckCircle, XCircle, Loader2, MessageCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ChatButton } from '@/components/chat/chat-button'
import type { Order } from '@/types'
import Link from 'next/link'

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadOrderDetail()
  }, [orderId])

  const loadOrderDetail = async () => {
    try {
      setLoading(true)
      const orderData = await customerApi.orders.getById(orderId)
      setOrder(orderData)
    } catch (error) {
      console.error('Error loading order:', error)
      toast({
        title: 'Hata',
        description: 'Sipariş detayları yüklenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!confirm('Siparişi iptal etmek istediğinize emin misiniz?')) return

    try {
      await customerApi.orders.cancel(orderId)
      toast({
        title: 'Başarılı',
        description: 'Sipariş başarıyla iptal edildi',
      })
      loadOrderDetail()
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Sipariş iptal edilirken bir hata oluştu',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Served':
        return 'default'
      case 'Cancelled':
        return 'destructive'
      case 'Pending':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'Pending': 'Beklemede',
      'Confirmed': 'Onaylandı',
      'Preparing': 'Hazırlanıyor',
      'Ready': 'Hazır',
      'Served': 'Servis Edildi',
      'Completed': 'Tamamlandı',
      'Cancelled': 'İptal Edildi',
    }
    return statusMap[status] || status
  }

  const getOrderTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      'DineIn': 'Masada Yemek',
      'Takeout': 'Paket Servis',
      'Delivery': 'Teslimat',
    }
    return typeMap[type] || type
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Sipariş Bulunamadı</h3>
            <p className="text-muted-foreground mb-4">Bu sipariş mevcut değil veya silinmiş olabilir.</p>
            <Button asChild>
              <Link href="/customer/orders">Siparişlere Dön</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canCancelOrder = order.status === 'Pending' || order.status === 'Confirmed'

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/customer/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Siparişlere Dön
          </Link>
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Sipariş Detayları</h1>
            <p className="text-muted-foreground">Sipariş No: #{order.id.slice(0, 8)}</p>
          </div>
          <Badge variant={getStatusBadgeVariant(order.status)} className="text-sm px-3 py-1">
            {getStatusText(order.status)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Sipariş Ürünleri</CardTitle>
              <CardDescription>Siparişinizdeki ürünler ve miktarları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center gap-4 flex-1">
                      {item.menuItem?.imageUrl && (
                        <img
                          src={item.menuItem.imageUrl}
                          alt={item.menuItem.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.menuItem?.name || 'Ürün'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.unitPrice.toFixed(2)} ₺ × {item.quantity}
                        </p>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground mt-1">Not: {item.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.subtotal.toFixed(2)} ₺</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ara Toplam</span>
                  <span>{(order.totalAmount - (order.taxAmount || 0) + (order.discountAmount || 0)).toFixed(2)} ₺</span>
                </div>
                {order.discountAmount && order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>İndirim</span>
                    <span>-{order.discountAmount.toFixed(2)} ₺</span>
                  </div>
                )}
                {order.taxAmount && order.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">KDV</span>
                    <span>{order.taxAmount.toFixed(2)} ₺</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Toplam</span>
                  <span>{order.totalAmount.toFixed(2)} ₺</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Requests */}
          {order.specialRequests && (
            <Card>
              <CardHeader>
                <CardTitle>Özel Talepler</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{order.specialRequests}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Chat Button - Teslimat siparişlerinde kurye atandıysa göster */}
          {order.type === 'Delivery' && order.deliveryPersonId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Kurye ile İletişim
                </CardTitle>
                <CardDescription>
                  {order.deliveryPersonName ? `${order.deliveryPersonName} ile mesajlaşın` : 'Kurye ile mesajlaşın'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChatButton
                  orderId={order.id}
                  orderInfo={{
                    deliveryPersonName: order.deliveryPersonName,
                    restaurantName: order.restaurantName
                  }}
                  className="w-full"
                />
              </CardContent>
            </Card>
          )}

          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Sipariş Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Sipariş Tipi</p>
                  <p className="text-sm text-muted-foreground">{getOrderTypeText(order.type)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Sipariş Tarihi</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.orderDate).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>

              {order.completedAt && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Tamamlanma Tarihi</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.completedAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
              )}

              {order.deliveryAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Teslimat Adresi</p>
                    <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                  </div>
                </div>
              )}

              {order.paymentMethod && (
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Ödeme Yöntemi</p>
                    <p className="text-sm text-muted-foreground">{order.paymentMethod}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {canCancelOrder && (
            <Card>
              <CardHeader>
                <CardTitle>İşlemler</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleCancelOrder}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Siparişi İptal Et
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
