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
  FileText,
  Utensils,
  Briefcase,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

const ITEMS_PER_PAGE = 5

export default function OwnerDashboardPage() {
  const { hasRole } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalMonthlyRevenue, setTotalMonthlyRevenue] = useState(0)
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false)
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)

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
      
      // Tüm restoranlardan son 30 günün gelirini topla
      if (data.length > 0) {
        loadTotalMonthlyRevenue(data)
        loadTotalEmployees(data)
      }
    } catch (error) {
      console.error("Error loading restaurants:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTotalMonthlyRevenue = async (restaurantList: any[]) => {
    try {
      setIsLoadingRevenue(true)
      let totalRevenue = 0
      
      // Her restoran için son 30 günün gelirini al
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
      
      const revenuePromises = restaurantList.map(async (restaurant) => {
        try {
          const report = await OwnerApi.getSalesReport(
            restaurant.id,
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
          )
          return report.totalRevenue || 0
        } catch (error) {
          console.error(`Error loading revenue for restaurant ${restaurant.id}:`, error)
          return 0
        }
      })
      
      const revenues = await Promise.all(revenuePromises)
      totalRevenue = revenues.reduce((sum, revenue) => sum + revenue, 0)
      
      setTotalMonthlyRevenue(totalRevenue)
    } catch (error) {
      console.error("Error loading total monthly revenue:", error)
    } finally {
      setIsLoadingRevenue(false)
    }
  }

  const loadTotalEmployees = async (restaurantList: any[]) => {
    try {
      setIsLoadingEmployees(true)
      
      const employeePromises = restaurantList.map(async (restaurant) => {
        try {
          const result = await OwnerApi.getEmployeeCount(restaurant.id)
          return result.count || 0
        } catch (error) {
          console.error(`Error loading employee count for restaurant ${restaurant.id}:`, error)
          return 0
        }
      })
      
      const employeeCounts = await Promise.all(employeePromises)
      const total = employeeCounts.reduce((sum, count) => sum + count, 0)
      
      setTotalEmployees(total)
    } catch (error) {
      console.error("Error loading total employees:", error)
    } finally {
      setIsLoadingEmployees(false)
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
        <p className="text-muted-foreground">Manage your restaurants and business</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Aylık Toplam Gelir</CardTitle>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <CardDescription>Son 30 gün - Tüm restoranlar</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRevenue ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="text-3xl font-bold text-green-600">
                ₺{totalMonthlyRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Toplam Çalışanlar</CardTitle>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <CardDescription>Tüm restoranlardaki çalışanlar</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingEmployees ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="text-3xl font-bold text-blue-600">{totalEmployees}</div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Restoranlarım</CardTitle>
              <Store className="w-8 h-8 text-primary" />
            </div>
            <CardDescription>Toplam restoran sayısı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{restaurants.length}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/owner/restaurants/new')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Yeni Restoran</CardTitle>
              <Store className="w-8 h-8 text-green-600" />
            </div>
            <CardDescription>Yeni bir restoran ekle</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Restoran Oluştur
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Restaurant Cards */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Your Restaurants</h2>
        <div className="space-y-4">
          {currentRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="w-5 h-5" />
                      {restaurant.name}
                    </CardTitle>
                    <CardDescription>{restaurant.category}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/owner/restaurants/${restaurant.id}/dashboard`)}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-1" />
                      Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/owner/restaurants/${restaurant.id}/statistics`)}
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Statistics
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/owner/restaurants/${restaurant.id}/menu`)}
                    >
                      <Utensils className="w-4 h-4 mr-1" />
                      Menu
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/owner/restaurants/${restaurant.id}/orders`)}
                    >
                      <ShoppingBag className="w-4 h-4 mr-1" />
                      Orders
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/owner/restaurants/${restaurant.id}/employees`)}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Staff
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/owner/restaurants/${restaurant.id}/job-applications`)}
                    >
                      <Briefcase className="w-4 h-4 mr-1" />
                      Applications
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/owner/restaurants/${restaurant.id}/reports`)}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Reports
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
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
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
