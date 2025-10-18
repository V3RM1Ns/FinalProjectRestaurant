"use client"

import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart()
  const router = useRouter()

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
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Teslimat Ücreti</span>
                  <span>₺15.00</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Toplam</span>
                  <span>₺{(total + 15).toFixed(2)}</span>
                </div>
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
