"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Store, Briefcase, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { AuthService } from "@/lib/auth"

interface DashboardStats {
  totalUsers: number
  totalRestaurants: number
  totalRestaurantOwners: number
  totalEmployees: number
  totalPendingApplications: number
}

interface UserAdminShowDto {
  id: string
  userName: string
  email: string
  isActive: boolean
  role: string
}

interface RestaurantAdminListDto {
  id: string
  name: string
  address: string
  phoneNumber: string
  ownerName: string
  ownerEmail: string
  rate: number
  createdAt: string
}

interface OwnershipApplicationAdminDto {
  id: string
  userId: string
  userName: string
  userEmail: string
  businessName: string
  businessAddress: string
  category: string
  status: string
  applicationDate: string
  reviewedAt?: string
  rejectionReason?: string
}

interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [users, setUsers] = useState<PaginatedResult<UserAdminShowDto> | null>(null)
  const [restaurants, setRestaurants] = useState<PaginatedResult<RestaurantAdminListDto> | null>(null)
  const [applications, setApplications] = useState<PaginatedResult<OwnershipApplicationAdminDto> | null>(null)
  const [loading, setLoading] = useState(true)
  const [usersPage, setUsersPage] = useState(1)
  const [restaurantsPage, setRestaurantsPage] = useState(1)
  const [applicationsPage, setApplicationsPage] = useState(1)
  const [activeTab, setActiveTab] = useState("users")
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers(usersPage)
    }
  }, [usersPage, activeTab])

  useEffect(() => {
    if (activeTab === "restaurants") {
      fetchRestaurants(restaurantsPage)
    }
  }, [restaurantsPage, activeTab])

  useEffect(() => {
    if (activeTab === "applications") {
      fetchApplications(applicationsPage)
    }
  }, [applicationsPage, activeTab])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      console.log("Fetching dashboard stats...")
      console.log("API Base URL:", process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api")
      console.log("Token:", AuthService.getToken() ? "Token exists" : "No token found")
      
      const response = await api.get("/admin/dashboard")
      console.log("Dashboard response:", response)
      setStats(response) // response.data değil, direkt response
    } catch (error) {
      console.error("Dashboard fetch error:", error)
      toast({
        title: "Hata",
        description: "Dashboard verileri yüklenemedi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async (page: number) => {
    try {
      console.log("Fetching users page:", page)
      const response = await api.get(`/admin/users?pageNumber=${page}&pageSize=5`)
      console.log("Users response:", response)
      setUsers(response) // response.data değil, direkt response
    } catch (error) {
      console.error("Users fetch error:", error)
      toast({
        title: "Hata",
        description: "Kullanıcılar yüklenemedi",
        variant: "destructive",
      })
    }
  }

  const fetchRestaurants = async (page: number) => {
    try {
      console.log("Fetching restaurants page:", page)
      const response = await api.get(`/admin/restaurants?pageNumber=${page}&pageSize=5`)
      console.log("Restaurants response:", response)
      setRestaurants(response) // response.data değil, direkt response
    } catch (error) {
      console.error("Restaurants fetch error:", error)
      toast({
        title: "Hata",
        description: "Restoranlar yüklenemedi",
        variant: "destructive",
      })
    }
  }

  const fetchApplications = async (page: number) => {
    try {
      console.log("Fetching applications page:", page)
      const response = await api.get(`/admin/applications?pageNumber=${page}&pageSize=5`)
      console.log("Applications response:", response)
      setApplications(response) // response.data değil, direkt response
    } catch (error) {
      console.error("Applications fetch error:", error)
      toast({
        title: "Hata",
        description: "Başvurular yüklenemedi",
        variant: "destructive",
      })
    }
  }

  const handleApproveApplication = async (id: string) => {
    try {
      await api.post(`/admin/applications/${id}/approve`)
      toast({
        title: "Başarılı",
        description: "Başvuru onaylandı",
      })
      fetchApplications(applicationsPage)
      fetchDashboardStats()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Başvuru onaylanamadı",
        variant: "destructive",
      })
    }
  }

  const handleRejectApplication = async (id: string) => {
    const reason = prompt("Red sebebini girin:")
    if (!reason) return

    try {
      await api.post(`/admin/applications/${id}/reject`, { reason })
      toast({
        title: "Başarılı",
        description: "Başvuru reddedildi",
      })
      fetchApplications(applicationsPage)
      fetchDashboardStats()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Başvuru reddedilemedi",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const statsCards = stats ? [
    { title: "Toplam Kullanıcı", value: stats.totalUsers, icon: Users, color: "text-blue-600" },
    { title: "Restoranlar", value: stats.totalRestaurants, icon: Store, color: "text-green-600" },
    { title: "Restoran Sahipleri", value: stats.totalRestaurantOwners, icon: Briefcase, color: "text-purple-600" },
    { title: "Çalışanlar", value: stats.totalEmployees, icon: Users, color: "text-orange-600" },
  ] : []

  const PaginationControls = ({ data, currentPage, onPageChange }: { 
    data: PaginatedResult<any> | null, 
    currentPage: number, 
    onPageChange: (page: number) => void 
  }) => {
    if (!data) return null

    return (
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Toplam {data.totalCount} kayıt - Sayfa {data.pageNumber} / {data.totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!data.hasPreviousPage}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Önceki
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!data.hasNextPage}
          >
            Sonraki
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Paneli</h1>
        <p className="text-muted-foreground">Sistem genelinde kullanıcı ve restoran yönetimi</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Kullanıcılar
          </TabsTrigger>
          <TabsTrigger value="restaurants" className="gap-2">
            <Store className="h-4 w-4" />
            Restoranlar
          </TabsTrigger>
          <TabsTrigger value="applications" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Başvurular
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Kullanıcı Yönetimi</CardTitle>
              <CardDescription>Tüm kullanıcıları görüntüleyin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users?.items.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{user.userName}</h3>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Aktif" : "Pasif"}
                        </Badge>
                        <Badge variant="outline">{user.role}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
              <PaginationControls data={users} currentPage={usersPage} onPageChange={setUsersPage} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restaurants">
          <Card>
            <CardHeader>
              <CardTitle>Restoran Yönetimi</CardTitle>
              <CardDescription>Tüm restoranları görüntüleyin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {restaurants?.items.map((restaurant) => (
                  <div key={restaurant.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{restaurant.name}</h3>
                        <Badge variant="outline">★ {restaurant.rate.toFixed(1)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{restaurant.address}</p>
                      <p className="text-sm text-muted-foreground">{restaurant.phoneNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        Sahip: {restaurant.ownerName} ({restaurant.ownerEmail})
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Eklenme: {new Date(restaurant.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <PaginationControls data={restaurants} currentPage={restaurantsPage} onPageChange={setRestaurantsPage} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Başvuru Yönetimi</CardTitle>
              <CardDescription>Restoran sahipliği başvurularını görüntüleyin ve yönetin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications?.items.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Hiç başvuru bulunamadı</p>
                ) : (
                  applications?.items.map((application) => (
                    <div key={application.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{application.businessName}</h3>
                          <Badge
                            variant={
                              application.status === "Approved"
                                ? "default"
                                : application.status === "Rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {application.status === "Approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {application.status === "Rejected" && <XCircle className="h-3 w-3 mr-1" />}
                            {application.status === "Pending" && <Clock className="h-3 w-3 mr-1" />}
                            {application.status === "Approved"
                              ? "Onaylandı"
                              : application.status === "Rejected"
                              ? "Reddedildi"
                              : "Beklemede"}
                          </Badge>
                          <Badge variant="outline">{application.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{application.businessAddress}</p>
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-sm">
                            <span className="font-medium">Başvuran:</span> {application.userName} ({application.userEmail})
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Başvuru Tarihi: {new Date(application.applicationDate).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        {application.rejectionReason && (
                          <p className="text-sm text-red-600 mt-2">
                            <span className="font-medium">Red Sebebi:</span> {application.rejectionReason}
                          </p>
                        )}
                      </div>
                      {application.status === "Pending" && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApproveApplication(application.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Onayla
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectApplication(application.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reddet
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              <PaginationControls data={applications} currentPage={applicationsPage} onPageChange={setApplicationsPage} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
