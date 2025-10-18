"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Calendar, Heart, MapPin, Clock, Star } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { Order, Reservation, Restaurant } from "@/types"

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [upcomingReservations, setUpcomingReservations] = useState<Reservation[]>([])
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock API call to fetch customer data
    const fetchCustomerData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Mock recent orders
      setRecentOrders([
        {
          id: "1",
          orderDate: new Date().toISOString(),
          totalAmount: 125.5,
          status: "Completed",
          type: "Delivery",
          restaurantId: "1",
          orderItems: [],
          createdAt: new Date().toISOString(),
          isDeleted: false,
        },
        {
          id: "2",
          orderDate: new Date(Date.now() - 86400000).toISOString(),
          totalAmount: 89.0,
          status: "Completed",
          type: "Takeout",
          restaurantId: "2",
          orderItems: [],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          isDeleted: false,
        },
      ])

      // Mock upcoming reservations
      setUpcomingReservations([
        {
          id: "1",
          reservationDate: new Date(Date.now() + 172800000).toISOString(),
          numberOfGuests: 4,
          status: "Confirmed",
          customerName: user?.fullName || "",
          customerPhone: user?.phoneNumber || "",
          restaurantId: "1",
          tableId: "1",
          createdAt: new Date().toISOString(),
          isDeleted: false,
        },
      ])

      // Mock favorite restaurants
      setFavoriteRestaurants([
        {
          id: "1",
          name: "Sultanahmet Köftecisi",
          address: "Sultanahmet, İstanbul",
          phoneNumber: "+90 212 555 0001",
          description: "Geleneksel Türk mutfağı",
          ownerId: "owner-1",
          category: "Türk Mutfağı",
          rating: 4.8,
          imageUrl: "/turkish-restaurant-interior.jpg",
          createdAt: new Date().toISOString(),
          isDeleted: false,
        },
        {
          id: "2",
          name: "Pizza Napoli",
          address: "Beyoğlu, İstanbul",
          phoneNumber: "+90 212 555 0002",
          description: "Otantik İtalyan pizzası",
          ownerId: "owner-1",
          category: "İtalyan Mutfağı",
          rating: 4.6,
          imageUrl: "/italian-pizza-restaurant.jpg",
          createdAt: new Date().toISOString(),
          isDeleted: false,
        },
      ])

      setLoading(false)
    }

    fetchCustomerData()
  }, [user])

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
          <Link href="/reservations" className="flex flex-col items-center gap-2">
            <Calendar className="h-6 w-6" />
            <span>Rezervasyon Yap</span>
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-auto py-6 bg-transparent">
          <Link href="/profile" className="flex flex-col items-center gap-2">
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
              <p className="text-muted-foreground text-center py-8">Henüz sipariş vermediniz</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={order.status === "Completed" ? "default" : "secondary"}>{order.status}</Badge>
                        <Badge variant="outline">{order.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.orderDate).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{order.totalAmount.toFixed(2)} ₺</p>
                      <Button asChild variant="link" size="sm" className="h-auto p-0">
                        <Link href={`/orders/${order.id}`}>Detaylar</Link>
                      </Button>
                    </div>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/orders">Tüm Siparişleri Gör</Link>
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
              <p className="text-muted-foreground text-center py-8">Aktif rezervasyonunuz yok</p>
            ) : (
              <div className="space-y-4">
                {upcomingReservations.map((reservation) => (
                  <div key={reservation.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="default">{reservation.status}</Badge>
                      <span className="text-sm font-medium">{reservation.numberOfGuests} Kişi</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {new Date(reservation.reservationDate).toLocaleString("tr-TR")}
                    </div>
                    {reservation.specialRequests && (
                      <p className="text-sm mt-2 text-muted-foreground">Not: {reservation.specialRequests}</p>
                    )}
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/reservations">Tüm Rezervasyonları Gör</Link>
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
              <p className="text-muted-foreground text-center py-8">Henüz favori restoranınız yok</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favoriteRestaurants.map((restaurant) => (
                  <Link
                    key={restaurant.id}
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
                        {restaurant.address}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{restaurant.rating}</span>
                        <span className="text-sm text-muted-foreground">• {restaurant.category}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
