  "use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Calendar as CalendarIcon, Users } from "lucide-react"
import { customerApi } from "@/lib/customer-api"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

const timeSlots = [
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30", "22:00",
]

export default function EditReservationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const reservationId = params.reservationId as string
  
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [reservation, setReservation] = useState<any>(null)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState("")
  const [guestCount, setGuestCount] = useState("2")
  const [specialRequests, setSpecialRequests] = useState("")

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const data = await customerApi.reservations.getById(reservationId)
        setReservation(data)
        
        // Parse existing reservation data
        const reservationDate = new Date(data.reservationDate)
        setDate(reservationDate)
        setTime(reservationDate.toTimeString().slice(0, 5))
        setGuestCount(data.numberOfGuests.toString())
        setSpecialRequests(data.specialRequests || "")
      } catch (error: any) {
        console.error("Error fetching reservation:", error)
        toast({
          title: "Hata",
          description: "Rezervasyon bilgileri yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
        router.push("/customer/reservations")
      } finally {
        setLoading(false)
      }
    }

    fetchReservation()
  }, [reservationId, toast, router])

  const handleUpdate = async () => {
    if (!date || !time) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tarih ve saat seçin.",
        variant: "destructive",
      })
      return
    }

    setUpdating(true)
    try {
      const dateTimeString = `${date.toISOString().split('T')[0]}T${time}:00.000Z`
      const updateData = {
        reservationDate: dateTimeString,
        partySize: Number.parseInt(guestCount),
        specialRequests: specialRequests || ""
      }
      
      await customerApi.reservations.update(reservationId, updateData)

      toast({
        title: "Başarılı! ✅",
        description: "Rezervasyonunuz başarıyla güncellendi.",
      })

      router.push("/customer/reservations")
    } catch (error: any) {
      console.error("Error updating reservation:", error)
      toast({
        title: "Hata",
        description: error.response?.data?.message || error.message || "Rezervasyon güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (!reservation) {
    return null
  }

  // Check if reservation can be edited
  const canEdit = reservation.status === "Pending" || reservation.status === "Confirmed"

  if (!canEdit) {
    return (
      <div className="container py-8 max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Bu rezervasyon düzenlenemez. Durum: {reservation.status}
            </p>
            <Button asChild>
              <Link href="/customer/reservations">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Rezervasyonlarıma Dön
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/customer/reservations">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Link>
        </Button>
        <h1 className="text-4xl font-bold mb-2">Rezervasyonu Düzenle</h1>
        <p className="text-muted-foreground text-lg">{reservation.restaurantName}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Edit Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Rezervasyon Bilgileri
              </CardTitle>
              <CardDescription>Rezervasyon detaylarını güncelleyin</CardDescription>
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
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {num} Kişi
                        </div>
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

              <div className="pt-4 space-y-2">
                <Button 
                  onClick={handleUpdate} 
                  disabled={updating} 
                  className="w-full" 
                  size="lg"
                >
                  {updating ? "Güncelleniyor..." : "Rezervasyonu Güncelle"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  asChild
                >
                  <Link href="/customer/reservations">İptal</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Reservation Info */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Mevcut Rezervasyon</CardTitle>
              <CardDescription>Şu anki rezervasyon bilgileriniz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Restoran</span>
                  <span className="font-medium">{reservation.restaurantName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tarih & Saat</span>
                  <span className="font-medium">
                    {new Date(reservation.reservationDate).toLocaleString("tr-TR", {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Kişi Sayısı</span>
                  <span className="font-medium">{reservation.numberOfGuests} Kişi</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Masa Numarası</span>
                  <span className="font-medium">Masa {reservation.tableNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Durum</span>
                  <span className="font-medium capitalize">{reservation.status}</span>
                </div>
              </div>

              {reservation.specialRequests && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Özel İstekler:</p>
                  <p className="text-sm">{reservation.specialRequests}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Not: Masa numarası değiştirilemez. Farklı bir masa istiyorsanız, bu rezervasyonu iptal edip yeni bir rezervasyon oluşturmanız gerekmektedir.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

