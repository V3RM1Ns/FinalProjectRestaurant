'use client'

import { useEffect, useState } from 'react'
import { customerApi } from '@/lib/customer-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ShoppingBag, Calendar, Star, Heart, TrendingUp, Award, DollarSign, MapPin } from 'lucide-react'

export default function CustomerProfilePage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await customerApi.statistics.get()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
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
        <h1 className="text-3xl font-bold">Profilim & İstatistikler</h1>
        <p className="text-muted-foreground">Aktivite geçmişiniz ve istatistikleriniz</p>
      </div>

      {/* Main Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Sipariş</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Rezervasyon</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReservations || 0}</div>
            <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Harcama</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{stats?.totalSpent?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Yorum</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReviews || 0}</div>
            <p className="text-xs text-muted-foreground">Yaptığınız yorum sayısı</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Favorites & Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Tercihler & Favoriler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Favori Restoranlar</span>
                <span className="text-sm text-muted-foreground">
                  {stats?.favoriteRestaurantsCount || 0}
                </span>
              </div>
              <Progress value={(stats?.favoriteRestaurantsCount / 10) * 100} />
            </div>

            {stats?.favoriteRestaurantName && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">En Çok Sipariş Verilen Restoran</p>
                <p className="font-medium">{stats.favoriteRestaurantName}</p>
              </div>
            )}

            {stats?.favoriteCuisine && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">Favori Mutfak Türü</p>
                <p className="font-medium">{stats.favoriteCuisine}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rating Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Değerlendirme İstatistikleri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Ortalama Verdiğiniz Puan</span>
                <span className="text-sm font-medium">
                  {stats?.averageRatingGiven?.toFixed(1) || 'N/A'} / 5.0
                </span>
              </div>
              <Progress value={(stats?.averageRatingGiven / 5) * 100} />
            </div>

            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Yapılan Yorum Sayısı</span>
                <span className="font-medium">{stats?.totalReviews || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Yorum Yapılan Restoran</span>
                <span className="font-medium">{stats?.reviewedRestaurantsCount || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Aktivite Özeti
          </CardTitle>
          <CardDescription>Son 30 gün içindeki aktiviteleriniz</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Son Siparişler</span>
              </div>
              <p className="text-2xl font-bold">{stats?.lastMonthOrders || 0}</p>
              <p className="text-xs text-muted-foreground">Son 30 gün</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Son Rezervasyonlar</span>
              </div>
              <p className="text-2xl font-bold">{stats?.lastMonthReservations || 0}</p>
              <p className="text-xs text-muted-foreground">Son 30 gün</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Son Harcama</span>
              </div>
              <p className="text-2xl font-bold">₺{stats?.lastMonthSpent?.toFixed(2) || '0.00'}</p>
              <p className="text-xs text-muted-foreground">Son 30 gün</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Başarılarım
          </CardTitle>
          <CardDescription>Kazandığınız rozetler ve başarılar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {/* First Order Achievement */}
            {stats?.totalOrders > 0 && (
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center mb-2">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-center">İlk Sipariş</p>
                <p className="text-xs text-muted-foreground text-center">Tamamlandı</p>
              </div>
            )}

            {/* 10 Orders Achievement */}
            {stats?.totalOrders >= 10 && (
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center mb-2">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-center">10 Sipariş</p>
                <p className="text-xs text-muted-foreground text-center">Tamamlandı</p>
              </div>
            )}

            {/* First Reservation Achievement */}
            {stats?.totalReservations > 0 && (
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-center">İlk Rezervasyon</p>
                <p className="text-xs text-muted-foreground text-center">Tamamlandı</p>
              </div>
            )}

            {/* First Review Achievement */}
            {stats?.totalReviews > 0 && (
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-yellow-500 flex items-center justify-center mb-2">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-center">İlk Yorum</p>
                <p className="text-xs text-muted-foreground text-center">Tamamlandı</p>
              </div>
            )}

            {/* Favorite Restaurant Achievement */}
            {stats?.favoriteRestaurantsCount > 0 && (
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center mb-2">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-center">İlk Favori</p>
                <p className="text-xs text-muted-foreground text-center">Tamamlandı</p>
              </div>
            )}

            {/* Big Spender Achievement */}
            {stats?.totalSpent >= 1000 && (
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-amber-500 flex items-center justify-center mb-2">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-center">Büyük Harcama</p>
                <p className="text-xs text-muted-foreground text-center">₺1000+</p>
              </div>
            )}

            {/* Loyal Customer Achievement */}
            {stats?.totalOrders >= 50 && (
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center mb-2">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-center">Sadık Müşteri</p>
                <p className="text-xs text-muted-foreground text-center">50+ Sipariş</p>
              </div>
            )}

            {/* Active Reviewer Achievement */}
            {stats?.totalReviews >= 10 && (
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-pink-500 flex items-center justify-center mb-2">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-center">Aktif Yorumcu</p>
                <p className="text-xs text-muted-foreground text-center">10+ Yorum</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

