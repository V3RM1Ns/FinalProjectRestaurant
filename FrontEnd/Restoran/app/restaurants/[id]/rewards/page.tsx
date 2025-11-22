'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { loyaltyApi } from '@/lib/api'
import { customerApi } from '@/lib/customer-api'
import { ArrowLeft, Gift, Star, Clock, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
  const [loading, setLoading] = useState(false)
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [userPoints, setUserPoints] = useState(0)
  
  const restaurantId = params.id as string

  useEffect(() => {
    fetchRewards()
    fetchUserPoints()
    fetchRestaurantInfo()
  }, [restaurantId])

  const fetchRestaurantInfo = async () => {
    try {
      const restaurantData = await customerApi.restaurants.getById(restaurantId)
      // You can store restaurant data in state if needed
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
        title: 'Error',
        description: error.message,
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

    setLoading(true)
    try {
      const redemption = await loyaltyApi.customer.redeemReward(selectedReward.id)
      toast({
        title: 'Success!',
        description: `Reward redeemed! Your coupon code: ${redemption.couponCode}`,
      })
      setConfirmDialogOpen(false)
      fetchRewards()
      fetchUserPoints()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Loyalty Rewards</h1>
        <p className="text-muted-foreground">Redeem your points for exclusive rewards</p>
        <div className="mt-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Star className="w-4 h-4 mr-2" />
            Your Points: {userPoints}
          </Badge>
        </div>
      </div>

      {loading && rewards.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Loading rewards...</div>
      ) : rewards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Gift className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No rewards available at this restaurant yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => {
            const isAvailable = reward.isActive && 
                               (!reward.maxRedemptions || reward.currentRedemptions < reward.maxRedemptions) &&
                               (!reward.endDate || new Date(reward.endDate) > new Date())
            const hasEnoughPoints = userPoints >= reward.pointsRequired

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
                      <Badge variant="secondary">Unavailable</Badge>
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
                          {reward.discountAmount && `$${reward.discountAmount} OFF`}
                          {reward.discountPercentage && `${reward.discountPercentage}% OFF`}
                        </div>
                      </div>
                    )}

                    {/* Points Required */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Points Required</span>
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
                            {reward.currentRedemptions}/{reward.maxRedemptions} redeemed
                          </span>
                        </div>
                      )}
                      {reward.endDate && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>
                            Valid until {new Date(reward.endDate).toLocaleDateString()}
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
                        ? `Need ${reward.pointsRequired - userPoints} more points`
                        : 'Redeem Now'
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
            <DialogTitle>Confirm Redemption</DialogTitle>
            <DialogDescription>
              Are you sure you want to redeem this reward?
            </DialogDescription>
          </DialogHeader>
          {selectedReward && (
            <div className="py-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">{selectedReward.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedReward.description}</p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Points to Spend</span>
                    <span className="font-bold">-{selectedReward.pointsRequired}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Remaining Balance</span>
                    <span className="font-bold">{userPoints - selectedReward.pointsRequired}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  You'll receive a coupon code that can be used at this restaurant.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDialogOpen(false)
                setSelectedReward(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmRedeem} disabled={loading}>
              {loading ? 'Redeeming...' : 'Confirm Redeem'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
