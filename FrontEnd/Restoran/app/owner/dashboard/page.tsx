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
  ChefHat,
  Briefcase,
  LayoutDashboard,
} from "lucide-react"
import Link from "next/link"

export default function OwnerDashboardPage() {
  const { user, hasRole } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [restaurants, setRestaurants] = useState<any[]>([])

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
    } catch (error) {
      console.error("Error loading restaurants:", error)
    } finally {
      setIsLoading(false)
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/owner/restaurants')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Restaurants</CardTitle>
              <Store className="w-8 h-8 text-primary" />
            </div>
            <CardDescription>View and manage all your restaurants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-3">{restaurants.length}</div>
            <Button variant="outline" className="w-full">
              View Restaurants
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/owner/restaurants/new')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Add Restaurant</CardTitle>
              <Store className="w-8 h-8 text-green-600" />
            </div>
            <CardDescription>Register a new restaurant</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Create New Restaurant
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Restaurant Cards */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Your Restaurants</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  {restaurant.name}
                </CardTitle>
                <CardDescription>{restaurant.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/owner/restaurants/${restaurant.id}/dashboard`)}
                    className="w-full"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-1" />
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/owner/restaurants/${restaurant.id}/statistics`)}
                    className="w-full"
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Statistics
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/owner/restaurants/${restaurant.id}/menu`)}
                    className="w-full"
                  >
                    <Utensils className="w-4 h-4 mr-1" />
                    Menu
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/owner/restaurants/${restaurant.id}/orders`)}
                    className="w-full"
                  >
                    <ShoppingBag className="w-4 h-4 mr-1" />
                    Orders
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/owner/restaurants/${restaurant.id}/employees`)}
                    className="w-full"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Staff
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/owner/restaurants/${restaurant.id}/job-applications`)}
                    className="w-full"
                  >
                    <Briefcase className="w-4 h-4 mr-1" />
                    Applications
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/owner/restaurants/${restaurant.id}/reports`)}
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Reports
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
