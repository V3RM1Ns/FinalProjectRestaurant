'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RestaurantsMap } from '@/components/maps/RestaurantsMap'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { MapPin, Loader2 } from 'lucide-react'

interface Restaurant {
  id: string
  name: string
  address: string
  description: string
  category?: string
  latitude?: number
  longitude?: number
  imageUrl?: string
  rate: number
}

export default function RestaurantsMapPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      setLoading(true)
      const data = await api.get<any>('/Restaurant')
      
      // Backend'den gelen data'nın yapısına göre düzenleme
      let restaurantArray: Restaurant[] = []
      
      if (Array.isArray(data)) {
        restaurantArray = data
      } else if (data && Array.isArray(data.items)) {
        // Eğer paginated response ise
        restaurantArray = data.items
      } else if (data && typeof data === 'object') {
        // Tek bir object ise array'e çevir
        restaurantArray = [data]
      }
      
      setRestaurants(restaurantArray)
    } catch (error: any) {
      console.error('Error fetching restaurants:', error)
      toast({
        title: 'Hata',
        description: 'Restoranlar yüklenemedi',
        variant: 'destructive',
      })
      setRestaurants([]) // Hata durumunda boş array
    } finally {
      setLoading(false)
    }
  }

  // restaurants'ın array olduğundan emin ol
  const safeRestaurants = Array.isArray(restaurants) ? restaurants : []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MapPin className="w-8 h-8" />
          Restoran Haritası
        </h1>
        <p className="text-muted-foreground">
          Tüm restoranları harita üzerinde görüntüleyin
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {safeRestaurants.length} Restoran
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] w-full">
            <RestaurantsMap restaurants={safeRestaurants} />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Toplam Restoran</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{safeRestaurants.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Konum Bilgisi Olan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {safeRestaurants.filter(r => r.latitude && r.longitude).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Konum Bilgisi Olmayan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {safeRestaurants.filter(r => !r.latitude || !r.longitude).length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
