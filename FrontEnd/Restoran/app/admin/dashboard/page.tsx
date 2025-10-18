"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Users, Store, Briefcase, Plus, Edit, Trash2, Shield, CheckCircle, XCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { AppUser, Restaurant, OwnershipApplication, ApplicationStatus } from "@/types"

const mockUsers: AppUser[] = [
  {
    id: "1",
    email: "admin@system.com",
    fullName: "Admin User",
    phoneNumber: "+90 555 000 0000",
    role: "Admin",
  },
  {
    id: "2",
    email: "owner@lezzetduragi.com",
    fullName: "Mehmet Yılmaz",
    phoneNumber: "+90 555 111 1111",
    role: "Owner",
  },
  {
    id: "3",
    email: "customer@example.com",
    fullName: "Ayşe Demir",
    phoneNumber: "+90 555 222 2222",
    role: "Customer",
  },
  {
    id: "4",
    email: "employee@lezzetduragi.com",
    fullName: "Can Öztürk",
    phoneNumber: "+90 555 333 3333",
    role: "Employee",
  },
]

const mockRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "Lezzet Durağı",
    description: "Geleneksel Türk mutfağı",
    address: "Kadıköy, İstanbul",
    phoneNumber: "+90 555 123 4567",
    email: "info@lezzetduragi.com",
    rating: 4.5,
    isActive: true,
    ownerId: "2",
    latitude: 40.9929,
    longitude: 29.0261,
    category: "Türk Mutfağı",
    priceRange: "₺₺",
  },
  {
    id: "2",
    name: "Pizza Palace",
    description: "İtalyan usulü pizzalar",
    address: "Beşiktaş, İstanbul",
    phoneNumber: "+90 555 234 5678",
    email: "info@pizzapalace.com",
    rating: 4.7,
    isActive: true,
    ownerId: "2",
    latitude: 41.0422,
    longitude: 29.0089,
    category: "İtalyan",
    priceRange: "₺₺₺",
  },
]

const mockApplications: OwnershipApplication[] = [
  {
    id: "1",
    userId: "3",
    businessName: "Yeni Lezzet Mekanı",
    businessDescription: "Modern Türk mutfağı konsepti",
    businessAddress: "Beşiktaş, İstanbul",
    businessPhone: "+90 555 999 8888",
    businessEmail: "info@yenilezzet.com",
    category: "Türk Mutfağı",
    additionalNotes: "5 yıllık deneyim ile yeni konsept restoran açmak istiyorum",
    status: "Pending",
    applicationDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
  },
]

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [applications, setApplications] = useState<OwnershipApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
  const [isRestaurantDialogOpen, setIsRestaurantDialogOpen] = useState(false)
  const [viewingRestaurant, setViewingRestaurant] = useState<Restaurant | null>(null)
  const [isRestaurantDetailOpen, setIsRestaurantDetailOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      setUsers(mockUsers)
      setRestaurants(mockRestaurants)
      setApplications(mockApplications)
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const userData = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      role: formData.get("role") as AppUser["role"],
    }

    await new Promise((resolve) => setTimeout(resolve, 500))

    if (editingUser) {
      setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...userData } : u)))
      toast({ title: "Kullanıcı güncellendi" })
    } else {
      const newUser: AppUser = {
        id: Date.now().toString(),
        ...userData,
      }
      setUsers([...users, newUser])
      toast({ title: "Kullanıcı oluşturuldu" })
    }

    setIsUserDialogOpen(false)
    setEditingUser(null)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return

    await new Promise((resolve) => setTimeout(resolve, 500))
    setUsers(users.filter((u) => u.id !== userId))
    toast({ title: "Kullanıcı silindi" })
  }

  const handleSaveRestaurant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const restaurantData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      address: formData.get("address") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      email: formData.get("email") as string,
      category: formData.get("category") as string,
      priceRange: formData.get("priceRange") as string,
      imageUrl: formData.get("imageUrl") as string,
      latitude: parseFloat(formData.get("latitude") as string) || 0,
      longitude: parseFloat(formData.get("longitude") as string) || 0,
      ownerId: formData.get("ownerId") as string,
    }

    await new Promise((resolve) => setTimeout(resolve, 500))

    if (editingRestaurant) {
      setRestaurants(
        restaurants.map((r) =>
          r.id === editingRestaurant.id
            ? { ...r, ...restaurantData, rating: r.rating, isActive: r.isActive }
            : r,
        ),
      )
      toast({ title: "Restoran güncellendi" })
    } else {
      const newRestaurant: Restaurant = {
        id: Date.now().toString(),
        ...restaurantData,
        rating: 0,
        isActive: true,
      }
      setRestaurants([...restaurants, newRestaurant])
      toast({ title: "Restoran oluşturuldu" })
    }

    setIsRestaurantDialogOpen(false)
    setEditingRestaurant(null)
  }

  const handleDeleteRestaurant = async (restaurantId: string) => {
    if (!confirm("Bu restoranı silmek istediğinizden emin misiniz?")) return

    await new Promise((resolve) => setTimeout(resolve, 500))
    setRestaurants(restaurants.filter((r) => r.id !== restaurantId))
    toast({ title: "Restoran silindi" })
  }

  const handleToggleRestaurantStatus = async (restaurantId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    setRestaurants(restaurants.map((r) => (r.id === restaurantId ? { ...r, isActive: !r.isActive } : r)))
    toast({ title: "Restoran durumu güncellendi" })
  }

  const handleApplicationAction = async (applicationId: string, status: ApplicationStatus) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    setApplications(
      applications.map((a) => (a.id === applicationId ? { ...a, status } : a)),
    )
    toast({ title: `Başvuru ${status === "approved" ? "onaylandı" : "reddedildi"}` })
  }

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.address.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredApplications = applications.filter(
    (application) =>
      users.find((u) => u.id === application.userId)?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      users.find((u) => u.id === application.userId)?.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    { title: "Toplam Kullanıcı", value: users.length, icon: Users, color: "text-blue-600" },
    { title: "Restoranlar", value: restaurants.length, icon: Store, color: "text-green-600" },
    {
      title: "Restoran Sahipleri",
      value: users.filter((u) => u.role === "Owner").length,
      icon: Briefcase,
      color: "text-purple-600",
    },
    {
      title: "Çalışanlar",
      value: users.filter((u) => u.role === "Employee").length,
      icon: Users,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Paneli</h1>
        <p className="text-muted-foreground">Sistem genelinde kullanıcı ve restoran yönetimi</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
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

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kullanıcı, restoran veya rol ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Kullanıcılar ({users.length})
          </TabsTrigger>
          <TabsTrigger value="restaurants" className="gap-2">
            <Store className="h-4 w-4" />
            Restoranlar ({restaurants.length})
          </TabsTrigger>
          <TabsTrigger value="applications" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Başvurular ({applications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Kullanıcı Yönetimi</CardTitle>
                  <CardDescription>Tüm kullanıcıları görüntüleyin ve yönetin</CardDescription>
                </div>
                <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingUser(null)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Yeni Kullanıcı
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingUser ? "Kullanıcı Düzenle" : "Yeni Kullanıcı Oluştur"}</DialogTitle>
                      <DialogDescription>Kullanıcı bilgilerini girin</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveUser} className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Ad Soyad</Label>
                        <Input id="fullName" name="fullName" defaultValue={editingUser?.fullName} required />
                      </div>
                      <div>
                        <Label htmlFor="email">E-posta</Label>
                        <Input id="email" name="email" type="email" defaultValue={editingUser?.email} required />
                      </div>
                      <div>
                        <Label htmlFor="phoneNumber">Telefon</Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          defaultValue={editingUser?.phoneNumber}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Rol</Label>
                        <Select name="role" defaultValue={editingUser?.role || "Customer"}>
                          <SelectTrigger id="role">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Customer">Müşteri</SelectItem>
                            <SelectItem value="Owner">Restoran Sahibi</SelectItem>
                            <SelectItem value="Employee">Çalışan</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full">
                        {editingUser ? "Güncelle" : "Oluştur"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{user.fullName}</h3>
                        <Badge variant={user.role === "Admin" ? "default" : "secondary"}>
                          {user.role === "Admin" && <Shield className="h-3 w-3 mr-1" />}
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-sm text-muted-foreground">{user.phoneNumber}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingUser(user)
                          setIsUserDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.role === "Admin"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restaurants">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Restoran Yönetimi</CardTitle>
                  <CardDescription>Tüm restoranları görüntüleyin ve yönetin</CardDescription>
                </div>
                <Dialog open={isRestaurantDialogOpen} onOpenChange={setIsRestaurantDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingRestaurant(null)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Yeni Restoran
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingRestaurant ? "Restoran Düzenle" : "Yeni Restoran Oluştur"}
                      </DialogTitle>
                      <DialogDescription>Restoran bilgilerini girin</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveRestaurant} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="name">Restoran Adı</Label>
                          <Input id="name" name="name" defaultValue={editingRestaurant?.name} required />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="description">Açıklama</Label>
                          <Input
                            id="description"
                            name="description"
                            defaultValue={editingRestaurant?.description}
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="address">Adres</Label>
                          <Input id="address" name="address" defaultValue={editingRestaurant?.address} required />
                        </div>
                        <div>
                          <Label htmlFor="phoneNumber">Telefon</Label>
                          <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            defaultValue={editingRestaurant?.phoneNumber}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">E-posta</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={editingRestaurant?.email}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Kategori</Label>
                          <Select name="category" defaultValue={editingRestaurant?.category || "Türk Mutfağı"}>
                            <SelectTrigger id="category">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Türk Mutfağı">Türk Mutfağı</SelectItem>
                              <SelectItem value="İtalyan">İtalyan</SelectItem>
                              <SelectItem value="Çin">Çin</SelectItem>
                              <SelectItem value="Japon">Japon</SelectItem>
                              <SelectItem value="Hint">Hint</SelectItem>
                              <SelectItem value="Fast Food">Fast Food</SelectItem>
                              <SelectItem value="Kahvaltı">Kahvaltı</SelectItem>
                              <SelectItem value="Deniz Ürünleri">Deniz Ürünleri</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="priceRange">Fiyat Aralığı</Label>
                          <Select name="priceRange" defaultValue={editingRestaurant?.priceRange || "₺₺"}>
                            <SelectTrigger id="priceRange">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="₺">₺ (Ekonomik)</SelectItem>
                              <SelectItem value="₺₺">₺₺ (Orta)</SelectItem>
                              <SelectItem value="₺₺₺">₺₺₺ (Pahalı)</SelectItem>
                              <SelectItem value="₺₺₺₺">₺₺₺₺ (Lüks)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="latitude">Enlem</Label>
                          <Input
                            id="latitude"
                            name="latitude"
                            type="number"
                            step="any"
                            defaultValue={editingRestaurant?.latitude}
                            placeholder="40.9929"
                          />
                        </div>
                        <div>
                          <Label htmlFor="longitude">Boylam</Label>
                          <Input
                            id="longitude"
                            name="longitude"
                            type="number"
                            step="any"
                            defaultValue={editingRestaurant?.longitude}
                            placeholder="29.0261"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="imageUrl">Görsel URL</Label>
                          <Input
                            id="imageUrl"
                            name="imageUrl"
                            type="url"
                            defaultValue={editingRestaurant?.imageUrl}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="ownerId">Restoran Sahibi</Label>
                          <Select name="ownerId" defaultValue={editingRestaurant?.ownerId || users.find((u) => u.role === "Owner")?.id}>
                            <SelectTrigger id="ownerId">
                              <SelectValue placeholder="Restoran sahibi seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {users
                                .filter((u) => u.role === "Owner")
                                .map((owner) => (
                                  <SelectItem key={owner.id} value={owner.id}>
                                    {owner.fullName} ({owner.email})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button type="submit" className="w-full">
                        {editingRestaurant ? "Güncelle" : "Oluştur"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRestaurants.map((restaurant) => (
                  <div key={restaurant.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex gap-4 flex-1">
                      <img
                        src={restaurant.imageUrl || "/placeholder.svg"}
                        alt={restaurant.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{restaurant.name}</h3>
                          <Badge variant={restaurant.isActive ? "default" : "secondary"}>
                            {restaurant.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                          <Badge variant="outline">{restaurant.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{restaurant.description}</p>
                        <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                        <p className="text-sm text-muted-foreground">{restaurant.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setViewingRestaurant(restaurant)
                          setIsRestaurantDetailOpen(true)
                        }}
                      >
                        Detaylar
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingRestaurant(restaurant)
                          setIsRestaurantDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleToggleRestaurantStatus(restaurant.id)}>
                        {restaurant.isActive ? "Pasif" : "Aktif"}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteRestaurant(restaurant.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Başvuru Yönetimi</CardTitle>
                  <CardDescription>Restoran sahipliği başvurularını görüntüleyin ve yönetin</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredApplications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Hiç başvuru bulunamadı</p>
                ) : (
                  filteredApplications.map((application) => {
                    const user = users.find((u) => u.id === application.userId)
                    return (
                      <div
                        key={application.id}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">
                              {application.businessName}
                            </h3>
                            <Badge variant={application.status === "Approved" ? "default" : application.status === "Rejected" ? "destructive" : "secondary"}>
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
                          <p className="text-sm text-muted-foreground mb-1">{application.businessDescription}</p>
                          <p className="text-sm text-muted-foreground">{application.businessAddress}</p>
                          <p className="text-sm text-muted-foreground">{application.businessPhone}</p>
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-sm font-medium">Başvuran: {user?.fullName}</p>
                            <p className="text-xs text-muted-foreground">{user?.email} | {user?.phoneNumber}</p>
                          </div>
                          {application.additionalNotes && (
                            <p className="text-sm text-muted-foreground mt-2 italic">
                              Not: {application.additionalNotes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          {application.status === "Pending" && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApplicationAction(application.id, "Approved")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Onayla
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApplicationAction(application.id, "Rejected")}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reddet
                              </Button>
                            </>
                          )}
                          {application.status !== "Pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newStatus =
                                  application.status === "Approved" ? "Rejected" : "Approved"
                                handleApplicationAction(application.id, newStatus)
                              }}
                            >
                              {application.status === "Approved" ? "Reddet" : "Onayla"}
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Restaurant Detail Dialog */}
      <Dialog open={isRestaurantDetailOpen} onOpenChange={setIsRestaurantDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Restoran Detayları</DialogTitle>
          </DialogHeader>
          {viewingRestaurant && (
            <div className="space-y-6">
              <div className="flex gap-6">
                <img
                  src={viewingRestaurant.imageUrl || "/placeholder.svg"}
                  alt={viewingRestaurant.name}
                  className="w-48 h-48 object-cover rounded-lg"
                />
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{viewingRestaurant.name}</h2>
                    <div className="flex gap-2 mb-3">
                      <Badge variant={viewingRestaurant.isActive ? "default" : "secondary"}>
                        {viewingRestaurant.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                      <Badge variant="outline">{viewingRestaurant.category}</Badge>
                      <Badge variant="outline">{viewingRestaurant.priceRange}</Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{viewingRestaurant.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">★</span>
                    <span className="font-semibold">{viewingRestaurant.rating}</span>
                    <span className="text-muted-foreground">/ 5.0</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <h3 className="font-semibold mb-3">İletişim Bilgileri</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Telefon:</span>
                      <p className="font-medium">{viewingRestaurant.phoneNumber}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">E-posta:</span>
                      <p className="font-medium">{viewingRestaurant.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Adres:</span>
                      <p className="font-medium">{viewingRestaurant.address}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Konum Bilgileri</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Enlem:</span>
                      <p className="font-medium">{viewingRestaurant.latitude}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Boylam:</span>
                      <p className="font-medium">{viewingRestaurant.longitude}</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <h3 className="font-semibold mb-3">Restoran Sahibi</h3>
                  <div className="text-sm">
                    {(() => {
                      const owner = users.find((u) => u.id === viewingRestaurant.ownerId)
                      return owner ? (
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{owner.fullName}</p>
                            <p className="text-muted-foreground">{owner.email}</p>
                            <p className="text-muted-foreground">{owner.phoneNumber}</p>
                          </div>
                          <Badge>{owner.role}</Badge>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Sahip bilgisi bulunamadı</p>
                      )
                    })()}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsRestaurantDetailOpen(false)
                    setEditingRestaurant(viewingRestaurant)
                    setIsRestaurantDialogOpen(true)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Düzenle
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleToggleRestaurantStatus(viewingRestaurant.id)
                    setViewingRestaurant({ ...viewingRestaurant, isActive: !viewingRestaurant.isActive })
                  }}
                >
                  {viewingRestaurant.isActive ? "Pasif Yap" : "Aktif Yap"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
