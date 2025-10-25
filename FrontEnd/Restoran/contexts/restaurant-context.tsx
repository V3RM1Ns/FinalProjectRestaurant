"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Restaurant } from "@/types"
import { restaurantApi } from "@/lib/api"
import { useAuth } from "./auth-context"

interface RestaurantContextType {
  restaurants: Restaurant[]
  selectedRestaurant: Restaurant | null
  selectRestaurant: (restaurant: Restaurant) => void
  loading: boolean
  refreshRestaurants: () => Promise<void>
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined)

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchRestaurants = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const data = await restaurantApi.getAll()
      // Owner'a ait restoranları filtrele
      const ownerRestaurants = data.filter((r: Restaurant) => r.ownerId === user.id)
      setRestaurants(ownerRestaurants)
      
      // Eğer seçili restoran yoksa ve restoranlar varsa, ilkini seç
      if (!selectedRestaurant && ownerRestaurants.length > 0) {
        setSelectedRestaurant(ownerRestaurants[0])
        localStorage.setItem("selectedRestaurantId", ownerRestaurants[0].id)
      }
      
      // Local storage'dan seçili restoranı yükle
      const savedRestaurantId = localStorage.getItem("selectedRestaurantId")
      if (savedRestaurantId) {
        const restaurant = ownerRestaurants.find((r: Restaurant) => r.id === savedRestaurantId)
        if (restaurant) {
          setSelectedRestaurant(restaurant)
        }
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchRestaurants()
    }
  }, [user])

  const selectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    localStorage.setItem("selectedRestaurantId", restaurant.id)
  }

  const refreshRestaurants = async () => {
    await fetchRestaurants()
  }

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        selectedRestaurant,
        selectRestaurant,
        loading,
        refreshRestaurants,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  )
}

export function useRestaurant() {
  const context = useContext(RestaurantContext)
  if (context === undefined) {
    throw new Error("useRestaurant must be used within a RestaurantProvider")
  }
  return context
}

