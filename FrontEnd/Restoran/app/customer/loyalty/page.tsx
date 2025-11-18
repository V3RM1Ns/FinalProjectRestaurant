'use client'

import { useEffect, useState } from 'react'
import { customerApi } from '@/lib/customer-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Award, Gift, Star, TrendingUp, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function CustomerLoyaltyPage() {
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0)
  const [rewards, setRewards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadRestaurants()
  }, [])

  useEffect(() => {
    if (selectedRestaurant) {
      loadLoyaltyData(selectedRestaurant)
    }
  }, [selectedRestaurant])

  const loadRestaurants = async () => {
    try {
      const favorites = await customerApi.favorites.getAll()
      setRestaurants(favorites)
      if (favorites.length > 0) {
        setSelectedRestaurant(favorites[0].id)
      }
    } catch (error) {
      console.error('Error loading restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLoyaltyData = async (restaurantId: string) => {
    try {
      const [pointsData, rewardsData] = await Promise.all([
        customerApi.loyalty.getPoints(restaurantId),
        customerApi.loyalty.getRewards(restaurantId),
      ])
      setLoyaltyPoints(pointsData.points)
      setRewards(rewardsData)
    } catch (error) {
      console.error('Error loading loyalty data:', error)
      toast({
        title: 'Hata',
        description: 'Sadakat verileri yüklenirken bir hata oluştu',
        variant: 'destructive',
      })
    }
  }

  const handleRedeemReward = async (rewardId: string) => {
    if (!confirm('Bu ödülü kullanmak istediğinize emin misiniz?')) return

    try {
      await customerApi.loyalty.redeemReward(rewardId)
      toast({
        title: 'Başarılı!',
        description: 'Ödül başarıyla kullanıldı',
      })
      if (selectedRestaurant) {
        loadLoyaltyData(selectedRestaurant)
      }
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Ödül kullanılırken bir hata oluştu',
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

  if (restaurants.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Sadakat programından faydalanmak için favori restoranlarınızı ekleyin
            </p>
            <Button asChild>
              <a href="/restaurants">Restoranları Keşfet</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedRestaurantData = restaurants.find(r => r.id === selectedRestaurant)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Award className="h-8 w-8 text-yellow-500" />
          Sadakat Programı & Ödüller
        </h1>
        <p className="text-muted-foreground">Puanlarınızı biriktirin, ödüllerden yararlanın</p>
      </div>

      {/* Restaurant Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Restoran Seçin</CardTitle>
          <CardDescription>Sadakat puanlarını ve ödüllerini görmek için bir restoran seçin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {restaurants.map((restaurant) => (
              <Button
                key={restaurant.id}
                variant={selectedRestaurant === restaurant.id ? 'default' : 'outline'}
                onClick={() => setSelectedRestaurant(restaurant.id)}
              >
                {restaurant.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedRestaurant && (
        <>
          {/* Loyalty Points Card */}
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Star className="h-6 w-6 fill-white" />
                {selectedRestaurantData?.name}
              </CardTitle>
              <CardDescription className="text-white/90">
                Mevcut Sadakat Puanlarınız
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold">{loyaltyPoints}</div>
              <p className="text-white/90 mt-2">Puan</p>
            </CardContent>
          </Card>

          {/* Rewards Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Mevcut Ödüller
              </CardTitle>
              <CardDescription>
                Puanlarınızı kullanarak bu ödüllerden yararlanabilirsiniz
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rewards.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Bu restoran için henüz ödül bulunmuyor
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {rewards.map((reward) => (
                    <Card key={reward.id} className={reward.canRedeem ? 'border-yellow-500' : ''}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{reward.name}</CardTitle>
                            <CardDescription>{reward.description}</CardDescription>
                          </div>
                          {reward.canRedeem && (
                            <Badge className="bg-yellow-500">Kullanılabilir</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Reward Details */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {reward.pointsRequired} Puan Gerekli
                              </span>
                            </div>
                            {reward.discountAmount && (
                              <Badge variant="secondary">
                                ₺{reward.discountAmount} İndirim
                              </Badge>
                            )}
                            {reward.discountPercentage && (
                              <Badge variant="secondary">
                                %{reward.discountPercentage} İndirim
                              </Badge>
                            )}
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-500 h-2 rounded-full transition-all"
                                style={{
                                  width: `${Math.min((loyaltyPoints / reward.pointsRequired) * 100, 100)}%`,
                                }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                              {loyaltyPoints} / {reward.pointsRequired} Puan
                            </p>
                          </div>

                          {/* Redeem Button */}
                          <Button
                            className="w-full"
                            disabled={!reward.canRedeem}
                            onClick={() => handleRedeemReward(reward.id)}
                          >
                            {reward.canRedeem ? (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Ödülü Kullan
                              </>
                            ) : (
                              `${reward.pointsRequired - loyaltyPoints} Puan Daha Gerekli`
                            )}
                          </Button>

                          {/* Expiry Info */}
                          {reward.endDate && (
                            <p className="text-xs text-muted-foreground text-center">
                              Son Kullanma: {new Date(reward.endDate).toLocaleDateString('tr-TR')}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* How it Works */}
          <Card>
            <CardHeader>
              <CardTitle>Nasıl Çalışır?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-white text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Sipariş Verin</p>
                    <p className="text-sm text-muted-foreground">
                      Her siparişinizde otomatik olarak puan kazanırsınız
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-white text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Puan Biriktirin</p>
                    <p className="text-sm text-muted-foreground">
                      Puanlarınız hesabınızda birikir
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-white text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Ödül Kazanın</p>
                    <p className="text-sm text-muted-foreground">
                      Yeterli puan topladığınızda ödüllerden yararlanın
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

