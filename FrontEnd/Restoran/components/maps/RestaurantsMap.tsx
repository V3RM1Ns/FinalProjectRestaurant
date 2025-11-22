'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Icon } from 'leaflet'
import { useEffect, useState } from 'react'
import { Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Restaurant {
  id: string
  name: string
  address: string
  description: string
  category?: string
  latitude?: number
  longitude?: number
  imageUrl?: string
  rate: number
}

interface RestaurantsMapProps {
  restaurants: Restaurant[]
  center?: { lat: number; lng: number }
  zoom?: number
}

// Custom marker icon
const customIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

export function RestaurantsMap({ restaurants, center, zoom = 12 }: RestaurantsMapProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  // Default center (Istanbul)
  const defaultCenter = center || { lat: 41.0082, lng: 28.9784 }
  
  // Filter restaurants with valid coordinates
  const restaurantsWithCoordinates = restaurants.filter(
    r => r.latitude != null && r.longitude != null
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg p-8">
        <div className="text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-muted-foreground">Harita yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (restaurantsWithCoordinates.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg p-8">
        <div className="text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Konum Bilgisi Bulunamadı</h3>
          <p className="text-muted-foreground">
            Haritada gösterilecek konum bilgisi olan restoran bulunmamaktadır.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden">
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {restaurantsWithCoordinates.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.latitude!, restaurant.longitude!]}
            icon={customIcon}
          >
            <Popup maxWidth={300}>
              <div className="p-2">
                {restaurant.imageUrl && (
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                )}
                <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>
                {restaurant.category && (
                  <p className="text-sm text-gray-600 mb-1">{restaurant.category}</p>
                )}
                <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                  {restaurant.description}
                </p>
                <p className="text-xs text-gray-500 mb-3">{restaurant.address}</p>
                <p className="text-sm font-semibold text-orange-600 mb-2">
                  ⭐ {restaurant.rate.toFixed(1)}
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => router.push(`/restaurants/${restaurant.id}`)}
                >
                  Detayları Gör
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
