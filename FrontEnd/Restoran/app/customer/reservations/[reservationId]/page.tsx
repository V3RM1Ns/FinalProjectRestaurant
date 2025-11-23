'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { customerApi } from '@/lib/customer-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, MapPin, XCircle, ArrowLeft, Phone, Mail, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Reservation {
  id: string
  reservationDate: string
  numberOfGuests: number
  status: string
  customerName: string
  customerPhone: string
  customerEmail: string
  customerId: string
  restaurantId: string
  restaurantName: string
  tableId: string
  tableNumber: number
  createdAt: string
  specialRequests?: string
}

export default function ReservationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reservationId = params.reservationId as string
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadReservation()
  }, [reservationId])

  const loadReservation = async () => {
    try {
      setLoading(true)
      const data = await customerApi.reservations.getById(reservationId)
      setReservation(data)
    } catch (error: any) {
      console.error('Error loading reservation:', error)
      toast({
        title: 'Hata',
        description: error.message || 'Rezervasyon yüklenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelReservation = async () => {
    if (!confirm('Rezervasyonu iptal etmek istediğinize emin misiniz?')) return

    try {
      await customerApi.reservations.cancel(reservationId)
      toast({
        title: 'Başarılı',
        description: 'Rezervasyon başarıyla iptal edildi',
      })
      loadReservation()
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
      Pending: { label: 'Beklemede', variant: 'secondary', color: 'bg-yellow-100 text-yellow-800' },
      Confirmed: { label: 'Onaylandı', variant: 'default', color: 'bg-green-100 text-green-800' },
      Cancelled: { label: 'İptal Edildi', variant: 'destructive', color: 'bg-red-100 text-red-800' },
      Completed: { label: 'Tamamlandı', variant: 'default', color: 'bg-blue-100 text-blue-800' },
    }
    const config = statusMap[status] || { label: status, variant: 'secondary', color: 'bg-gray-100 text-gray-800' }
    return (
      <Badge variant={config.variant as any} className={config.color}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Rezervasyon bulunamadı</p>
            <Button asChild>
              <Link href="/customer/reservations">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Rezervasyonlara Dön
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canCancel = reservation.status === 'Pending' || reservation.status === 'Confirmed'

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/customer/reservations">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Rezervasyonlara Dön
          </Link>
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{reservation.restaurantName}</h1>
            <p className="text-muted-foreground">
              Rezervasyon #{reservation.id.substring(0, 8).toUpperCase()}
            </p>
          </div>
          {getStatusBadge(reservation.status)}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Reservation Details */}
        <Card>
          <CardHeader>
            <CardTitle>Rezervasyon Detayları</CardTitle>
            <CardDescription>Rezervasyon bilgileriniz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Tarih</p>
                <p className="font-medium">
                  {new Date(reservation.reservationDate).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Saat</p>
                <p className="font-medium">
                  {new Date(reservation.reservationDate).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Kişi Sayısı</p>
                <p className="font-medium">{reservation.numberOfGuests} Kişi</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Masa</p>
                <p className="font-medium">Masa {reservation.tableNumber}</p>
              </div>
            </div>

            {reservation.specialRequests && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Özel İstekler</p>
                <p className="text-sm">{reservation.specialRequests}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>İletişim Bilgileri</CardTitle>
            <CardDescription>Rezervasyon sahibi bilgileri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Ad Soyad</p>
                <p className="font-medium">{reservation.customerName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Telefon</p>
                <p className="font-medium">{reservation.customerPhone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">E-posta</p>
                <p className="font-medium">{reservation.customerEmail}</p>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Oluşturulma Tarihi</p>
              <p className="text-sm">
                {new Date(reservation.createdAt).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {canCancel && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>İşlemler</CardTitle>
            <CardDescription>Rezervasyonunuzu yönetin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={handleCancelReservation}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rezervasyonu İptal Et
              </Button>
              <Button
                variant="outline"
                asChild
                className="flex-1"
              >
                <Link href={`/restaurants/${reservation.restaurantId}`}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Restorana Git
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {reservation.status === 'Cancelled' && (
        <Card className="mt-6 border-destructive">
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">
              Bu rezervasyon iptal edilmiştir.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

