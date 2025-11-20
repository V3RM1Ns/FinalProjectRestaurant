'use client'

import { useEffect, useState } from 'react'
import { customerApi } from '@/lib/customer-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Calendar, Star, Heart, TrendingUp, Award } from 'lucide-react'
import Link from 'next/link'

interface Statistics {
  totalOrders: number
  totalReservations: number
  totalSpent: number
  favoriteRestaurantsCount: number
}

interface Restaurant {
  id: string
  name: string
  cuisine: string
  location: string
  averageRating: number
}

interface Order {
  id: string
  restaurantName: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
}

interface Reservation {
  id: string
  restaurantName: string
  reservationDate: string
  partySize: number
  status: string
}

export default function CustomerDashboard() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [recommendations, setRecommendations] = useState<Restaurant[]>([])
  const [activeOrders, setActiveOrders] = useState<Order[]>([])
  const [upcomingReservations, setUpcomingReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsData, recsData, ordersData, reservationsData] = await Promise.all([
        customerApi.statistics.getCustomerStatistics(),
        customerApi.statistics.getRecommendations(6),
        customerApi.orders.getActive(1, 5), // İlk sayfa, 5 öğe
        customerApi.reservations.getUpcoming(1, 5), // İlk sayfa, 5 öğe
      ])

      setStats(statsData)
      setRecommendations(recsData)
      
      // Backend pagination response'unu parse et
      if (ordersData && ordersData.items) {
        setActiveOrders(ordersData.items)
      } else if (Array.isArray(ordersData)) {
        setActiveOrders(ordersData.slice(0, 5))
      }

      if (reservationsData && reservationsData.items) {
        setUpcomingReservations(reservationsData.items)
      } else if (Array.isArray(reservationsData)) {
        setUpcomingReservations(reservationsData.slice(0, 5))
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Müşteri Paneli</h1>
          <p className="text-muted-foreground">Hoş geldiniz! İşte aktiviteleriniz.</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Sipariş</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Rezervasyon</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReservations || 0}</div>
            <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Harcama</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{stats?.totalSpent?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favori Restoranlar</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.favoriteRestaurantsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Kayıtlı</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Orders */}
      {activeOrders && activeOrders.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Aktif Siparişler</CardTitle>
                <CardDescription>Devam eden siparişleriniz (Son 5)</CardDescription>
              </div>
              <Link href="/customer/orders">
                <Button variant="outline" size="sm">Tümünü Gör</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">{order.restaurantName}</p>
                    <p className="text-sm text-muted-foreground">
                      Sipariş #{order.orderNumber} - <span className="font-medium">{order.status}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₺{order.totalAmount?.toFixed(2)}</p>
                    <Link href={`/customer/orders/${order.id}`}>
                      <Button variant="link" size="sm" className="h-auto p-0">Detaylar →</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Reservations */}
      {upcomingReservations && upcomingReservations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Yaklaşan Rezervasyonlar</CardTitle>
                <CardDescription>Önümüzdeki rezervasyonlarınız (Son 5)</CardDescription>
              </div>
              <Link href="/customer/reservations">
                <Button variant="outline" size="sm">Tümünü Gör</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingReservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">{reservation.restaurantName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(reservation.reservationDate).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">{reservation.partySize} Kişi</span> • {reservation.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <Link href={`/customer/reservations/${reservation.id}`}>
                      <Button variant="link" size="sm" className="h-auto p-0">Detaylar →</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Restaurants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Sizin İçin Önerilen Restoranlar
          </CardTitle>
          <CardDescription>Tercihlerinize göre seçilmiş restoranlar</CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations && recommendations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((restaurant) => (
                <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                      <CardDescription>{restaurant.cuisine}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{restaurant.averageRating?.toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{restaurant.location}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Henüz öneri bulunmuyor</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/restaurants">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Yeni Sipariş
              </CardTitle>
              <CardDescription>Restoranları keşfedin ve sipariş verin</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/customer/reservations">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Rezervasyon Yap
              </CardTitle>
              <CardDescription>Masa rezervasyonu yapın</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/customer/favorites">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Favorilerim
              </CardTitle>
              <CardDescription>Favori restoranlarınızı görün</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}

