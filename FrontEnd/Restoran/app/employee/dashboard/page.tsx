"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Calendar, Users, MapPin, AlertCircle, UtensilsCrossed, Table as TableIcon, Edit, Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { employeeApi, type Reservation, type Menu, type Table } from "@/lib/employee-api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TableLocation, TableLocationLabels } from "@/types"
import Link from "next/link"

const reservationStatusConfig = {
  Pending: { label: "Onay Bekliyor", color: "bg-yellow-100 text-yellow-800" },
  Confirmed: { label: "Onaylandı", color: "bg-blue-100 text-blue-800" },
  Cancelled: { label: "İptal Edildi", color: "bg-red-100 text-red-800" },
  Completed: { label: "Tamamlandı", color: "bg-green-100 text-green-800" },
  NoShow: { label: "Gelmedi", color: "bg-orange-100 text-orange-800" },
}

const tableStatusConfig = {
  Available: { label: "Müsait", color: "bg-green-100 text-green-800" },
  Occupied: { label: "Dolu", color: "bg-red-100 text-red-800" },
  Reserved: { label: "Rezerve", color: "bg-blue-100 text-blue-800" },
  OutOfService: { label: "Hizmet Dışı", color: "bg-gray-100 text-gray-800" },
}

const getLocationLabel = (location?: string) => {
  if (!location) return "-"
  if (location in TableLocationLabels) {
    return TableLocationLabels[location as TableLocation]
  }
  return location
}

export default function EmployeeDashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  
  // Tab state
  const [activeTab, setActiveTab] = useState("all")

  // Edit dialogs state
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [editingMenuItem, setEditingMenuItem] = useState<any | null>(null)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false)
  const [isMenuItemDialogOpen, setIsMenuItemDialogOpen] = useState(false)
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false)
  
  // Add dialogs state
  const [isAddMenuItemDialogOpen, setIsAddMenuItemDialogOpen] = useState(false)
  const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false)
  const [selectedMenuForNewItem, setSelectedMenuForNewItem] = useState<string | null>(null)
  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isAvailable: true,
  })
  const [newTable, setNewTable] = useState({
    tableNumber: "",
    capacity: "",
    location: TableLocation.IcMekan as string, // Varsayılan: İç Mekan
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      console.log("🔍 Employee Dashboard - User:", user)
      console.log("🔍 Employee Dashboard - EmployerRestaurantId:", user?.employerRestaurantId)
      
      if (!user?.employerRestaurantId) {
        console.error("❌ EmployerRestaurantId bulunamadı!")
        setError("Restoran bilgisi bulunamadı. Lütfen bir restorana bağlı olduğunuzdan emin olun.")
        setLoading(false)
        return
      }

      setError(null)

      try {
        console.log("🚀 Veriler yükleniyor...")
        const [reservationsResponse, menusResponse, tablesResponse] = await Promise.all([
          employeeApi.reservations.getAll(user.employerRestaurantId, currentPage, pageSize),
          employeeApi.menus.getAll(user.employerRestaurantId),
          employeeApi.tables.getAll(user.employerRestaurantId),
        ])

        console.log("✅ Rezervasyonlar:", reservationsResponse)
        console.log("✅ Menüler:", menusResponse)
        console.log("✅ Masalar:", tablesResponse)

        setReservations(reservationsResponse.items)
        setTotalCount(reservationsResponse.totalCount || reservationsResponse.items.length)
        setMenus(menusResponse)
        setTables(tablesResponse)
      } catch (err: any) {
        console.error("❌ Veri yükleme hatası:", err)
        console.error("❌ Hata detayı:", err.response || err.message)
        setError(err.message || "Veriler yüklenirken bir hata oluştu.")
        toast({
          title: "Hata",
          description: err.message || "Veriler yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.employerRestaurantId, currentPage, pageSize, toast])

  // Status güncelleme fonksiyonu
  const handleUpdateReservationStatus = async (reservationId: string, newStatus: string) => {
    try {
      await employeeApi.reservations.updateStatus(reservationId, newStatus)
      
      setReservations(
        reservations.map((res) =>
          res.id === reservationId ? { ...res, status: newStatus as Reservation["status"] } : res
        )
      )
      
      toast({ 
        title: "Başarılı",
        description: "Rezervasyon durumu güncellendi" 
      })
    } catch (err: any) {
      console.error("Rezervasyon güncelleme hatası:", err)
      toast({
        title: "Hata",
        description: "Rezervasyon durumu güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  // Menü güncelleme
  const handleUpdateMenu = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMenu) return

    try {
      await employeeApi.menus.update(editingMenu.id, {
        name: editingMenu.name,
        description: editingMenu.description,
        isActive: editingMenu.isActive ?? true,
      })

      setMenus(menus.map(m => m.id === editingMenu.id ? editingMenu : m))
      setIsMenuDialogOpen(false)
      setEditingMenu(null)
      
      toast({
        title: "Başarılı",
        description: "Menü başarıyla güncellendi"
      })
    } catch (err: any) {
      console.error("Menü güncelleme hatası:", err)
      toast({
        title: "Hata",
        description: "Menü güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  // Menü öğesi güncelleme
  const handleUpdateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMenuItem) return

    try {
      const updatedData = {
        name: editingMenuItem.name,
        description: editingMenuItem.description,
        price: parseFloat(editingMenuItem.price.toString()),
        category: editingMenuItem.category,
        isAvailable: editingMenuItem.isAvailable,
      }

      await employeeApi.menuItems.update(editingMenuItem.id, updatedData)

      // State'i güncellenmiş veri ile güncelle
      setMenus(menus.map(menu => ({
        ...menu,
        menuItems: menu.menuItems?.map(item => 
          item.id === editingMenuItem.id ? { ...item, ...updatedData } : item
        )
      })))

      setIsMenuItemDialogOpen(false)
      setEditingMenuItem(null)
      
      toast({
        title: "Başarılı",
        description: "Menü öğesi başarıyla güncellendi"
      })
    } catch (err: any) {
      console.error("Menü öğesi güncelleme hatası:", err)
      toast({
        title: "Hata",
        description: "Menü öğesi güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  // Masa güncelleme
  const handleUpdateTable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTable) return

    try {
      await employeeApi.tables.update(editingTable.id, {
        tableNumber: editingTable.tableNumber,
        capacity: editingTable.capacity,
        location: editingTable.location || "",
        status: editingTable.status,
      })

      setTables(tables.map(t => t.id === editingTable.id ? editingTable : t))
      setIsTableDialogOpen(false)
      setEditingTable(null)
      
      toast({
        title: "Başarılı",
        description: "Masa başarıyla güncellendi"
      })
    } catch (err: any) {
      console.error("Masa güncelleme hatası:", err)
      toast({
        title: "Hata",
        description: "Masa güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  // Menü öğesi ekleme
  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMenuForNewItem) return

    try {
      const createdItem = await employeeApi.menuItems.create(selectedMenuForNewItem, {
        name: newMenuItem.name,
        description: newMenuItem.description,
        price: parseFloat(newMenuItem.price),
        category: newMenuItem.category,
        isAvailable: newMenuItem.isAvailable,
      })

      setMenus(menus.map(menu => 
        menu.id === selectedMenuForNewItem 
          ? { ...menu, menuItems: [...(menu.menuItems || []), createdItem] }
          : menu
      ))

      setIsAddMenuItemDialogOpen(false)
      setNewMenuItem({
        name: "",
        description: "",
        price: "",
        category: "",
        isAvailable: true,
      })
      setSelectedMenuForNewItem(null)
      
      toast({
        title: "Başarılı",
        description: "Menü öğesi başarıyla eklendi"
      })
    } catch (err: any) {
      console.error("Menü öğesi ekleme hatası:", err)
      toast({
        title: "Hata",
        description: "Menü öğesi eklenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  // Masa ekleme
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("🔵 Masa ekleme başladı...")
    console.log("🔵 User:", user)
    console.log("🔵 EmployerRestaurantId:", user?.employerRestaurantId)
    console.log("🔵 NewTable:", newTable)
    
    if (!user?.employerRestaurantId) {
      console.error("❌ EmployerRestaurantId bulunamadı!")
      toast({
        title: "Hata",
        description: "Restoran bilgisi bulunamadı",
        variant: "destructive",
      })
      return
    }

    // Validasyonlar
    if (!newTable.tableNumber || parseInt(newTable.tableNumber) <= 0) {
      console.error("❌ Masa numarası geçersiz:", newTable.tableNumber)
      toast({
        title: "Hata",
        description: "Lütfen geçerli bir masa numarası girin",
        variant: "destructive",
      })
      return
    }

    if (!newTable.capacity || parseInt(newTable.capacity) <= 0) {
      console.error("❌ Kapasite geçersiz:", newTable.capacity)
      toast({
        title: "Hata",
        description: "Lütfen geçerli bir kapasite girin",
        variant: "destructive",
      })
      return
    }

    if (!newTable.location) {
      console.error("❌ Konum seçilmedi")
      toast({
        title: "Hata",
        description: "Lütfen bir konum seçin",
        variant: "destructive",
      })
      return
    }

    const tableData = {
      tableNumber: parseInt(newTable.tableNumber),
      capacity: parseInt(newTable.capacity),
      location: newTable.location,
    }
    
    console.log("🔵 Gönderilecek veri:", tableData)

    try {
      console.log("🔵 API çağrısı yapılıyor...")
      const createdTable = await employeeApi.tables.create(user.employerRestaurantId, tableData)
      console.log("✅ Masa oluşturuldu:", createdTable)

      setTables([...tables, createdTable])
      setIsAddTableDialogOpen(false)
      setNewTable({
        tableNumber: "",
        capacity: "",
        location: TableLocation.IcMekan as string,
      })
      
      toast({
        title: "Başarılı",
        description: "Masa başarıyla eklendi (Durum: Müsait)",
      })
      
      console.log("✅ Masa başarıyla eklendi ve state güncellendi")
    } catch (err: any) {
      console.error("❌ Masa ekleme hatası:", err)
      console.error("❌ Hata detayı:", err.response || err.message || err)
      toast({
        title: "Hata",
        description: err.message || "Masa eklenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  // Menü silme
  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm("Bu menüyü silmek istediğinizden emin misiniz?")) return

    try {
      await employeeApi.menus.delete(menuId)
      setMenus(menus.filter(m => m.id !== menuId))
      
      toast({
        title: "Başarılı",
        description: "Menü başarıyla silindi"
      })
    } catch (err: any) {
      console.error("Menü silme hatası:", err)
      toast({
        title: "Hata",
        description: "Menü silinirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  // Menü öğesi silme
  const handleDeleteMenuItem = async (menuId: string, itemId: string) => {
    if (!confirm("Bu menü öğesini silmek istediğinizden emin misiniz?")) return

    try {
      await employeeApi.menuItems.delete(itemId)
      
      setMenus(menus.map(menu => 
        menu.id === menuId 
          ? { ...menu, menuItems: menu.menuItems?.filter(item => item.id !== itemId) }
          : menu
      ))
      
      toast({
        title: "Başarılı",
        description: "Menü öğesi başarıyla silindi"
      })
    } catch (err: any) {
      console.error("Menü öğesi silme hatası:", err)
      toast({
        title: "Hata",
        description: "Menü öğesi silinirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  // Masa silme
  const handleDeleteTable = async (tableId: string) => {
    if (!confirm("Bu masayı silmek istediğinizden emin misiniz?")) return

    try {
      await employeeApi.tables.delete(tableId)
      setTables(tables.filter(t => t.id !== tableId))
      
      toast({
        title: "Başarılı",
        description: "Masa başarıyla silindi"
      })
    } catch (err: any) {
      console.error("Masa silme hatası:", err)
      toast({
        title: "Hata",
        description: "Masa silinirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  // İstatistikler
  const pendingReservations = reservations.filter(r => r.status === "Pending").length
  const confirmedReservations = reservations.filter(r => r.status === "Confirmed").length
  const totalMenuItems = menus.reduce((acc, menu) => acc + (menu.menuItems?.length || 0), 0)
  
  // Onaylanmış rezervasyonların tableId'lerini al
  const confirmedReservationTableIds = new Set(
    reservations
      .filter(r => r.status === "Confirmed")
      .map(r => r.tableId)
  )
  
  // Masaları rezervasyon durumuna göre güncelle
  const updatedTables = tables.map(table => {
    // Eğer bu masa onaylanmış bir rezervasyona sahipse, Dolu olarak göster
    if (confirmedReservationTableIds.has(table.id)) {
      return { ...table, status: "Occupied" as const }
    }
    return table
  })
  
  const availableTables = updatedTables.filter(t => t.status === "Available").length

  // Filtrelenmiş rezervasyonlar - Tamamlanmış ve İptal Edilenleri ayır
  const activeReservations = reservations.filter(r => r.status !== "Completed" && r.status !== "Cancelled")
  const completedReservations = reservations.filter(r => r.status === "Completed")
  const cancelledReservations = reservations.filter(r => r.status === "Cancelled")

  // Pagination hesaplamaları
  const totalPages = Math.ceil(totalCount / pageSize)

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Çalışan Paneli</h1>
            <p className="text-muted-foreground">Restoran yönetimi ve operasyonlar</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => window.location.href = '/employee/menus'}
              variant="outline"
            >
              <UtensilsCrossed className="h-4 w-4 mr-2" />
              Menü Yönetimi
            </Button>
          </div>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Bekleyen Rezervasyonlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReservations}</div>
            <p className="text-xs text-muted-foreground mt-1">Onay bekliyor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Onaylı Rezervasyonlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedReservations}</div>
            <p className="text-xs text-muted-foreground mt-1">Aktif rezervasyonlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              Müsait Masalar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableTables} / {updatedTables.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Toplam masa sayısı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              Menü Öğeleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMenuItems}</div>
            <p className="text-xs text-muted-foreground mt-1">{menus.length} menüde</p>
          </CardContent>
        </Card>
      </div>

      {/* Ana Tablar */}
      <Tabs defaultValue="reservations" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="reservations" className="gap-2">
            <Calendar className="h-4 w-4" />
            Rezervasyonlar ({reservations.length})
          </TabsTrigger>
          <TabsTrigger value="tables" className="gap-2">
            <TableIcon className="h-4 w-4" />
            Masalar ({updatedTables.length})
          </TabsTrigger>
          <TabsTrigger value="menus" className="gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Menüler ({menus.length})
          </TabsTrigger>
        </TabsList>

        {/* Rezervasyonlar Tab */}
        <TabsContent value="reservations">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                Tüm Rezervasyonlar ({activeReservations.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Tamamlanmış Rezervasyonlar ({completedReservations.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                İptal Edilen Rezervasyonlar ({cancelledReservations.length})
              </TabsTrigger>
            </TabsList>

            {/* Tüm Rezervasyonlar - Aktif olanlar, status değiştirme ile */}
            <TabsContent value="all">
              {activeReservations.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Rezervasyon yok</h3>
                    <p className="text-muted-foreground">Henüz aktif rezervasyon bulunmuyor</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {activeReservations.map((reservation) => (
                    <Card key={reservation.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">Rezervasyon #{reservation.id.substring(0, 8)}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3" />
                              {new Date(reservation.reservationDate).toLocaleString("tr-TR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </CardDescription>
                          </div>
                          <Badge className={reservationStatusConfig[reservation.status]?.color || "bg-gray-100 text-gray-800"}>
                            {reservationStatusConfig[reservation.status]?.label || reservation.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Müşteri</p>
                            <p className="font-medium">{reservation.customerName}</p>
                            <p className="text-xs text-muted-foreground">{reservation.customerEmail}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Kişi Sayısı</p>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span className="font-medium">{reservation.numberOfGuests} Kişi</span>
                            </div>
                          </div>
                        </div>

                        {reservation.specialRequests && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Özel İstekler</p>
                            <p className="text-sm bg-muted p-2 rounded">{reservation.specialRequests}</p>
                          </div>
                        )}

                        {/* Status Değiştirme - Aktif rezervasyonlar için */}
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground mb-2">Durum Değiştir</p>
                          <Select
                            value={reservation.status}
                            onValueChange={(value) => handleUpdateReservationStatus(reservation.id, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Onay Bekliyor</SelectItem>
                              <SelectItem value="Confirmed">Onaylandı</SelectItem>
                              <SelectItem value="Cancelled">İptal Edildi</SelectItem>
                              <SelectItem value="Completed">Tamamlandı</SelectItem>
                              <SelectItem value="NoShow">Gelmedi</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tamamlanmış Rezervasyonlar - Status değiştirme YOK */}
            <TabsContent value="completed">
              {completedReservations.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Tamamlanmış rezervasyon yok</h3>
                    <p className="text-muted-foreground">Henüz tamamlanmış rezervasyon bulunmuyor</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {completedReservations.map((reservation) => (
                    <Card key={reservation.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">Rezervasyon #{reservation.id.substring(0, 8)}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3" />
                              {new Date(reservation.reservationDate).toLocaleString("tr-TR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </CardDescription>
                          </div>
                          <Badge className={reservationStatusConfig[reservation.status]?.color || "bg-gray-100 text-gray-800"}>
                            {reservationStatusConfig[reservation.status]?.label || reservation.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Müşteri</p>
                            <p className="font-medium">{reservation.customerName}</p>
                            <p className="text-xs text-muted-foreground">{reservation.customerEmail}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Kişi Sayısı</p>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span className="font-medium">{reservation.numberOfGuests} Kişi</span>
                            </div>
                          </div>
                        </div>

                        {reservation.specialRequests && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Özel İstekler</p>
                            <p className="text-sm bg-muted p-2 rounded">{reservation.specialRequests}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* İptal Edilen Rezervasyonlar - Status değiştirme YOK */}
            <TabsContent value="cancelled">
              {cancelledReservations.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">İptal edilen rezervasyon yok</h3>
                    <p className="text-muted-foreground">Henüz iptal edilen rezervasyon bulunmuyor</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {cancelledReservations.map((reservation) => (
                    <Card key={reservation.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">Rezervasyon #{reservation.id.substring(0, 8)}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3" />
                              {new Date(reservation.reservationDate).toLocaleString("tr-TR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </CardDescription>
                          </div>
                          <Badge className={reservationStatusConfig[reservation.status]?.color || "bg-gray-100 text-gray-800"}>
                            {reservationStatusConfig[reservation.status]?.label || reservation.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Müşteri</p>
                            <p className="font-medium">{reservation.customerName}</p>
                            <p className="text-xs text-muted-foreground">{reservation.customerEmail}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Kişi Sayısı</p>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span className="font-medium">{reservation.numberOfGuests} Kişi</span>
                            </div>
                          </div>
                        </div>

                        {reservation.specialRequests && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Özel İstekler</p>
                            <p className="text-sm bg-muted p-2 rounded">{reservation.specialRequests}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Önceki
            </Button>
            <span className="text-sm text-muted-foreground">
              Sayfa {currentPage} / {totalPages > 0 ? totalPages : 1}
            </span>
            <Button
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Sonraki
            </Button>
          </div>
        </TabsContent>

        {/* Masalar Tab */}
        <TabsContent value="tables">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Masalar</h3>
            <Button
              onClick={() => setIsAddTableDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Yeni Masa Ekle
            </Button>
          </div>
          
          {updatedTables.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <TableIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Masa yok</h3>
                <p className="text-muted-foreground">Henüz masa tanımlanmamış</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {updatedTables.map((table) => (
                <Card key={table.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">Masa {table.tableNumber}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={tableStatusConfig[table.status]?.color || "bg-gray-100 text-gray-800"}>
                          {tableStatusConfig[table.status]?.label || table.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingTable(table)
                            setIsTableDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTable(table.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Kapasite</span>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{table.capacity} Kişi</span>
                      </div>
                    </div>
                    {table.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Konum</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span className="font-medium">{getLocationLabel(table.location)}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Menüler Tab */}
        <TabsContent value="menus">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Menüler</h3>
            <Button
              onClick={() => window.location.href = '/employee/menus'}
              className="gap-2"
            >
              <UtensilsCrossed className="h-4 w-4" />
              Detaylı Menü Yönetimi
            </Button>
          </div>
          
          {menus.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Menü yok</h3>
                <p className="text-muted-foreground">Henüz menü oluşturulmamış</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {menus.map((menu) => (
                <Card key={menu.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{menu.name}</CardTitle>
                        {menu.description && (
                          <CardDescription>{menu.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingMenu(menu)
                            setIsMenuDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMenu(menu.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">Menü Öğeleri</h4>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedMenuForNewItem(menu.id)
                          setIsAddMenuItemDialogOpen(true)
                        }}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Öğe Ekle
                      </Button>
                    </div>
                    
                    {menu.menuItems && menu.menuItems.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menu.menuItems.map((item: any) => (
                          <div key={item.id} className="flex items-start justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{item.name}</h4>
                                {!item.isAvailable && (
                                  <Badge variant="secondary" className="text-xs">Tükendi</Badge>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                              )}
                              {item.category && (
                                <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <div className="font-bold text-lg whitespace-nowrap">
                                ₺{item.price}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingMenuItem(item)
                                  setIsMenuItemDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteMenuItem(menu.id, item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Bu menüde henüz ürün yok
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs for editing */}
      {/* Menü Düzenle Dialog */}
      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Menü Düzenle</DialogTitle>
            <DialogDescription>
              Menü bilgilerini güncelleyin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateMenu}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="menu-name">Menü Adı</Label>
                <Input
                  id="menu-name"
                  value={editingMenu?.name || ""}
                  onChange={(e) => setEditingMenu(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="menu-description">Açıklama</Label>
                <Textarea
                  id="menu-description"
                  value={editingMenu?.description || ""}
                  onChange={(e) => setEditingMenu(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsMenuDialogOpen(false)}>
                İptal
              </Button>
              <Button type="submit">
                Kaydet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Menü Öğesi Düzenle Dialog */}
      <Dialog open={isMenuItemDialogOpen} onOpenChange={setIsMenuItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Menü Öğesi Düzenle</DialogTitle>
            <DialogDescription>
              Menü öğesi bilgilerini güncelleyin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateMenuItem}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="item-name">Öğe Adı</Label>
                <Input
                  id="item-name"
                  value={editingMenuItem?.name || ""}
                  onChange={(e) => setEditingMenuItem((prev: any) => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-description">Açıklama</Label>
                <Textarea
                  id="item-description"
                  value={editingMenuItem?.description || ""}
                  onChange={(e) => setEditingMenuItem((prev: any) => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-price">Fiyat</Label>
                <Input
                  id="item-price"
                  type="number"
                  step="0.01"
                  value={editingMenuItem?.price || ""}
                  onChange={(e) => setEditingMenuItem((prev: any) => prev ? { ...prev, price: e.target.value } : null)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-category">Kategori</Label>
                <Input
                  id="item-category"
                  value={editingMenuItem?.category || ""}
                  onChange={(e) => setEditingMenuItem((prev: any) => prev ? { ...prev, category: e.target.value } : null)}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="item-available"
                  checked={editingMenuItem?.isAvailable || false}
                  onChange={(e) => setEditingMenuItem((prev: any) => prev ? { ...prev, isAvailable: e.target.checked } : null)}
                  className="w-4 h-4"
                />
                <Label htmlFor="item-available">Müsait</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsMenuItemDialogOpen(false)}>
                İptal
              </Button>
              <Button type="submit">
                Kaydet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Masa Düzenle Dialog */}
      <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Masa Düzenle</DialogTitle>
            <DialogDescription>
              Masa bilgilerini güncelleyin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTable}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="table-number">Masa Numarası</Label>
                <Input
                  id="table-number"
                  type="number"
                  value={editingTable?.tableNumber || ""}
                  onChange={(e) => setEditingTable(prev => prev ? { ...prev, tableNumber: parseInt(e.target.value) } : null)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="table-capacity">Kapasite</Label>
                <Input
                  id="table-capacity"
                  type="number"
                  value={editingTable?.capacity || ""}
                  onChange={(e) => setEditingTable(prev => prev ? { ...prev, capacity: parseInt(e.target.value) } : null)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="table-location">Konum</Label>
                <Select
                  value={editingTable?.location || ""}
                  onValueChange={(value) => setEditingTable(prev => prev ? { ...prev, location: value } : null)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Konum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TableLocation.IcMekan}>
                      {TableLocationLabels[TableLocation.IcMekan]}
                    </SelectItem>
                    <SelectItem value={TableLocation.PencereKenari}>
                      {TableLocationLabels[TableLocation.PencereKenari]}
                    </SelectItem>
                    <SelectItem value={TableLocation.Disari}>
                      {TableLocationLabels[TableLocation.Disari]}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTableDialogOpen(false)}>
                İptal
              </Button>
              <Button type="submit">
                Kaydet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Menü Öğesi Ekle Dialog */}
      <Dialog open={isAddMenuItemDialogOpen} onOpenChange={setIsAddMenuItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Menü Öğesi Ekle</DialogTitle>
            <DialogDescription>
              Yeni bir menü öğesi oluşturun.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMenuItem}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="new-item-name">Öğe Adı</Label>
                <Input
                  id="new-item-name"
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-item-description">Açıklama</Label>
                <Textarea
                  id="new-item-description"
                  value={newMenuItem.description}
                  onChange={(e) => setNewMenuItem(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-item-price">Fiyat</Label>
                <Input
                  id="new-item-price"
                  type="number"
                  step="0.01"
                  value={newMenuItem.price}
                  onChange={(e) => setNewMenuItem(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-item-category">Kategori</Label>
                <Input
                  id="new-item-category"
                  value={newMenuItem.category}
                  onChange={(e) => setNewMenuItem(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="new-item-available"
                  checked={newMenuItem.isAvailable}
                  onChange={(e) => setNewMenuItem(prev => ({ ...prev, isAvailable: e.target.checked }))}
                  className="w-4 h-4"
                />
                <Label htmlFor="new-item-available">Müsait</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddMenuItemDialogOpen(false)}>
                İptal
              </Button>
              <Button type="submit">
                Ekle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Masa Ekle Dialog */}
      <Dialog open={isAddTableDialogOpen} onOpenChange={setIsAddTableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Masa Ekle</DialogTitle>
            <DialogDescription>
              Yeni bir masa oluşturun.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTable}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="new-table-number">Masa Numarası *</Label>
                <Input
                  id="new-table-number"
                  type="number"
                  min="1"
                  value={newTable.tableNumber}
                  onChange={(e) => setNewTable(prev => ({ ...prev, tableNumber: e.target.value }))}
                  placeholder="Örn: 1, 2, 3..."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-table-capacity">Kapasite *</Label>
                <Input
                  id="new-table-capacity"
                  type="number"
                  min="1"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="Örn: 2, 4, 6..."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-table-location">Konum *</Label>
                <Select
                  value={newTable.location}
                  onValueChange={(value) => setNewTable(prev => ({ ...prev, location: value }))}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Konum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TableLocation.IcMekan}>
                      {TableLocationLabels[TableLocation.IcMekan]}
                    </SelectItem>
                    <SelectItem value={TableLocation.PencereKenari}>
                      {TableLocationLabels[TableLocation.PencereKenari]}
                    </SelectItem>
                    <SelectItem value={TableLocation.Disari}>
                      {TableLocationLabels[TableLocation.Disari]}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  * Masanın konumunu seçin (Zorunlu)
                </p>
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm text-muted-foreground">
                  ℹ️ Yeni masa eklendiğinde durum otomatik olarak <strong>Müsait</strong> olarak ayarlanır.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddTableDialogOpen(false)}>
                İptal
              </Button>
              <Button type="submit">
                Ekle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

