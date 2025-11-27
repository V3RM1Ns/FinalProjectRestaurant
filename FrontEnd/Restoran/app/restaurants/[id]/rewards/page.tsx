'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { loyaltyApi } from '@/lib/api'
import { customerApi } from '@/lib/customer-api'
import { ArrowLeft, Gift, Star, Clock, Users, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCart } from '@/contexts/cart-context'

interface Reward {
  id: string
  restaurantId: string
  restaurantName: string
  name: string
  description: string
  pointsRequired: number
  discountAmount?: number
  discountPercentage?: number
  imageUrl?: string
  isActive: boolean
  startDate?: string
  endDate?: string
  maxRedemptions?: number
  currentRedemptions: number
  canRedeem: boolean
}

export default function RestaurantRewardsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [userPoints, setUserPoints] = useState(0)
  const [restaurantName, setRestaurantName] = useState('')
  const { applyCoupon } = useCart()
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [redeeming, setRedeeming] = useState(false)
  
  const restaurantId = params.id as string

  useEffect(() => {
    fetchRewards()
    fetchUserPoints()
    fetchRestaurantInfo()
  }, [restaurantId])

  const fetchRestaurantInfo = async () => {
    try {
      const restaurantData = await customerApi.restaurants.getById(restaurantId)
      setRestaurantName(restaurantData.name)
      console.log('Restaurant data:', restaurantData)
    } catch (error: any) {
      console.error('Error fetching restaurant:', error)
    }
  }

  const fetchRewards = async () => {
    setLoading(true)
    try {
      const data = await loyaltyApi.getRestaurantRewards(restaurantId)
      setRewards(data)
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Ödüller yüklenirken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPoints = async () => {
    try {
      const balances = await loyaltyApi.customer.getBalance()
      const balance = balances.find((b: any) => b.restaurantId === restaurantId)
      setUserPoints(balance?.availablePoints || 0)
    } catch (error: any) {
      console.error(error)
    }
  }

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward)
    setConfirmDialogOpen(true)
  }

  const handleConfirmRedeem = async () => {
    if (!selectedReward) return

    setRedeeming(true)
    try {
      const redemption = await loyaltyApi.customer.redeemReward(selectedReward.id)
      
      toast({
        title: 'Başarılı!',
        description: `Ödül kullanıldı! Kupon kodunuz: ${redemption.couponCode}. Sepete otomatik olarak eklendi.`,
      })
      
      // Apply coupon to cart
      applyCoupon({
        couponCode: redemption.couponCode,
        discountAmount: selectedReward.discountAmount || 0,
        discountPercentage: selectedReward.discountPercentage || 0,
        rewardName: selectedReward.name,
        restaurantId: restaurantId
      })

      await fetchRewards()
      await fetchUserPoints()

      setConfirmDialogOpen(false)
      setSelectedReward(null)

      // Navigate to cart after 2 seconds
      setTimeout(() => {
        router.push('/cart')
      }, 2000)
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Ödül kullanılırken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setRedeeming(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>
        <h1 className="text-3xl font-bold">Sadakat Ödülleri</h1>
        <p className="text-muted-foreground">
          {restaurantName && `${restaurantName} - `}Puanlarınızı kullanarak özel ödülleri kazanın
        </p>
        <div className="mt-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Star className="w-4 h-4 mr-2" />
            Puanınız: {userPoints}
          </Badge>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : rewards.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Gift className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Bu restoranda henüz ödül bulunmuyor.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => {
            const hasEnoughPoints = userPoints >= reward.pointsRequired
            const isAvailable = reward.isActive && 
                               (!reward.maxRedemptions || reward.currentRedemptions < reward.maxRedemptions) &&
                               (!reward.endDate || new Date(reward.endDate) > new Date())

            return (
              <Card key={reward.id} className={!isAvailable ? 'opacity-60' : ''}>
                {reward.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={reward.imageUrl}
                      alt={reward.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{reward.name}</CardTitle>
                    {!isAvailable && (
                      <Badge variant="secondary">Kullanılamaz</Badge>
                    )}
                  </div>
                  <CardDescription className="mt-2">{reward.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Discount Info */}
                    {(reward.discountAmount || reward.discountPercentage) && (
                      <div className="bg-primary/10 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-primary">
                          {reward.discountAmount && `₺${reward.discountAmount} İNDİRİM`}
                          {reward.discountPercentage && `%${reward.discountPercentage} İNDİRİM`}
                        </div>
                      </div>
                    )}

                    {/* Points Required */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Gereken Puan</span>
                      <Badge variant={hasEnoughPoints ? 'default' : 'secondary'} className="text-base px-3 py-1">
                        <Star className="w-4 h-4 mr-1" />
                        {reward.pointsRequired}
                      </Badge>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {reward.maxRedemptions && (
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3" />
                          <span>
                            {reward.currentRedemptions}/{reward.maxRedemptions} kullanıldı
                          </span>
                        </div>
                      )}
                      {reward.endDate && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>
                            Geçerlilik: {new Date(reward.endDate).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Redeem Button */}
                    <Button
                      onClick={() => handleRedeemClick(reward)}
                      disabled={!isAvailable || !hasEnoughPoints}
                      className="w-full"
                    >
                      {!hasEnoughPoints 
                        ? `${reward.pointsRequired - userPoints} puan daha gerekli`
                        : 'Hemen Kullan'
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Confirm Redemption Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ödülü Kullan</DialogTitle>
            <DialogDescription>
              Bu ödülü kullanmak istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
          {selectedReward && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">{selectedReward.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedReward.description}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">Harcanacak Puan</span>
                  <Badge variant="default" className="text-base">
                    <Star className="w-4 h-4 mr-1" />
                    {selectedReward.pointsRequired}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">Kalan Puan</span>
                  <Badge variant="outline" className="text-base">
                    {userPoints - selectedReward.pointsRequired}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Bu restoranda kullanabileceğiniz bir kupon kodu alacaksınız. Kupon otomatik olarak sepetinize eklenecektir.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDialogOpen(false)
                setSelectedReward(null)
              }}
              disabled={redeeming}
            >
              İptal
            </Button>
            <Button
              onClick={handleConfirmRedeem}
              disabled={redeeming}
            >
              {redeeming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kullanılıyor...
                </>
              ) : (
                'Onayla'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
