'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { loyaltyApi } from '@/lib/api'
import { Gift, Award, Ticket, TrendingUp } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface LoyaltyBalance {
  customerId: string
  restaurantId: string
  restaurantName: string
  totalPoints: number
  availablePoints: number
  redeemedPoints: number
  recentTransactions: any[]
}

interface Redemption {
  id: string
  rewardName: string
  restaurantName: string
  pointsSpent: number
  couponCode?: string
  redeemedAt: string
  isUsed: boolean
  usedAt?: string
  expiryDate?: string
}

export default function CustomerLoyaltyPage() {
  const { toast } = useToast()
  const [balances, setBalances] = useState<LoyaltyBalance[]>([])
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [loading, setLoading] = useState(false)
  const [codeDialogOpen, setCodeDialogOpen] = useState(false)
  const [redeemCode, setRedeemCode] = useState('')

  useEffect(() => {
    fetchBalances()
    fetchRedemptions()
  }, [])

  const fetchBalances = async () => {
    setLoading(true)
    try {
      const data = await loyaltyApi.customer.getBalance()
      setBalances(data)
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

  const fetchRedemptions = async () => {
    try {
      const data = await loyaltyApi.customer.getRedemptions()
      setRedemptions(data)
    } catch (error: any) {
      console.error(error)
    }
  }

  const handleRedeemCode = async () => {
    if (!redeemCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a code',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const result = await loyaltyApi.customer.redeemCode(redeemCode)
      toast({
        title: 'Success!',
        description: `You earned ${result.points} points!`,
      })
      setCodeDialogOpen(false)
      setRedeemCode('')
      fetchBalances()
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

  const totalAvailablePoints = balances.reduce((sum, b) => sum + b.availablePoints, 0)
  const totalEarnedPoints = balances.reduce((sum, b) => sum + b.totalPoints, 0)

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Loyalty Points</h1>
        <p className="text-muted-foreground">Redeem codes and use your points for rewards</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="w-4 h-4" />
              Available Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAvailablePoints}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEarnedPoints}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Active Coupons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {redemptions.filter(r => !r.isUsed && (!r.expiryDate || new Date(r.expiryDate) > new Date())).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Unused rewards</p>
          </CardContent>
        </Card>
      </div>

      {/* Redeem Code Button */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Have a Code?
          </CardTitle>
          <CardDescription>Redeem a loyalty code to earn points</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setCodeDialogOpen(true)} size="lg" className="w-full">
            Redeem Code
          </Button>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="balance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="balance">Points Balance</TabsTrigger>
          <TabsTrigger value="coupons">My Coupons</TabsTrigger>
        </TabsList>

        <TabsContent value="balance" className="space-y-4">
          {loading && balances.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading...
              </CardContent>
            </Card>
          ) : balances.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No loyalty points yet. Redeem a code to get started!
              </CardContent>
            </Card>
          ) : (
            balances.map((balance) => (
              <Card key={balance.restaurantId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{balance.restaurantName}</CardTitle>
                    <Badge className="text-lg px-4 py-1">
                      {balance.availablePoints} pts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total Earned</div>
                      <div className="font-semibold">{balance.totalPoints}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Available</div>
                      <div className="font-semibold text-green-600">{balance.availablePoints}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Redeemed</div>
                      <div className="font-semibold text-orange-600">{balance.redeemedPoints}</div>
                    </div>
                  </div>

                  {balance.recentTransactions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Recent Transactions</h4>
                      <div className="space-y-2">
                        {balance.recentTransactions.map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between text-sm border-l-2 border-primary pl-3 py-1">
                            <div>
                              <div className="font-medium">{tx.description}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(tx.earnedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge variant={tx.points > 0 ? 'default' : 'secondary'}>
                              {tx.points > 0 ? '+' : ''}{tx.points}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="coupons" className="space-y-4">
          {redemptions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No coupons yet. Redeem points for rewards!
              </CardContent>
            </Card>
          ) : (
            redemptions.map((redemption) => {
              const isExpired = redemption.expiryDate && new Date(redemption.expiryDate) < new Date()
              const isActive = !redemption.isUsed && !isExpired

              return (
                <Card key={redemption.id} className={!isActive ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{redemption.rewardName}</CardTitle>
                        <CardDescription>{redemption.restaurantName}</CardDescription>
                      </div>
                      <Badge variant={isActive ? 'default' : 'secondary'}>
                        {redemption.isUsed ? 'Used' : isExpired ? 'Expired' : 'Active'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {redemption.couponCode && (
                      <div className="bg-muted p-4 rounded-lg mb-3">
                        <div className="text-xs text-muted-foreground mb-1">Coupon Code</div>
                        <code className="text-xl font-mono font-bold">{redemption.couponCode}</code>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Points Spent</div>
                        <div className="font-semibold">{redemption.pointsSpent}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Redeemed</div>
                        <div className="font-semibold">
                          {new Date(redemption.redeemedAt).toLocaleDateString()}
                        </div>
                      </div>
                      {redemption.expiryDate && (
                        <div>
                          <div className="text-muted-foreground">Expires</div>
                          <div className={`font-semibold ${isExpired ? 'text-red-600' : ''}`}>
                            {new Date(redemption.expiryDate).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                      {redemption.usedAt && (
                        <div>
                          <div className="text-muted-foreground">Used</div>
                          <div className="font-semibold">
                            {new Date(redemption.usedAt).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Redeem Code Dialog */}
      <Dialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem Loyalty Code</DialogTitle>
            <DialogDescription>
              Enter your loyalty code to earn points
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g., LP-ABC12345)"
              className="text-center text-lg font-mono"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCodeDialogOpen(false)
                setRedeemCode('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRedeemCode} disabled={loading}>
              {loading ? 'Redeeming...' : 'Redeem'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

