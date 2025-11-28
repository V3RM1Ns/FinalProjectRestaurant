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
  const { applyCoupon } = useCart()
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(false)
  const [userPoints, setUserPoints] = useState(0)
  const [restaurantName, setRestaurantName] = useState('')
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  
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
    } catch (error: any) {
      console.error('Error fetching restaurant:', error)
    }
  }

  const fetchRewards = async () => {
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

      await applyCoupon({
        code: redemption.couponCode,
        discountAmount: selectedReward.discountAmount,
        discountPercentage: selectedReward.discountPercentage,
        rewardName: selectedReward.name,
        restaurantId: restaurantId
      })

      await fetchRewards()
      await fetchUserPoints()

      setConfirmDialogOpen(false)
      setSelectedReward(null)
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
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Star className="w-4 h-4 mr-1" />
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
            <Gift className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p>Bu restoranda henüz ödül bulunmuyor.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => {
            const hasEnoughPoints = userPoints >= reward.pointsRequired
            const isAvailable = reward.isActive && reward.canRedeem

            return (
              <Card key={reward.id} className="overflow-hidden">
                {reward.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={reward.imageUrl}
                      alt={reward.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{reward.name}</CardTitle>
                    {!isAvailable && (
                      <Badge variant="secondary">Kullanılamaz</Badge>
                    )}
                  </div>
                  <CardDescription>{reward.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(reward.discountAmount || reward.discountPercentage) && (
                    <div className="text-2xl font-bold text-primary">
                      {reward.discountAmount && `₺${reward.discountAmount} İndirim`}
                      {reward.discountPercentage && `%${reward.discountPercentage} İndirim`}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Badge variant={hasEnoughPoints ? "default" : "secondary"}>
                      <Star className="w-3 h-3 mr-1" />
                      {reward.pointsRequired} Puan
                    </Badge>
                  </div>

                  {reward.maxRedemptions && (
                    <div className="text-xs text-muted-foreground">
                      <Users className="w-3 h-3 inline mr-1" />
                      {reward.currentRedemptions}/{reward.maxRedemptions} kullanıldı
                    </div>
                  )}

                  {reward.endDate && (
                    <div className="text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(reward.endDate).toLocaleDateString('tr-TR')} tarihine kadar geçerli
                    </div>
                  )}

                  <Button
                    className="w-full"
                    disabled={!hasEnoughPoints || !isAvailable}
                    onClick={() => handleRedeemClick(reward)}
                  >
                    {!hasEnoughPoints ? 'Yetersiz Puan' : 'Kullan'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ödülü Kullan</DialogTitle>
            <DialogDescription>
              {selectedReward && (
                <>
                  <strong>{selectedReward.name}</strong> ödülünü kullanmak istediğinizden emin misiniz?
                  Bu işlem {selectedReward.pointsRequired} puan harcar.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} disabled={redeeming}>
              İptal
            </Button>
            <Button onClick={handleConfirmRedeem} disabled={redeeming}>
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
