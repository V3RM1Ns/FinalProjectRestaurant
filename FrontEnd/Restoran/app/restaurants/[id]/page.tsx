"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import type { Restaurant, Menu, MenuItem } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Clock, Phone, Mail, Plus, Minus } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChatButton } from "@/components/chat/chat-button"
import { ReviewSection } from "@/components/reviews/review-section"

// Mock data
const mockRestaurant: Restaurant = {
  id: "1",
  name: "Lezzet Durağı",
  description: "Geleneksel Türk mutfağının en lezzetli örnekleri. 1985 yılından beri hizmetinizdeyiz.",
  address: "Kadıköy Moda Caddesi No: 123, İstanbul",
  phoneNumber: "+90 555 123 4567",
  email: "info@lezzetduragi.com",
  rating: 4.5,
  isActive: true,
  ownerId: "1",
  latitude: 40.9929,
  longitude: 29.0261,
  category: "Türk Mutfağı",
  priceRange: "₺₺",
  imageUrl: "/turkish-restaurant-interior.jpg",
  openingHours: "09:00 - 23:00",
}

const mockMenus: Menu[] = [
  {
    id: "1",
    name: "Ana Yemekler",
    description: "Geleneksel Türk ana yemekleri",
    restaurantId: "1",
    menuItems: [
      {
        id: "1",
        name: "İskender Kebap",
        description: "Yoğurt ve tereyağlı pide üzerinde döner",
        price: 180,
        category: "Ana Yemek",
        isAvailable: true,
        menuId: "1",
        imageUrl: "/steak-dinner.jpg",
      },
      {
        id: "2",
        name: "Adana Kebap",
        description: "Acılı kıyma kebap, pilav ve salata ile",
        price: 160,
        category: "Ana Yemek",
        isAvailable: true,
        menuId: "1",
        imageUrl: "/burger-meal.jpg",
      },
      {
        id: "3",
        name: "Kuzu Tandır",
        description: "Fırında pişmiş kuzu eti, pilav ile",
        price: 220,
        category: "Ana Yemek",
        isAvailable: true,
        menuId: "1",
        imageUrl: "/pasta-dish.jpg",
      },
    ],
  },
  {
    id: "2",
    name: "Başlangıçlar",
    description: "Mezeler ve çorbalar",
    restaurantId: "1",
    menuItems: [
      {
        id: "4",
        name: "Mercimek Çorbası",
        description: "Geleneksel mercimek çorbası",
        price: 35,
        category: "Çorba",
        isAvailable: true,
        menuId: "2",
        imageUrl: "/chef-cooking.jpg",
      },
      {
        id: "5",
        name: "Karışık Meze Tabağı",
        description: "Humus, haydari, patlıcan salatası, cacık",
        price: 120,
        category: "Meze",
        isAvailable: true,
        menuId: "2",
        imageUrl: "/restaurant-table.jpg",
      },
    ],
  },
  {
    id: "3",
    name: "İçecekler",
    description: "Soğuk ve sıcak içecekler",
    restaurantId: "1",
    menuItems: [
      {
        id: "6",
        name: "Ayran",
        description: "Ev yapımı ayran",
        price: 15,
        category: "İçecek",
        isAvailable: true,
        menuId: "3",
        imageUrl: "/food-delivery.jpg",
      },
      {
        id: "7",
        name: "Türk Kahvesi",
        description: "Geleneksel Türk kahvesi",
        price: 25,
        category: "İçecek",
        isAvailable: true,
        menuId: "3",
        imageUrl: "/restaurant-hero.jpg",
      },
    ],
  },
]

export default function RestaurantDetailPage() {
  const params = useParams()
  const { addItem } = useCart()
  const { toast } = useToast()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      setRestaurant(mockRestaurant)
      setMenus(mockMenus)
      setLoading(false)
    }

    fetchData()
  }, [params.id])

  const handleAddToCart = (item: MenuItem) => {
    if (!restaurant) return

    for (let i = 0; i < quantity; i++) {
      addItem(item, restaurant.id, restaurant.name)
    }

    toast({
      title: "Sepete eklendi",
      description: `${item.name} (${quantity} adet) sepetinize eklendi.`,
    })

    setSelectedItem(null)
    setQuantity(1)
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-muted rounded-lg" />
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="container py-8">
        <p>Restoran bulunamadı</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img
          src={restaurant.imageUrl || "/placeholder.svg"}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container py-8">
        {/* Restaurant Info */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{restaurant.rating}</span>
                </div>
                <Badge>{restaurant.category}</Badge>
                <span>{restaurant.priceRange}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon">
                <MapPin className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Clock className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-6">{restaurant.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Adres</p>
                    <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Çalışma Saatleri</p>
                    <p className="text-sm text-muted-foreground">{restaurant.openingHours}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">İletişim</p>
                    <p className="text-sm text-muted-foreground">{restaurant.phoneNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Menu Section */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Menü</h2>

          <Tabs defaultValue={menus[0]?.id} className="w-full">
            <TabsList className="mb-6">
              {menus.map((menu) => (
                <TabsTrigger key={menu.id} value={menu.id}>
                  {menu.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {menus.map((menu) => (
              <TabsContent key={menu.id} value={menu.id}>
                <p className="text-muted-foreground mb-6">{menu.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menu.menuItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="relative h-48">
                        <img
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <Badge variant="destructive">Stokta Yok</Badge>
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <span className="font-bold text-primary whitespace-nowrap">₺{item.price}</span>
                        </div>
                        <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              className="w-full"
                              disabled={!item.isAvailable}
                              onClick={() => {
                                setSelectedItem(item)
                                setQuantity(1)
                              }}
                            >
                              Sepete Ekle
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{item.name}</DialogTitle>
                              <DialogDescription>{item.description}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <img
                                src={item.imageUrl || "/placeholder.svg"}
                                alt={item.name}
                                className="w-full h-48 object-cover rounded-lg"
                              />

                              <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold">₺{item.price}</span>
                                <div className="flex items-center gap-3">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="text-xl font-medium w-8 text-center">{quantity}</span>
                                  <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <Button className="w-full" size="lg" onClick={() => handleAddToCart(item)}>
                                Sepete Ekle - ₺{item.price * quantity}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <ReviewSection restaurantId={restaurant.id} restaurantName={restaurant.name} />
        </div>
      </div>

      {/* Chat Button */}
      <ChatButton restaurantId={restaurant.id} restaurantName={restaurant.name} />
    </div>
  )
}
