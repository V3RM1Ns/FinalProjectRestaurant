"use client"

import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, Trash2, ShoppingBag, X, Tag, Gift } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { loyaltyApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Redemption {
  id: string
  rewardName: string
  restaurantName: string
  pointsSpent: number
  couponCode: string
  redeemedAt: string
  isUsed: boolean
  expiryDate: string
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, clearCart, appliedCoupon, removeCoupon, discountAmount, finalTotal, currentRestaurantId, applyCoupon } = useCart()
  const router = useRouter()
  const { toast } = useToast()
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [loadingRedemptions, setLoadingRedemptions] = useState(false)
  const [couponsDialogOpen, setCouponsDialogOpen] = useState(false)

  useEffect(() => {
    if (items.length > 0) {
      fetchRedemptions()
    }
  }, [items])

  const fetchRedemptions = async () => {
    setLoadingRedemptions(true)
    try {
      const data = await loyaltyApi.customer.getRedemptions()
      // Filter only unused coupons and not expired
      const validRedemptions = data.filter((r: Redemption) => 
        !r.isUsed && new Date(r.expiryDate) > new Date()
      )
      setRedemptions(validRedemptions)
    } catch (error: any) {
      console.error('Error fetching redemptions:', error)
    } finally {
      setLoadingRedemptions(false)
    }
  }

  const handleApplyCoupon = async (redemption: Redemption) => {
    // Check if coupon is for current restaurant
    const currentRestaurantName = items[0]?.restaurantName
    
    if (redemption.restaurantName !== currentRestaurantName) {
      toast({
        title: 'Hata',
        description: `Bu kupon sadece "${redemption.restaurantName}" restoranı için geçerlidir.`,
        variant: 'destructive',
      })
      return
    }

    // Get reward details to get discount amount
    try {
      const rewards = await loyaltyApi.getRestaurantRewards(currentRestaurantId || '')
      const reward = rewards.find((r: any) => r.name === redemption.rewardName)
      
      if (reward) {
        applyCoupon({
          couponCode: redemption.couponCode,
          discountAmount: reward.discountAmount || 0,
          discountPercentage: reward.discountPercentage || 0,
          rewardName: redemption.rewardName,
          restaurantId: currentRestaurantId || ''
        })

        toast({
          title: 'Başarılı!',
          description: `Kupon "${redemption.couponCode}" sepete uygulandı.`,
        })
        
        setCouponsDialogOpen(false)
      }
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: 'Kupon uygulanırken bir hata oluştu.',
        variant: 'destructive',
      })
    }
  }

  if (items.length === 0) {
    return (
      <div className="container py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-12 pb-12">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Sepetiniz Boş</h2>
            <p className="text-muted-foreground mb-6">Henüz sepetinize ürün eklemediniz</p>
            <Link href="/restaurants">
              <Button>Restoranları Keşfet</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Group items by restaurant
  const itemsByRestaurant = items.reduce(
    (acc, item) => {
      if (!acc[item.restaurantId]) {
        acc[item.restaurantId] = {
          restaurantName: item.restaurantName,
          items: [],
        }
      }
      acc[item.restaurantId].items.push(item)
      return acc
    },
    {} as Record<string, { restaurantName: string; items: typeof items }>,
  )

  const deliveryFee = 15.00

  // Filter coupons for current restaurant
  const currentRestaurantCoupons = redemptions.filter(
    r => r.restaurantName === items[0]?.restaurantName
  )

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Sepetim</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(itemsByRestaurant).map(([restaurantId, { restaurantName, items: restaurantItems }]) => (
            <Card key={restaurantId}>
              <CardHeader>
                <CardTitle>{restaurantName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {restaurantItems.map((item) => (
                  <div key={item.menuItem.id}>
                    <div className="flex gap-4">
                      <img
                        src={item.menuItem.imageUrl || "/placeholder.svg"}
                        alt={item.menuItem.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{item.menuItem.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{item.menuItem.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">₺{item.menuItem.price}</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeItem(item.menuItem.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Sipariş Özeti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ara Toplam</span>
                  <span>₺{total.toFixed(2)}</span>
                </div>

                {/* Applied Coupon */}
                {appliedCoupon && (
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-900">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                            {appliedCoupon.rewardName}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Kupon: {appliedCoupon.couponCode}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-green-600 hover:text-green-700 dark:text-green-400"
                        onClick={removeCoupon}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-green-600 dark:text-green-400">İndirim</span>
                      <Badge variant="default" className="bg-green-600 text-white">
                        -₺{discountAmount.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Available Coupons Button */}
                {!appliedCoupon && currentRestaurantCoupons.length > 0 && (
                  <Dialog open={couponsDialogOpen} onOpenChange={setCouponsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full" size="sm">
                        <Gift className="h-4 w-4 mr-2" />
                        Kupon Kullan ({currentRestaurantCoupons.length})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Kuponlarım</DialogTitle>
                        <DialogDescription>
                          {items[0]?.restaurantName} restoranı için kullanılabilir kuponlarınız
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 mt-4">
                        {currentRestaurantCoupons.map((redemption) => (
                          <Card key={redemption.id} className="border-2">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Gift className="h-5 w-5 text-primary" />
                                    <h4 className="font-semibold">{redemption.rewardName}</h4>
                                  </div>
                                  <div className="space-y-1 text-sm text-muted-foreground">
                                    <p className="flex items-center gap-2">
                                      <Tag className="h-3 w-3" />
                                      Kupon Kodu: <span className="font-mono font-semibold text-foreground">{redemption.couponCode}</span>
                                    </p>
                                    <p>Son Kullanma: {new Date(redemption.expiryDate).toLocaleDateString('tr-TR')}</p>
                                    <p className="text-xs">Kullanılan Puan: {redemption.pointsSpent}</p>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => handleApplyCoupon(redemption)}
                                  size="sm"
                                  className="shrink-0"
                                >
                                  Kullan
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Teslimat Ücreti</span>
                  <span>₺{deliveryFee.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Toplam</span>
                  <span>₺{(finalTotal + deliveryFee).toFixed(2)}</span>
                </div>

                {appliedCoupon && discountAmount > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 text-center">
                    🎉 ₺{discountAmount.toFixed(2)} tasarruf ettiniz!
                  </p>
                )}
              </div>

              <Button className="w-full" size="lg" onClick={() => router.push("/checkout")}>
                Siparişi Tamamla
              </Button>

              <Button variant="outline" className="w-full bg-transparent" onClick={clearCart}>
                Sepeti Temizle
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
