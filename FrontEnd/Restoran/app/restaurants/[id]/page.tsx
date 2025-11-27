"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import type { Restaurant, Menu, MenuItem } from "@/types"
import { getCategoryName } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Clock, Phone, Mail, Plus, Minus, Gift } from "lucide-react"
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ReviewSection } from "@/components/reviews/review-section"
import { customerApi } from "@/lib/customer-api"
import { RestaurantLocationMap } from "@/components/maps/RestaurantLocationMap"

export default function RestaurantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const { toast } = useToast()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [currentMenuPage, setCurrentMenuPage] = useState<{[key: string]: number}>({})
  const menuItemsPerPage = 6

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch restaurant details from API
        const restaurantData = await customerApi.restaurants.getById(params.id as string)
        
        // Fix imageUrl to use full URL
        if (restaurantData.imageUrl && !restaurantData.imageUrl.startsWith('http')) {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
          restaurantData.imageUrl = `${baseUrl}${restaurantData.imageUrl}`
        }
        
        setRestaurant(restaurantData)
        
        // Fetch restaurant menus
        const menusData = await customerApi.restaurants.getMenus(params.id as string)
        
        // Fix imageUrls in menu items
        menusData.forEach((menu: any) => {
          menu.menuItems?.forEach((item: any) => {
            if (item.imageUrl && !item.imageUrl.startsWith('http')) {
              const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
              item.imageUrl = `${baseUrl}${item.imageUrl}`
            }
          })
        })
        
        setMenus(menusData)
      } catch (error: any) {
        console.error("Error fetching restaurant:", error)
        toast({
          title: "Hata",
          description: "Restoran bilgileri yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, toast])

  const handleDialogOpen = (item: MenuItem) => {
    setSelectedItem(item)
    setQuantity(1)
  }

  const handleAddToCart = async () => {
    if (!restaurant || !selectedItem) return

    const success = await addItem(selectedItem, restaurant.id, restaurant.name, quantity)

    if (success) {
      toast({
        title: "Sepete eklendi",
        description: `${selectedItem.name} (${quantity} adet) sepetinize eklendi.`,
      })

      const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]') as HTMLButtonElement
      closeButton?.click()
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setSelectedItem(null)
        setQuantity(1)
      }, 100)
    }
  }

  const getPaginatedItems = (items: MenuItem[], menuId: string) => {
    const page = currentMenuPage[menuId] || 1
    const startIndex = (page - 1) * menuItemsPerPage
    const endIndex = startIndex + menuItemsPerPage
    return items.slice(startIndex, endIndex)
  }

  const getTotalPages = (itemsCount: number) => {
    return Math.ceil(itemsCount / menuItemsPerPage)
  }

  const setMenuPage = (menuId: string, page: number) => {
    setCurrentMenuPage(prev => ({ ...prev, [menuId]: page }))
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
                <Badge>{getCategoryName(restaurant.category)}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="default"
                onClick={() => router.push(`/restaurants/${params.id}/rewards`)}
                className="gap-2"
              >
                <Gift className="h-4 w-4" />
                Rewards
              </Button>
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
                    <p className="text-sm text-muted-foreground">09:00 - 23:00</p>
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

            {menus.map((menu) => {
              const paginatedItems = getPaginatedItems(menu.menuItems, menu.id)
              const totalPages = getTotalPages(menu.menuItems.length)
              const currentPage = currentMenuPage[menu.id] || 1

              return (
                <TabsContent key={menu.id} value={menu.id}>
                  <p className="text-muted-foreground mb-6">{menu.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedItems.map((item) => (
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
                          <Dialog 
                            open={selectedItem?.id === item.id} 
                            onOpenChange={(open) => handleDialogClose(open)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                className="w-full"
                                disabled={!item.isAvailable}
                                onClick={() => handleDialogOpen(item)}
                              >
                                Sepete Ekle
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{item.name}</DialogTitle>
                                <DialogDescription>{item.description}</DialogDescription>
                              </DialogHeader>
                              {selectedItem && (
                                <div className="space-y-4">
                                  <img
                                    src={selectedItem.imageUrl || "/placeholder.svg"}
                                    alt={selectedItem.name}
                                    className="w-full h-48 object-cover rounded-lg"
                                  />

                                  <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold">₺{selectedItem.price}</span>
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

                                  <Button className="w-full" size="lg" onClick={handleAddToCart}>
                                    Sepete Ekle - ₺{selectedItem.price * quantity}
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Menu Items Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setMenuPage(menu.id, Math.max(1, currentPage - 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setMenuPage(menu.id, page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setMenuPage(menu.id, Math.min(totalPages, currentPage + 1))}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </TabsContent>
              )
            })}
          </Tabs>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <ReviewSection restaurantId={restaurant.id} restaurantName={restaurant.name} />
        </div>

        {/* Map Section */}
        {restaurant.latitude && restaurant.longitude && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Konum</h2>
            <Card>
              <CardContent className="p-4">
                <div className="h-64 w-full">
                  <RestaurantLocationMap
                    latitude={restaurant.latitude}
                    longitude={restaurant.longitude}
                    restaurantName={restaurant.name}
                    address={restaurant.address}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
