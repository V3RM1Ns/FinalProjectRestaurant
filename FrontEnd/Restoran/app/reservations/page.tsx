"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, MapPin } from "lucide-react"
import Link from "next/link"

interface Reservation {
  id: string
  restaurantId: string
  restaurantName: string
  date: string
  time: string
  guestCount: number
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed"
  tableNumber?: string
}

const mockReservations: Reservation[] = [
  {
    id: "1",
    restaurantId: "1",
    restaurantName: "Lezzet Durağı",
    date: "2025-10-20",
    time: "19:00",
    guestCount: 4,
    status: "Confirmed",
    tableNumber: "12",
  },
  {
    id: "2",
    restaurantId: "2",
    restaurantName: "Pizza Palace",
    date: "2025-10-18",
    time: "20:30",
    guestCount: 2,
    status: "Completed",
    tableNumber: "5",
  },
]

const statusConfig = {
  Pending: { label: "Onay Bekliyor", variant: "secondary" as const },
  Confirmed: { label: "Onaylandı", variant: "default" as const },
  Cancelled: { label: "İptal Edildi", variant: "destructive" as const },
  Completed: { label: "Tamamlandı", variant: "outline" as const },
}

export default function ReservationsPage() {
  const [reservations] = useState<Reservation[]>(mockReservations)

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Rezervasyonlarım</h1>
          <p className="text-muted-foreground">Geçmiş ve gelecek rezervasyonlarınız</p>
        </div>
        <Link href="/restaurants">
          <Button>Yeni Rezervasyon</Button>
        </Link>
      </div>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Henüz rezervasyonunuz yok</h3>
            <p className="text-muted-foreground mb-4">Favori restoranlarınızda masa rezervasyonu yapın</p>
            <Link href="/restaurants">
              <Button>Restoranları Keşfet</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{reservation.restaurantName}</CardTitle>
                    <CardDescription>Rezervasyon #{reservation.id}</CardDescription>
                  </div>
                  <Badge variant={statusConfig[reservation.status].variant}>
                    {statusConfig[reservation.status].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(reservation.date).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{reservation.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{reservation.guestCount} Kişi</span>
                </div>
                {reservation.tableNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Masa {reservation.tableNumber}</span>
                  </div>
                )}
                {reservation.status === "Confirmed" && (
                  <div className="pt-3">
                    <Button variant="outline" className="w-full bg-transparent">
                      Rezervasyonu İptal Et
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
