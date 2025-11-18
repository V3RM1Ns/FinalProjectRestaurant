'use client'

import { useEffect, useState } from 'react'
import { customerApi } from '@/lib/customer-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, Users, MapPin, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function CustomerReservationsPage() {
  const [upcomingReservations, setUpcomingReservations] = useState<any[]>([])
  const [pastReservations, setPastReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    try {
      const [upcoming, past] = await Promise.all([
        customerApi.reservations.getUpcoming(),
        customerApi.reservations.getPast(),
      ])
      setUpcomingReservations(upcoming)
      setPastReservations(past)
    } catch (error) {
      console.error('Error loading reservations:', error)
      toast({
        title: 'Hata',
        description: 'Rezervasyonlar yüklenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('Rezervasyonu iptal etmek istediğinize emin misiniz?')) return

    try {
      await customerApi.reservations.cancel(reservationId)
      toast({
        title: 'Başarılı',
        description: 'Rezervasyon başarıyla iptal edildi',
      })
      loadReservations()
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Rezervasyon iptal edilirken bir hata oluştu',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      Pending: { label: 'Beklemede', variant: 'secondary' },
      Confirmed: { label: 'Onaylandı', variant: 'default' },
      Cancelled: { label: 'İptal Edildi', variant: 'destructive' },
      Completed: { label: 'Tamamlandı', variant: 'default' },
    }
    const config = statusMap[status] || { label: status, variant: 'secondary' }
    return <Badge variant={config.variant as any}>{config.label}</Badge>
  }

  const ReservationCard = ({ reservation, showCancelButton = false }: any) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{reservation.restaurantName}</CardTitle>
            <CardDescription>Rezervasyon #{reservation.id.substring(0, 8)}</CardDescription>
          </div>
          {getStatusBadge(reservation.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Reservation Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {new Date(reservation.reservationDate).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {new Date(reservation.reservationDate).toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{reservation.partySize} Kişi</span>
            </div>
            {reservation.tableName && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Masa: {reservation.tableName}</span>
              </div>
            )}
          </div>

          {/* Special Requests */}
          {reservation.specialRequests && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-1">Özel İstekler:</p>
              <p className="text-sm">{reservation.specialRequests}</p>
            </div>
          )}

          {/* Actions */}
          {showCancelButton && (reservation.status === 'Pending' || reservation.status === 'Confirmed') && (
            <div className="pt-4 border-t flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCancelReservation(reservation.id)}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                İptal Et
              </Button>
              <Link href={`/customer/reservations/${reservation.id}/edit`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Düzenle
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rezervasyonlarım</h1>
          <p className="text-muted-foreground">Masa rezervasyonlarınızı yönetin</p>
        </div>
        <Link href="/restaurants">
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Yeni Rezervasyon
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming">
            Yaklaşan ({upcomingReservations.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Geçmiş ({pastReservations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingReservations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Yaklaşan rezervasyonunuz bulunmuyor</p>
                <Button className="mt-4" asChild>
                  <Link href="/restaurants">Rezervasyon Yap</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingReservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} showCancelButton />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastReservations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Henüz rezervasyon geçmişiniz yok</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastReservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

