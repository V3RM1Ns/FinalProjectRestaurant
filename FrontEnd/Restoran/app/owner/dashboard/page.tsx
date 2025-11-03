"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { OwnerApi } from "@/lib/owner-api"
import { UserRole } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Store,
  DollarSign,
  ShoppingBag,
  Calendar,
  Users,
  Star,
  TrendingUp,
  FileText,
  Utensils,
  ChefHat,
} from "lucide-react"
import Link from "next/link"

export default function OwnerDashboardPage() {
  const { user, hasRole } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    if (!hasRole(UserRole.Owner)) {
      router.push("/unauthorized")
      return
    }

    loadRestaurants()
  }, [hasRole, router])

  const loadRestaurants = async () => {
    try {
      setIsLoading(true)
      const data = await OwnerApi.getMyRestaurants()
      setRestaurants(data)
      
      if (data.length > 0) {
        setSelectedRestaurant(data[0].id)
        loadDashboardData(data[0].id)
      }
    } catch (error) {
      console.error("Error loading restaurants:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadDashboardData = async (restaurantId: string) => {
    try {
      const data = await OwnerApi.getDashboard(restaurantId)
      setDashboardData(data)
    } catch (error) {
      console.error("Error loading dashboard:", error)
    }
  }

  const handleRestaurantChange = (restaurantId: string) => {
    setSelectedRestaurant(restaurantId)
    loadDashboardData(restaurantId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (restaurants.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Restoran Bulunamadı</CardTitle>
            <CardDescription>Henüz bir restoranınız yok. Başlamak için bir restoran oluşturun.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/owner/restaurants/create">
              <Button>
                <Store className="mr-2 h-4 w-4" />
                Restoran Oluştur
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Restoran Yönetimi</h1>
          <p className="text-muted-foreground">Hoş geldiniz, {user?.fullName}</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedRestaurant || ""}
            onChange={(e) => handleRestaurantChange(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      {dashboardData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₺{dashboardData.totalRevenue?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">Bugün: ₺{dashboardData.todayRevenue?.toFixed(2) || "0.00"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Siparişler</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">Bugün: {dashboardData.todayOrders || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Rezervasyonlar</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.activeReservations || 0}</div>
              <Link href={`/owner/reservations?restaurant=${selectedRestaurant}`}>
                <p className="text-xs text-primary hover:underline">Rezervasyonları Gör</p>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ortalama Puan</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.averageRating?.toFixed(1) || "0.0"}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.pendingReviewsCount || 0} bekleyen yorum
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="quick-actions">Hızlı İşlemler</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Çalışanlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboardData?.employeeCount || 0}</div>
                <p className="text-sm text-muted-foreground mb-4">Toplam çalışan sayısı</p>
                <Link href={`/owner/employees?restaurant=${selectedRestaurant}`}>
                  <Button variant="outline" className="w-full">
                    Çalışanları Yönet
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Utensils className="mr-2 h-5 w-5" />
                  Menü Ürünleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboardData?.menuItemCount || 0}</div>
                <p className="text-sm text-muted-foreground mb-4">Toplam menü ürünü</p>
                <Link href={`/owner/menu?restaurant=${selectedRestaurant}`}>
                  <Button variant="outline" className="w-full">
                    Menüyü Yönet
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  İş Başvuruları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboardData?.pendingApplicationsCount || 0}</div>
                <p className="text-sm text-muted-foreground mb-4">Bekleyen başvuru</p>
                <Link href={`/owner/applications?restaurant=${selectedRestaurant}`}>
                  <Button variant="outline" className="w-full">
                    Başvuruları Gör
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Top Selling Items */}
          {dashboardData?.topSellingItems && dashboardData.topSellingItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  En Çok Satan Ürünler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.topSellingItems.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="font-semibold text-lg text-muted-foreground">#{index + 1}</div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.orderCount} sipariş</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₺{item.totalRevenue?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quick-actions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href={`/owner/orders?restaurant=${selectedRestaurant}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Siparişler
                  </CardTitle>
                  <CardDescription>Siparişleri görüntüle ve yönet</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href={`/owner/reservations?restaurant=${selectedRestaurant}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Rezervasyonlar
                  </CardTitle>
                  <CardDescription>Rezervasyonları kontrol et</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href={`/owner/reviews?restaurant=${selectedRestaurant}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="mr-2 h-5 w-5" />
                    Yorumlar
                  </CardTitle>
                  <CardDescription>Müşteri yorumlarını yönet</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href={`/owner/menu?restaurant=${selectedRestaurant}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Utensils className="mr-2 h-5 w-5" />
                    Menü Yönetimi
                  </CardTitle>
                  <CardDescription>Menü ve ürünleri düzenle</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href={`/owner/employees?restaurant=${selectedRestaurant}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ChefHat className="mr-2 h-5 w-5" />
                    Çalışan Yönetimi
                  </CardTitle>
                  <CardDescription>Çalışanları yönet</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href={`/owner/reports?restaurant=${selectedRestaurant}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Raporlar
                  </CardTitle>
                  <CardDescription>Satış raporlarını görüntüle</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
