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
import { Users, CreditCard } from "lucide-react"
import { customerApi } from "@/lib/customer-api"

interface Table {
  id: string
  number: string
  capacity: number
  isAvailable: boolean
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

export default function ReservationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState("")
  const [guestCount, setGuestCount] = useState("2")
  const [selectedTable, setSelectedTable] = useState<string>("")
  const [showTables, setShowTables] = useState(false)
  const [loading, setLoading] = useState(false)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [availableTables, setAvailableTables] = useState<Table[]>([])

  // Fetch restaurant details
  useEffect(() => {
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
  }, [params.id, toast])

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
      const dateTimeString = `${date.toISOString().split('T')[0]}T${time}:00`
      const tables = await customerApi.restaurants.getAvailableTables(
        params.id as string,
        dateTimeString,
        Number.parseInt(guestCount)
      )
      setAvailableTables(tables)
      setShowTables(true)
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
      const dateTimeString = `${date?.toISOString().split('T')[0]}T${time}:00`
      const reservationData = {
        restaurantId: params.id as string,
        tableId: selectedTable,
        reservationDateTime: dateTimeString,
        partySize: Number.parseInt(guestCount),
        depositAmount: 50,
      }
      
      await customerApi.reservations.create(reservationData)

      toast({
        title: "Rezervasyon Oluşturuldu!",
        description: "Rezervasyonunuz başarıyla oluşturuldu.",
      })

      router.push("/reservations")
    } catch (error: any) {
      console.error("Error creating reservation:", error)
      toast({
        title: "Hata",
        description: error.message || "Rezervasyon oluşturulurken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-2">Rezervasyon Yap</h1>
      <p className="text-muted-foreground mb-8">{restaurant?.name || "Yükleniyor..."}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reservation Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rezervasyon Bilgileri</CardTitle>
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
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} Kişi
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSearchTables} className="w-full">
                Uygun Masaları Göster
              </Button>
            </CardContent>
          </Card>

          {/* Deposit Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Depozito Bilgisi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Rezervasyonunuzu tamamlamak için 50₺ depozito ödemesi gereklidir. Bu tutar, rezervasyonunuzu iptal
                etmeniz durumunda iade edilmeyecektir.
              </p>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Depozito Tutarı</span>
                <span className="text-xl font-bold">₺50.00</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Tables */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Uygun Masalar</CardTitle>
              <CardDescription>
                {showTables
                  ? `${date?.toLocaleDateString("tr-TR")} - ${time} için uygun masalar`
                  : "Uygun masaları görmek için tarih ve saat seçin"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showTables ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <p>Tarih, saat ve kişi sayısı seçerek uygun masaları görüntüleyin</p>
                </div>
              ) : availableTables.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Seçtiğiniz kriterlere uygun masa bulunamadı</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableTables.map((table) => (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTable(table.id)}
                      className={`w-full p-4 border rounded-lg text-left transition-colors ${
                        selectedTable === table.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold mb-1">Masa {table.number}</div>
                          <div className="text-sm text-muted-foreground">{table.capacity} Kişilik</div>
                        </div>
                        {selectedTable === table.id && <Badge>Seçildi</Badge>}
                      </div>
                    </button>
                  ))}

                  <div className="pt-4">
                    <Button onClick={handleReserve} disabled={loading || !selectedTable} className="w-full" size="lg">
                      {loading ? "İşleniyor..." : "Rezervasyonu Tamamla (₺50 Depozito)"}
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
