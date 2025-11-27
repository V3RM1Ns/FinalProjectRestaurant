'use client'

import { useEffect, useState } from 'react'
import { customerApi } from '@/lib/customer-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Loader2, Gift, Ticket, TrendingUp } from 'lucide-react'

interface LoyaltyBalance {
  customerId: string
  restaurantId: string
  restaurantName: string
  totalPoints: number
  availablePoints: number
  redeemedPoints: number
  recentTransactions: LoyaltyTransaction[]
}

interface LoyaltyTransaction {
  id: string
  customerId: string
  restaurantId: string
  restaurantName: string
  points: number
  description: string
  type: string
  earnedAt: string
  expiryDate?: string
  isRedeemed: boolean
}

export default function CustomerLoyaltyPage() {
  const { toast } = useToast()
  const [loyaltyBalances, setLoyaltyBalances] = useState<LoyaltyBalance[]>([])
  const [loyaltyHistory, setLoyaltyHistory] = useState<LoyaltyTransaction[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [redeemCode, setRedeemCode] = useState('')
  const [redeemingCode, setRedeemingCode] = useState(false)

  useEffect(() => {
    loadLoyaltyBalance()
  }, [])

  const loadLoyaltyBalance = async () => {
    try {
      setLoading(true)
      const balances = await customerApi.loyalty.getBalance()
      setLoyaltyBalances(balances || [])
    } catch (error) {
      console.error('Error loading loyalty balance:', error)
      toast({
        title: 'Hata',
        description: 'Sadakat puanları yüklenirken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadLoyaltyHistory = async (restaurantId: string) => {
    try {
      setHistoryLoading(true)
      setSelectedRestaurant(restaurantId)
      const history = await customerApi.loyalty.getHistory(restaurantId)
      setLoyaltyHistory(history || [])
    } catch (error) {
      console.error('Error loading loyalty history:', error)
      toast({
        title: 'Hata',
        description: 'İşlem geçmişi yüklenirken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleRedeemCode = async () => {
    if (!redeemCode.trim()) {
      toast({
        title: 'Hata',
        description: 'Lütfen bir kod girin.',
        variant: 'destructive',
      })
      return
    }

    setRedeemingCode(true)
    try {
      const result = await customerApi.loyalty.redeemCode(redeemCode.trim())
      toast({
        title: 'Başarılı!',
        description: `${result.points} puan kazandınız! (${result.restaurantName})`,
      })
      setRedeemCode('')
      await loadLoyaltyBalance()
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Kod kullanılırken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setRedeemingCode(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  const totalPoints = loyaltyBalances.reduce((sum, balance) => sum + balance.availablePoints, 0)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Gift className="h-8 w-8 text-primary" />
          Sadakat Puanlarım
        </h1>
        <p className="text-muted-foreground">Restoranlardan kazandığınız puanları görüntüleyin ve kod kullanın</p>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Toplam Puan Bakiyeniz
            </span>
            <Badge variant="default" className="text-lg px-4 py-2">
              {totalPoints} Puan
            </Badge>
          </CardTitle>
          <CardDescription>
            {loyaltyBalances.length} restoranınız var
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Redeem Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Kod Kullan
          </CardTitle>
          <CardDescription>Restoranlardan aldığınız sadakat kodunu buraya girerek puan kazanın</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Sadakat kodu girin (örn: LP-XXXXXX)"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              disabled={redeemingCode}
              className="flex-1"
            />
            <Button onClick={handleRedeemCode} disabled={redeemingCode || !redeemCode.trim()}>
              {redeemingCode ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kullanılıyor...
                </>
              ) : (
                'Kodu Kullan'
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            * Kod formatı: LP-XXXXXX şeklinde olmalıdır
          </p>
        </CardContent>
      </Card>

      {/* Restaurant Balances */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Restoran Bazlı Puanlarım</h2>
        
        {loyaltyBalances.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Gift className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium mb-2">Henüz puan bakiyeniz bulunmuyor</p>
              <p className="text-muted-foreground">
                Restoranlardan sipariş vererek veya kod kullanarak puan kazanmaya başlayın!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {loyaltyBalances.map((balance) => (
              <Card key={balance.restaurantId} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{balance.restaurantName}</span>
                    <Badge variant="outline" className="text-lg">
                      {balance.availablePoints} puan
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Toplam: {balance.totalPoints} puan | Kullanılan: {balance.redeemedPoints} puan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Recent Transactions */}
                  {balance.recentTransactions && balance.recentTransactions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Son İşlemler</p>
                      <div className="space-y-2">
                        {balance.recentTransactions.slice(0, 3).map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.earnedAt).toLocaleDateString('tr-TR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                            <Badge variant={transaction.type === 'Bonus' ? 'default' : 'secondary'}>
                              +{transaction.points}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => loadLoyaltyHistory(balance.restaurantId)}
                  >
                    Tüm Geçmişi Gör
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Transaction History */}
      {selectedRestaurant && (
        <Card>
          <CardHeader>
            <CardTitle>
              {loyaltyBalances.find(b => b.restaurantId === selectedRestaurant)?.restaurantName} - İşlem Geçmişi
            </CardTitle>
            <CardDescription>Tüm puan hareketleriniz</CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : loyaltyHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>İşlem geçmişi bulunamadı</p>
              </div>
            ) : (
              <div className="space-y-3">
                {loyaltyHistory.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{transaction.description}</p>
                          <Badge variant={transaction.type === 'Bonus' ? 'default' : transaction.type === 'Earned' ? 'secondary' : 'outline'}>
                            {transaction.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.earnedAt).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {transaction.expiryDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Son kullanma: {new Date(transaction.expiryDate).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">+{transaction.points}</div>
                        <p className="text-xs text-muted-foreground">puan</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2 text-blue-900">Sadakat Puanları Nasıl Kazanılır?</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Restoranlardan sipariş vererek otomatik puan kazanın</li>
            <li>• Restorandan aldığınız sadakat kodlarını kullanarak bonus puan kazanın</li>
            <li>• Kazandığınız puanları gelecek siparişlerinizde indirim olarak kullanabilirsiniz</li>
            <li>• Her restoranın kendi sadakat programı ve puan sistemi vardır</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

