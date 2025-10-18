"use client"

import { useState, useEffect } from "react"
import type { Restaurant } from "@/types"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Star, Clock, Map, List } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data
const mockRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "Lezzet Durağı",
    description: "Geleneksel Türk mutfağının en lezzetli örnekleri",
    address: "Kadıköy, İstanbul",
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
  },
  {
    id: "2",
    name: "Pizza Palace",
    description: "İtalyan usulü taş fırın pizzalar",
    address: "Beşiktaş, İstanbul",
    phoneNumber: "+90 555 234 5678",
    email: "info@pizzapalace.com",
    rating: 4.7,
    isActive: true,
    ownerId: "2",
    latitude: 41.0422,
    longitude: 29.0089,
    category: "İtalyan",
    priceRange: "₺₺₺",
    imageUrl: "/italian-pizza-restaurant.jpg",
  },
  {
    id: "3",
    name: "Sushi Master",
    description: "Taze deniz ürünleri ve otantik Japon lezzetleri",
    address: "Nişantaşı, İstanbul",
    phoneNumber: "+90 555 345 6789",
    email: "info@sushimaster.com",
    rating: 4.8,
    isActive: true,
    ownerId: "3",
    latitude: 41.0461,
    longitude: 28.9948,
    category: "Japon",
    priceRange: "₺₺₺₺",
    imageUrl: "/japanese-sushi-restaurant.png",
  },
]

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  // Mock API call
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true)
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      setRestaurants(mockRestaurants)
      setFilteredRestaurants(mockRestaurants)
      setLoading(false)
    }

    fetchRestaurants()
  }, [])

  // Filter restaurants
  useEffect(() => {
    let filtered = restaurants

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((r) => r.category === categoryFilter)
    }

    setFilteredRestaurants(filtered)
  }, [searchQuery, categoryFilter, restaurants])

  const categories = ["all", ...Array.from(new Set(restaurants.map((r) => r.category)))]

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Restoranları Keşfet</h1>
        <p className="text-muted-foreground">Yakınınızdaki en iyi restoranları bulun ve sipariş verin</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Restoran adı, konum veya kategori ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "Tüm Kategoriler" : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* View Tabs */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            Liste
          </TabsTrigger>
          <TabsTrigger value="map" className="gap-2">
            <Map className="h-4 w-4" />
            Harita
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted" />
                  <CardHeader>
                    <div className="h-6 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Restoran bulunamadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={restaurant.imageUrl || "/placeholder.svg"}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-3 right-3 bg-background/90">{restaurant.priceRange}</Badge>
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-xl">{restaurant.name}</CardTitle>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{restaurant.rating}</span>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2">{restaurant.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{restaurant.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>30-45 dk</span>
                        </div>
                        <Badge variant="secondary">{restaurant.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="map">
          <Card className="h-[600px] flex items-center justify-center">
            <div className="text-center">
              <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Harita görünümü (Leaflet/Google Maps entegrasyonu)</p>
              <p className="text-sm text-muted-foreground mt-2">
                Restoranlar harita üzerinde işaretçilerle gösterilecek
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
