"use client"

import type React from "react"

import { useState } from "react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { customerApi } from "@/lib/customer-api"

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [address, setAddress] = useState({
    street: "",
    city: "",
    district: "",
    postalCode: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate address
      if (!address.street || !address.city || !address.district) {
        toast({
          title: "Eksik Bilgi",
          description: "Lütfen teslimat adresini eksiksiz doldurun.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Get restaurant ID from cart items (all items should be from same restaurant)
      const restaurantId = items[0]?.restaurantId
      if (!restaurantId) {
        toast({
          title: "Hata",
          description: "Sepetinizde ürün bulunamadı.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Prepare order data
      const deliveryAddress = `${address.street}, ${address.district}, ${address.city}`
      const orderData = {
        restaurantId: restaurantId,
        orderType: 2, // Delivery = 2
        deliveryAddress: deliveryAddress,
        deliveryInstructions: address.notes || "",
        paymentMethod: paymentMethod === "card" ? "Kredi Kartı" : "Kapıda Nakit",
        items: items.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          specialInstructions: item.notes || ""
        }))
      }

      // Create order via API
      const response = await customerApi.orders.create(orderData)

      toast({
        title: "Sipariş Oluşturuldu! ✅",
        description: `Sipariş numaranız: #${response.id.substring(0, 8).toUpperCase()}. Email adresinize onay maili gönderildi.`,
      })

      clearCart()
      setLoading(false)
      router.push(`/customer/orders`)
    } catch (error: any) {
      console.error("Order creation error:", error)
      toast({
        title: "Sipariş Oluşturulamadı",
        description: error.response?.data?.message || error.message || "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  if (items.length === 0) {
    router.push("/cart")
    return null
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Ödeme</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle>Teslimat Adresi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="street">Adres</Label>
                    <Input
                      id="street"
                      placeholder="Sokak, Mahalle, Bina No"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="district">İlçe</Label>
                    <Input
                      id="district"
                      placeholder="İlçe"
                      value={address.district}
                      onChange={(e) => setAddress({ ...address, district: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Şehir</Label>
                    <Input
                      id="city"
                      placeholder="Şehir"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="notes">Adres Tarifi (Opsiyonel)</Label>
                    <Input
                      id="notes"
                      placeholder="Ek bilgiler..."
                      value={address.notes}
                      onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Ödeme Yöntemi</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5" />
                      <span>Kredi/Banka Kartı</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Wallet className="h-5 w-5" />
                      <span>Kapıda Nakit Ödeme</span>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Kart Numarası</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" required={paymentMethod === "card"} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Son Kullanma Tarihi</Label>
                        <Input id="expiry" placeholder="MM/YY" required={paymentMethod === "card"} />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" required={paymentMethod === "card"} />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Sipariş Özeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.menuItem.id} className="flex justify-between text-sm">
                      <span>
                        {item.menuItem.name} x{item.quantity}
                      </span>
                      <span>₺{(item.menuItem.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ara Toplam</span>
                    <span>₺{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Teslimat</span>
                    <span>₺15.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Toplam</span>
                    <span>₺{(total + 15).toFixed(2)}</span>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "İşleniyor..." : "Siparişi Onayla"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
