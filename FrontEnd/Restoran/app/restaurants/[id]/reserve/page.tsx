"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Users, Calendar as CalendarIcon, MapPin } from "lucide-react"
import { customerApi } from "@/lib/customer-api"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"

interface Table {
  id: string
  tableNumber: number
  capacity: number
  status: string
  location: string
  restaurantId: string
}

const timeSlots = [
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
]

const locationNames: Record<string, string> = {
  IcMekan: "İç Mekan",
  PencereKenari: "Pencere Kenarı",
  Disari: "Dışarı"
}

export default function ReservationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState("")
  const [guestCount, setGuestCount] = useState("2")
  const [selectedTable, setSelectedTable] = useState<string>("")
  const [specialRequests, setSpecialRequests] = useState("")
  const [showTables, setShowTables] = useState(false)
  const [loading, setLoading] = useState(false)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [availableTables, setAvailableTables] = useState<Table[]>([])

  // Fetch restaurant details
  useEffect(() => {
    if (!user) {
      toast({
        title: "Giriş Gerekli",
        description: "Rezervasyon yapmak için giriş yapmalısınız.",
        variant: "destructive",
      })
      router.push('/login')
      return
    }

    const fetchRestaurant = async () => {
      try {
        const restaurantData = await customerApi.restaurants.getById(params.id as string)
        setRestaurant(restaurantData)
      } catch (error: any) {
        console.error("Error fetching restaurant:", error)
        toast({
          title: "Hata",
          description: "Restoran bilgileri yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    }

    fetchRestaurant()
  }, [params.id, toast, user, router])

  const handleSearchTables = async () => {
    if (!date || !time || !guestCount) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tarih, saat ve kişi sayısı seçin.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Combine date and time for API call
      const dateTimeString = `${date.toISOString().split('T')[0]}T${time}:00.000Z`
      const tables = await customerApi.restaurants.getAvailableTables(
        params.id as string,
        dateTimeString,
        Number.parseInt(guestCount)
      )
      setAvailableTables(tables)
      setShowTables(true)
      
      if (tables.length === 0) {
        toast({
          title: "Uygun Masa Bulunamadı",
          description: "Seçtiğiniz tarih ve saat için uygun masa bulunmamaktadır. Lütfen farklı bir zaman deneyin.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error fetching tables:", error)
      toast({
        title: "Hata",
        description: "Uygun masalar yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
      setAvailableTables([])
      setShowTables(true)
    } finally {
      setLoading(false)
    }
  }

  const handleReserve = async () => {
    if (!selectedTable) {
      toast({
        title: "Masa Seçilmedi",
        description: "Lütfen bir masa seçin.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const dateTimeString = `${date?.toISOString().split('T')[0]}T${time}:00.000Z`
      const reservationData = {
        restaurantId: params.id as string,
        tableId: selectedTable,
        reservationDate: dateTimeString,
        partySize: Number.parseInt(guestCount),
        specialRequests: specialRequests || ""
      }
      
      const response = await customerApi.reservations.create(reservationData)

      toast({
        title: "Rezervasyon Oluşturuldu! ✅",
        description: `Rezervasyonunuz başarıyla oluşturuldu. Rezervasyon numaranız: #${response.id.substring(0, 8).toUpperCase()}`,
      })

      router.push("/customer/reservations")
    } catch (error: any) {
      console.error("Error creating reservation:", error)
      toast({
        title: "Hata",
        description: error.response?.data?.message || error.message || "Rezervasyon oluşturulurken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Rezervasyon Yap</h1>
        <p className="text-muted-foreground text-lg">{restaurant?.name || "Yükleniyor..."}</p>
        {restaurant?.address && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-4 w-4" />
            {restaurant.address}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reservation Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Rezervasyon Bilgileri
              </CardTitle>
              <CardDescription>Tarih, saat ve kişi sayısı seçin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tarih</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border mt-2"
                />
              </div>

              <div>
                <Label htmlFor="time">Saat</Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger id="time">
                    <SelectValue placeholder="Saat seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="guests">Kişi Sayısı</Label>
                <Select value={guestCount} onValueChange={setGuestCount}>
                  <SelectTrigger id="guests">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} Kişi
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="specialRequests">Özel İstekler (Opsiyonel)</Label>
                <Textarea
                  id="specialRequests"
                  placeholder="Özel isteklerinizi buraya yazabilirsiniz..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={handleSearchTables} className="w-full" disabled={loading}>
                {loading ? "Aranıyor..." : "Uygun Masaları Göster"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Available Tables */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Uygun Masalar
              </CardTitle>
              <CardDescription>
                {showTables
                  ? `${date?.toLocaleDateString("tr-TR")} - ${time} için uygun masalar`
                  : "Uygun masaları görmek için tarih ve saat seçin"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showTables ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tarih, saat ve kişi sayısı seçerek uygun masaları görüntüleyin</p>
                </div>
              ) : availableTables.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Seçtiğiniz kriterlere uygun masa bulunamadı</p>
                  <p className="text-sm text-muted-foreground mt-2">Lütfen farklı bir tarih veya saat deneyin</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground mb-3">
                    {availableTables.length} uygun masa bulundu
                  </div>
                  <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                    {availableTables.map((table) => (
                      <button
                        key={table.id}
                        onClick={() => setSelectedTable(table.id)}
                        className={`w-full p-4 border rounded-lg text-left transition-all ${
                          selectedTable === table.id 
                            ? "border-primary bg-primary/10 shadow-sm" 
                            : "hover:border-primary/50 hover:bg-accent"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold mb-1 text-lg">Masa {table.tableNumber}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              {table.capacity} Kişilik
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {locationNames[table.location] || table.location}
                            </div>
                          </div>
                          {selectedTable === table.id && (
                            <Badge variant="default" className="ml-2">Seçildi</Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <Button 
                      onClick={handleReserve} 
                      disabled={loading || !selectedTable} 
                      className="w-full" 
                      size="lg"
                    >
                      {loading ? "İşleniyor..." : "Rezervasyonu Onayla"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
