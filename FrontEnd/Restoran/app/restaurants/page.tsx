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
import { customerApi } from "@/lib/customer-api"

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch restaurants from API
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await customerApi.restaurants.getAll(1, 100)
        const restaurantData = response.items || response
        setRestaurants(restaurantData)
        setFilteredRestaurants(restaurantData)
      } catch (err: any) {
        console.error('Error fetching restaurants:', err)
        setError('Restoranlar yüklenirken bir hata oluştu')
      } finally {
        setLoading(false)
      }
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
          r.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((r) => r.category === categoryFilter)
    }

    setFilteredRestaurants(filtered)
  }, [searchQuery, categoryFilter, restaurants])

  const categories = ["all", ...Array.from(new Set(restaurants.map((r) => r.category).filter(Boolean)))]

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    )
  }

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
          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Restoran bulunamadı</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredRestaurants.map((restaurant) => (
                <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
 i                   <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                    {/* Restaurant Image */}
                    {restaurant.imageUrl ? (
                      <div className="relative w-full h-48 bg-muted">
                        <img
                          src={restaurant.imageUrl}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.jpg';
                          }}
                        />
                        {restaurant.rating && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="flex items-center gap-1 bg-white/90 backdrop-blur">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {restaurant.rating.toFixed(1)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative w-full h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="h-12 w-12 mx-auto text-orange-400 mb-2" />
                          <p className="text-sm text-orange-600">Fotoğraf yok</p>
                        </div>
                        {restaurant.rating && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {restaurant.rating.toFixed(1)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl">{restaurant.name}</CardTitle>
                      </div>
                      {restaurant.category && (
                        <Badge variant="outline">{restaurant.category}</Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4 line-clamp-2">{restaurant.description}</CardDescription>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="line-clamp-1">{restaurant.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span>{restaurant.isActive ? 'Açık' : 'Kapalı'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="map">
          <div className="bg-muted rounded-lg p-12 text-center">
            <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Harita görünümü yakında eklenecek</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
