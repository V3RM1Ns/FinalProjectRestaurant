'use client'

import { useEffect, useState } from 'react'
import { customerApi } from '@/lib/customer-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Star, MapPin, Phone, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function CustomerFavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      const data = await customerApi.favorites.getAll()
      setFavorites(data)
    } catch (error) {
      console.error('Error loading favorites:', error)
      toast({
        title: 'Hata',
        description: 'Favoriler yüklenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (restaurantId: string) => {
    if (!confirm('Bu restoranı favorilerden çıkarmak istediğinize emin misiniz?')) return

    try {
      await customerApi.favorites.remove(restaurantId)
      toast({
        title: 'Başarılı',
        description: 'Restoran favorilerden çıkarıldı',
      })
      loadFavorites()
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Favorilerden çıkarılırken bir hata oluştu',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Heart className="h-8 w-8 fill-red-500 text-red-500" />
          Favori Restoranlarım
        </h1>
        <p className="text-muted-foreground">Beğendiğiniz restoranları saklayın</p>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Henüz favori restoranınız yok</p>
            <Button asChild>
              <Link href="/restaurants">Restoranları Keşfet</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((restaurant) => (
            <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{restaurant.name}</CardTitle>
                    <CardDescription>{restaurant.cuisine}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFavorite(restaurant.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{restaurant.averageRating?.toFixed(1) || 'N/A'}</span>
                    <span className="text-sm text-muted-foreground">
                      ({restaurant.reviewCount || 0} yorum)
                    </span>
                  </div>

                  {/* Location */}
                  {restaurant.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm text-muted-foreground">{restaurant.address}</span>
                    </div>
                  )}

                  {/* Phone */}
                  {restaurant.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{restaurant.phoneNumber}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t flex gap-2">
                    <Link href={`/restaurants/${restaurant.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Detaylar
                      </Button>
                    </Link>
                    <Link href={`/restaurants/${restaurant.id}/order`} className="flex-1">
                      <Button size="sm" className="w-full">
                        Sipariş Ver
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

