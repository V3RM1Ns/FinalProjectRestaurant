"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Package, Calendar, Users, MapPin, AlertCircle, UtensilsCrossed, Table as TableIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { employeeApi, type Reservation, type Menu, type Table } from "@/lib/employee-api"
import { Alert, AlertDescription } from "@/components/ui/alert"

const reservationStatusConfig = {
  Pending: { label: "Onay Bekliyor", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
  Confirmed: { label: "Onaylandı", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
  Cancelled: { label: "İptal Edildi", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
  Completed: { label: "Tamamlandı", variant: "outline" as const, color: "bg-green-100 text-green-800" },
  NoShow: { label: "Gelmedi", variant: "outline" as const, color: "bg-gray-100 text-gray-800" },
}

const tableStatusConfig = {
  Available: { label: "Müsait", color: "bg-green-100 text-green-800" },
  Occupied: { label: "Dolu", color: "bg-red-100 text-red-800" },
  Reserved: { label: "Rezerve", color: "bg-blue-100 text-blue-800" },
  OutOfService: { label: "Hizmet Dışı", color: "bg-gray-100 text-gray-800" },
}

export default function EmployeeDashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.employerRestaurantId) {
        setError("Restoran bilgisi bulunamadı. Lütfen bir restorana bağlı olduğunuzdan emin olun.")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Tüm verileri paralel olarak getir
        const [reservationsResponse, menusResponse, tablesResponse] = await Promise.all([
          employeeApi.reservations.getAll(user.employerRestaurantId, 1, 50),
          employeeApi.menus.getAll(user.employerRestaurantId),
          employeeApi.tables.getAll(user.employerRestaurantId),
        ])

        setReservations(reservationsResponse.items)
        setMenus(menusResponse)
        setTables(tablesResponse)
      } catch (err: any) {
        console.error("Veri yükleme hatası:", err)
        setError(err.message || "Veriler yüklenirken bir hata oluştu.")
        toast({
          title: "Hata",
          description: "Veriler yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.employerRestaurantId, toast])

  const handleUpdateReservationStatus = async (reservationId: string, newStatus: string) => {
    try {
      await employeeApi.reservations.updateStatus(reservationId, newStatus)
      
      setReservations(
        reservations.map((res) =>
          res.id === reservationId ? { ...res, status: newStatus as Reservation["status"] } : res,
        ),
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

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

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

  // İstatistikler
  const pendingReservations = reservations.filter(r => r.status === "Pending").length
  const confirmedReservations = reservations.filter(r => r.status === "Confirmed").length
  const totalMenuItems = menus.reduce((acc, menu) => acc + (menu.menuItems?.length || 0), 0)
  const availableTables = tables.filter(t => t.status === "Available").length

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Çalışan Paneli</h1>
        <p className="text-muted-foreground">Restoran yönetimi ve operasyonlar</p>
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
            <div className="text-2xl font-bold">{availableTables} / {tables.length}</div>
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
            Masalar ({tables.length})
          </TabsTrigger>
          <TabsTrigger value="menus" className="gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Menüler ({menus.length})
          </TabsTrigger>
        </TabsList>

        {/* Rezervasyonlar Tab */}
        <TabsContent value="reservations">
          {reservations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Rezervasyon yok</h3>
                <p className="text-muted-foreground">Henüz rezervasyon bulunmuyor</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => (
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
                      <Badge className={reservationStatusConfig[reservation.status].color}>
                        {reservationStatusConfig[reservation.status].label}
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
                        <p className="text-sm text-muted-foreground mb-1">Masa</p>
                        <p className="font-medium">Masa {reservation.tableNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Kişi Sayısı</p>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">{reservation.numberOfGuests} Kişi</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Durum</p>
                        <p className="font-medium">{reservationStatusConfig[reservation.status].label}</p>
                      </div>
                    </div>

                    {reservation.specialRequests && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Özel İstekler</p>
                        <p className="text-sm bg-muted p-2 rounded">{reservation.specialRequests}</p>
                      </div>
                    )}

                    <div className="pt-2 border-t">
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

        {/* Masalar Tab */}
        <TabsContent value="tables">
          {tables.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <TableIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Masa yok</h3>
                <p className="text-muted-foreground">Henüz masa tanımlanmamış</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((table) => (
                <Card key={table.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">Masa {table.tableNumber}</CardTitle>
                      <Badge className={tableStatusConfig[table.status].color}>
                        {tableStatusConfig[table.status].label}
                      </Badge>
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
                          <span className="font-medium">{table.location}</span>
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
                    <CardTitle className="text-xl">{menu.name}</CardTitle>
                    {menu.description && (
                      <CardDescription>{menu.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
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
                            <div className="ml-4 font-bold text-lg whitespace-nowrap">
                              ₺{item.price}
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
    </div>
  )
}
