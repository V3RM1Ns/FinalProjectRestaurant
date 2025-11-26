"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { OwnerApi } from "@/lib/owner-api"
import { UserRole } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Store,
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Utensils,
  Briefcase,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Star,
  Table,
} from "lucide-react"
import Link from "next/link"

const ITEMS_PER_PAGE = 5

interface RestaurantStats {
  restaurantId: string
  restaurantName: string
  totalOrders: number
  totalMenuItems: number
  totalReservations: number
  totalEmployees: number
  averageRating: number
  totalRevenue: number
}

export default function OwnerDashboardPage() {
  const { hasRole } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [restaurantStats, setRestaurantStats] = useState<Record<string, RestaurantStats>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalMonthlyRevenue, setTotalMonthlyRevenue] = useState(0)
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false)
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalMenuItems, setTotalMenuItems] = useState(0)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

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
        loadAllStats(data)
      }
    } catch (error) {
      console.error("Error loading restaurants:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAllStats = async (restaurantList: any[]) => {
    try {
      setIsLoadingRevenue(true)
      setIsLoadingStats(true)
      
      const statsPromises = restaurantList.map(async (restaurant) => {
        try {
          const stats = await OwnerApi.getStatistics(restaurant.id)
          return {
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            ...stats,
          }
        } catch (error) {
          console.error(`Error loading stats for restaurant ${restaurant.id}:`, error)
          return {
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            totalOrders: 0,
            totalMenuItems: 0,
            totalReservations: 0,
            totalEmployees: 0,
            averageRating: 0,
            totalRevenue: 0,
          }
        }
      })
      
      const allStats = await Promise.all(statsPromises)
      
      // Store stats by restaurant ID
      const statsMap: Record<string, RestaurantStats> = {}
      let totalRev = 0
      let totalEmp = 0
      let totalOrd = 0
      let totalMenu = 0
      
      allStats.forEach((stat) => {
        statsMap[stat.restaurantId] = stat
        totalRev += stat.totalRevenue || 0
        totalEmp += stat.totalEmployees || 0
        totalOrd += stat.totalOrders || 0
        totalMenu += stat.totalMenuItems || 0
      })
      
      setRestaurantStats(statsMap)
      setTotalMonthlyRevenue(totalRev)
      setTotalEmployees(totalEmp)
      setTotalOrders(totalOrd)
      setTotalMenuItems(totalMenu)
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setIsLoadingRevenue(false)
      setIsLoadingStats(false)
    }
  }

  // Pagination calculations
  const totalPages = Math.ceil(restaurants.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentRestaurants = restaurants.slice(startIndex, endIndex)

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
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
            <Link href="/owner/restaurants/new">
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
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <LayoutDashboard className="w-8 h-8" />
          Owner Dashboard
        </h1>
        <p className="text-muted-foreground">Restoranlarınızın genel istatistikleri</p>
      </div>

      {/* Quick Stats - Global */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Toplam Gelir</CardTitle>
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingRevenue ? (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="text-2xl font-bold text-green-600">
                ₺{totalMonthlyRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Toplam Sipariş</CardTitle>
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="text-2xl font-bold text-blue-600">{totalOrders}</div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Menü Öğeleri</CardTitle>
              <Utensils className="w-6 h-6 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="text-2xl font-bold text-orange-600">{totalMenuItems}</div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Çalışanlar</CardTitle>
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="text-2xl font-bold text-purple-600">{totalEmployees}</div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/owner/restaurants/new')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Restoranlar</CardTitle>
              <Store className="w-6 h-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restaurants.length}</div>
            <Button size="sm" className="w-full mt-2">
              Yeni Ekle
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Restaurant Cards */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Restoranlarınız</h2>
        <div className="space-y-4">
          {currentRestaurants.map((restaurant) => {
            const stats = restaurantStats[restaurant.id]
            return (
              <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Store className="w-5 h-5" />
                        {restaurant.name}
                      </CardTitle>
                      <CardDescription>{restaurant.category}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/owner/restaurants/${restaurant.id}/statistics`)}
                      >
                        <TrendingUp className="w-4 h-4 mr-1" />
                        İstatistikler
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/owner/restaurants/${restaurant.id}/employees`)}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Çalışanlar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/owner/restaurants/${restaurant.id}/job-applications`)}
                      >
                        <Briefcase className="w-4 h-4 mr-1" />
                        Başvurular
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : stats ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-green-600">
                          ₺{stats.totalRevenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-xs text-muted-foreground">Gelir</div>
                      </div>
                      
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <ShoppingBag className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-blue-600">{stats.totalOrders}</div>
                        <div className="text-xs text-muted-foreground">Sipariş</div>
                      </div>
                      
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <Utensils className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-orange-600">{stats.totalMenuItems}</div>
                        <div className="text-xs text-muted-foreground">Menü Öğesi</div>
                      </div>
                      
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <Users className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-purple-600">{stats.totalEmployees}</div>
                        <div className="text-xs text-muted-foreground">Çalışan</div>
                      </div>
                      
                      <div className="text-center p-3 bg-indigo-50 rounded-lg">
                        <Table className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-indigo-600">{stats.totalTables || 0}</div>
                        <div className="text-xs text-muted-foreground">Masa</div>
                      </div>
                      
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <Star className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">Puan ({stats.totalReviews || 0} yorum)</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      İstatistikler yüklenemedi
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Önceki
            </Button>
            <span className="text-sm text-muted-foreground">
              Sayfa {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Sonraki
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
