"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRestaurant } from "@/contexts/restaurant-context"
import { Store } from "lucide-react"

export default function RestaurantSelector() {
  const { restaurants, selectedRestaurant, selectRestaurant, loading } = useRestaurant()

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Store className="h-4 w-4" />
        <span>Yükleniyor...</span>
      </div>
    )
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Henüz restoranınız yok
      </div>
    )
  }

  return (
    <Select
      value={selectedRestaurant?.id || ""}
      onValueChange={(value) => {
        const restaurant = restaurants.find((r) => r.id === value)
        if (restaurant) selectRestaurant(restaurant)
      }}
    >
      <SelectTrigger className="w-full">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4" />
          <SelectValue placeholder="Restoran seçin" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {restaurants.map((restaurant) => (
          <SelectItem key={restaurant.id} value={restaurant.id}>
            {restaurant.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

