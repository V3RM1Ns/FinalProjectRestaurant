'use client'

import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import dynamic from 'next/dynamic'

interface RestaurantLocationMapProps {
  latitude: number
  longitude: number
  restaurantName: string
  address: string
}

// Dynamically import the map component with no SSR
const MapComponent = dynamic(
  () => import('./MapComponent'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-pulse" />
          <p className="text-sm text-muted-foreground">Harita yükleniyor...</p>
        </div>
      </div>
    )
  }
)

export function RestaurantLocationMap({ latitude, longitude, restaurantName, address }: RestaurantLocationMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-pulse" />
          <p className="text-sm text-muted-foreground">Harita yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <MapComponent 
      latitude={latitude}
      longitude={longitude}
      restaurantName={restaurantName}
      address={address}
    />
  )
}
