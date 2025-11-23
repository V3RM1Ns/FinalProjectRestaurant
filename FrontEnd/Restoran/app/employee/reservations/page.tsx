"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { employeeApi, type Reservation } from "@/lib/employee-api"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, Users, MapPin, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function EmployeeReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [todayReservations, setTodayReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCount, setActiveCount] = useState(0)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const { toast } = useToast()
  const { user } = useAuth()

  // Get restaurantId from user's profile
  const restaurantId = user?.restaurantId || ""

  useEffect(() => {
    if (restaurantId) {
      loadReservations()
      loadTodayReservations()
      loadActiveCount()
    }
  }, [selectedStatus, restaurantId])

  const loadReservations = async () => {
    try {
      setLoading(true)
      let result
      if (selectedStatus === "all") {
        result = await employeeApi.reservations.getAll(restaurantId, 1, 50)
        setReservations(result.items || [])
      } else {
        result = await employeeApi.reservations.getByStatus(restaurantId, selectedStatus, 1, 50)
        setReservations(result.items || [])
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Rezervasyonlar yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadTodayReservations = async () => {
    try {
      const result = await employeeApi.reservations.getToday(restaurantId)
      setTodayReservations(result)
    } catch (error: any) {
      console.error("Today reservations error:", error)
    }
  }

  const loadActiveCount = async () => {
    try {
      const result = await employeeApi.reservations.getActiveCount(restaurantId)
      setActiveCount(result.activeReservations)
    } catch (error: any) {
      console.error("Active count error:", error)
    }
  }

  const updateReservationStatus = async (reservationId: string, newStatus: string) => {
    try {
      await employeeApi.reservations.updateStatus(reservationId, newStatus)
      toast({
        title: "Başarılı",
        description: "Rezervasyon durumu güncellendi",
      })
      loadReservations()
      loadTodayReservations()
      loadActiveCount()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Durum güncellenirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      Pending: "default",
      Confirmed: "default",
      Cancelled: "destructive",
      Completed: "secondary",
      NoShow: "destructive",
    }

    const labels: Record<string, string> = {
      Pending: "Beklemede",
      Confirmed: "Onaylandı",
      Cancelled: "İptal",
      Completed: "Tamamlandı",
      NoShow: "Gelmedi",
    }

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rezervasyon Yönetimi</h1>
          <p className="text-muted-foreground">Rezervasyonları görüntüleyin ve yönetin</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Rezervasyonlar</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugünkü Rezervasyonlar</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayReservations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Rezervasyon</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservations.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Durum Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="Pending">Beklemede</SelectItem>
                <SelectItem value="Confirmed">Onaylandı</SelectItem>
                <SelectItem value="Completed">Tamamlandı</SelectItem>
                <SelectItem value="Cancelled">İptal</SelectItem>
                <SelectItem value="NoShow">Gelmedi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tüm Rezervasyonlar</TabsTrigger>
          <TabsTrigger value="today">Bugün</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {reservations.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">Rezervasyon bulunamadı</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reservations.map((reservation) => (
                <Card key={reservation.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{reservation.customerName}</h3>
                          {getStatusBadge(reservation.status)}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(reservation.reservationDate)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {reservation.numberOfGuests} Kişi
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Masa {reservation.tableNumber}
                          </div>
                        </div>

                        {reservation.specialRequests && (
                          <div className="text-sm">
                            <span className="font-medium">Özel İstek: </span>
                            {reservation.specialRequests}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        {reservation.status === "Pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateReservationStatus(reservation.id, "Confirmed")}
                            >
                              Onayla
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateReservationStatus(reservation.id, "Cancelled")}
                            >
                              İptal
                            </Button>
                          </>
                        )}
                        {reservation.status === "Confirmed" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReservationStatus(reservation.id, "Completed")}
                            >
                              Tamamla
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateReservationStatus(reservation.id, "NoShow")}
                            >
                              Gelmedi
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          {todayReservations.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">Bugün rezervasyon yok</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {todayReservations.map((reservation) => (
                <Card key={reservation.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{reservation.customerName}</h3>
                          {getStatusBadge(reservation.status)}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {formatDate(reservation.reservationDate)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {reservation.numberOfGuests} Kişi
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Masa {reservation.tableNumber}
                          </div>
                        </div>

                        {reservation.specialRequests && (
                          <div className="text-sm">
                            <span className="font-medium">Özel İstek: </span>
                            {reservation.specialRequests}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        {reservation.status === "Pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateReservationStatus(reservation.id, "Confirmed")}
                            >
                              Onayla
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateReservationStatus(reservation.id, "Cancelled")}
                            >
                              İptal
                            </Button>
                          </>
                        )}
                        {reservation.status === "Confirmed" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReservationStatus(reservation.id, "Completed")}
                            >
                              Tamamla
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateReservationStatus(reservation.id, "NoShow")}
                            >
                              Gelmedi
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
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
