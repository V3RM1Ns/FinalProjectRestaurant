"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Calendar, Heart, MapPin, Clock, Star } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { customerApi } from "@/lib/customer-api"
import { useToast } from "@/hooks/use-toast"

export default function CustomerDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [upcomingReservations, setUpcomingReservations] = useState<any[]>([])
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomerData = async () => {
      setLoading(true)
      try {
        // Fetch recent orders
        const ordersData = await customerApi.orders.getAll(1, 5)
        setRecentOrders(ordersData.items || [])

        // Fetch upcoming reservations
        const reservationsData = await customerApi.reservations.getUpcoming(1, 5)
        setUpcomingReservations(Array.isArray(reservationsData) ? reservationsData : reservationsData.items || [])

        // Fetch favorite restaurants
        try {
          const favoritesData = await customerApi.favorites.getAll(1, 4)
          setFavoriteRestaurants(favoritesData.items || [])
        } catch (error) {
          console.error("Error fetching favorites:", error)
          setFavoriteRestaurants([])
        }
      } catch (error: any) {
        console.error("Error fetching customer data:", error)
        toast({
          title: "Hata",
          description: "Veriler yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchCustomerData()
    }
  }, [user, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hoş Geldiniz, {user?.fullName}!</h1>
        <p className="text-muted-foreground">Siparişlerinizi ve rezervasyonlarınızı buradan takip edebilirsiniz</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button asChild size="lg" className="h-auto py-6">
          <Link href="/restaurants" className="flex flex-col items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            <span>Yeni Sipariş Ver</span>
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-auto py-6 bg-transparent">
          <Link href="/restaurants" className="flex flex-col items-center gap-2">
            <Calendar className="h-6 w-6" />
            <span>Rezervasyon Yap</span>
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-auto py-6 bg-transparent">
          <Link href="/customer/favorites" className="flex flex-col items-center gap-2">
            <Heart className="h-6 w-6" />
            <span>Favorilerim</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Son Siparişlerim
            </CardTitle>
            <CardDescription>Geçmiş siparişlerinizi görüntüleyin</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Henüz sipariş vermediniz</p>
                <Button asChild className="mt-4">
                  <Link href="/restaurants">Sipariş Ver</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={order.status === "Completed" ? "default" : "secondary"}>
                          {order.status === "Pending" ? "Beklemede" : 
                           order.status === "Preparing" ? "Hazırlanıyor" :
                           order.status === "Ready" ? "Hazır" :
                           order.status === "Delivered" ? "Teslim Edildi" :
                           order.status === "Completed" ? "Tamamlandı" :
                           order.status === "Cancelled" ? "İptal Edildi" : order.status}
                        </Badge>
                        <Badge variant="outline">
                          {order.orderType === 1 ? "Gel-Al" : order.orderType === 2 ? "Teslimat" : "Restoran"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.orderDate).toLocaleDateString("tr-TR")}
                      </p>
                      {order.restaurantName && (
                        <p className="text-sm font-medium mt-1">{order.restaurantName}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₺{order.totalAmount?.toFixed(2)}</p>
                      <Button asChild variant="link" size="sm" className="h-auto p-0">
                        <Link href={`/customer/orders`}>Detaylar</Link>
                      </Button>
                    </div>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/customer/orders">Tüm Siparişleri Gör</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Reservations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Yaklaşan Rezervasyonlar
            </CardTitle>
            <CardDescription>Rezervasyonlarınızı yönetin</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingReservations.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Aktif rezervasyonunuz yok</p>
                <Button asChild className="mt-4">
                  <Link href="/restaurants">Rezervasyon Yap</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingReservations.slice(0, 3).map((reservation) => (
                  <div key={reservation.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={reservation.status === "Confirmed" ? "default" : "secondary"}>
                        {reservation.status === "Pending" ? "Beklemede" :
                         reservation.status === "Confirmed" ? "Onaylandı" :
                         reservation.status === "Cancelled" ? "İptal Edildi" :
                         reservation.status === "Completed" ? "Tamamlandı" : reservation.status}
                      </Badge>
                      <span className="text-sm font-medium">{reservation.numberOfGuests} Kişi</span>
                    </div>
                    {reservation.restaurantName && (
                      <p className="font-semibold mb-2">{reservation.restaurantName}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {new Date(reservation.reservationDate).toLocaleString("tr-TR")}
                    </div>
                    {reservation.tableNumber && (
                      <p className="text-sm text-muted-foreground mt-1">Masa: {reservation.tableNumber}</p>
                    )}
                    {reservation.specialRequests && (
                      <p className="text-sm mt-2 text-muted-foreground">Not: {reservation.specialRequests}</p>
                    )}
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/customer/reservations">Tüm Rezervasyonları Gör</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favorite Restaurants */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Favori Restoranlarım
            </CardTitle>
            <CardDescription>Sık sipariş verdiğiniz restoranlar</CardDescription>
          </CardHeader>
          <CardContent>
            {favoriteRestaurants.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Henüz favori restoranınız yok</p>
                <Button asChild className="mt-4">
                  <Link href="/restaurants">Restoranları Keşfet</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favoriteRestaurants.map((favorite) => {
                  const restaurant = favorite.restaurant || favorite
                  return (
                    <Link
                      key={favorite.id}
                      href={`/restaurants/${restaurant.id}`}
                      className="flex gap-4 p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <img
                        src={restaurant.imageUrl || "/placeholder.svg?height=80&width=80"}
                        alt={restaurant.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{restaurant.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">{restaurant.address}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{restaurant.rating || "5.0"}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
