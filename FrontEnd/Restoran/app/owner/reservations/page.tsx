"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { OwnerApi } from "@/lib/owner-api"
import { UserRole } from "@/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, Users } from "lucide-react"
import Link from "next/link"

export default function OwnerReservationsPage() {
  const { hasRole } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const restaurantId = searchParams.get("restaurant")

  const [reservations, setReservations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!hasRole(UserRole.Owner)) {
      router.push("/unauthorized")
      return
    }

    if (restaurantId) {
      loadReservations()
    }
  }, [hasRole, router, restaurantId, selectedStatus, currentPage])

  const loadReservations = async () => {
    if (!restaurantId) return

    try {
      setIsLoading(true)
      const response = selectedStatus === "all"
        ? await OwnerApi.getReservations(restaurantId, currentPage, 10)
        : await OwnerApi.getReservationsByStatus(restaurantId, selectedStatus, currentPage, 10)

      setReservations(response.items || [])
      setTotalPages(response.totalPages || 1)
    } catch (error) {
      console.error("Error loading reservations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    try {
      await OwnerApi.updateReservationStatus(reservationId, newStatus)
      loadReservations()
    } catch (error) {
      console.error("Error updating reservation status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      Pending: "secondary",
      Confirmed: "default",
      Cancelled: "destructive",
      Completed: "default",
      NoShow: "destructive",
    }

    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  if (!restaurantId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Restoran Seçilmedi</CardTitle>
            <CardDescription>Lütfen bir restoran seçin.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Calendar className="mr-2" />
            Rezervasyonlar
          </h1>
          <p className="text-muted-foreground">Restoran rezervasyonlarını yönetin</p>
        </div>
        <Link href="/owner/dashboard">
          <Button variant="outline">Dashboard'a Dön</Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Durum Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="Pending">Bekleyen</SelectItem>
            <SelectItem value="Confirmed">Onaylandı</SelectItem>
            <SelectItem value="Completed">Tamamlandı</SelectItem>
            <SelectItem value="Cancelled">İptal</SelectItem>
            <SelectItem value="NoShow">Gelmedi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      ) : reservations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Rezervasyon bulunamadı.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{reservation.customerName}</CardTitle>
                    <CardDescription>
                      {new Date(reservation.reservationDate).toLocaleString("tr-TR")}
                    </CardDescription>
                  </div>
                  {getStatusBadge(reservation.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{reservation.numberOfPeople} Kişi</span>
                  </div>

                  {reservation.specialRequests && (
                    <div>
                      <p className="text-sm text-muted-foreground">Özel İstekler</p>
                      <p className="text-sm">{reservation.specialRequests}</p>
                    </div>
                  )}

                  <Select
                    value={reservation.status}
                    onValueChange={(value) => handleStatusChange(reservation.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Bekleyen</SelectItem>
                      <SelectItem value="Confirmed">Onaylandı</SelectItem>
                      <SelectItem value="Completed">Tamamlandı</SelectItem>
                      <SelectItem value="Cancelled">İptal</SelectItem>
                      <SelectItem value="NoShow">Gelmedi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Önceki
          </Button>
          <span className="py-2 px-4">
            Sayfa {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Sonraki
          </Button>
        </div>
      )}
    </div>
  )
}
