'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Store, Users, Calendar, TrendingUp } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Restaurant {
  id: string
  name: string
  address: string
  phoneNumber: string
  email?: string
  website?: string
  description: string
  ownerId: string
  ownerName: string
  rate: number
  isDeleted: boolean
  createdAt: string
  updatedAt?: string
}

export default function OwnerRestaurantsPage() {
  const router = useRouter()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token') // Doğru key: 'auth_token'
      console.log('API_BASE_URL:', API_BASE_URL)
      console.log('Token:', token ? 'exists' : 'missing')
      console.log('Full URL:', `${API_BASE_URL}/api/Owner/restaurants`)
      
      const response = await fetch(
        `${API_BASE_URL}/api/Owner/restaurants`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log('Restaurants data:', data)
        setRestaurants(data)
      } else if (response.status === 401) {
        console.error('Unauthorized - redirecting to login')
        router.push('/login')
      } else {
        console.error('Error response:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Loading your restaurants...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Restaurants</h1>
          <p className="text-muted-foreground">Manage your restaurant portfolio</p>
        </div>
        <Button onClick={() => router.push('/owner/restaurants/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Restaurant
        </Button>
      </div>

      {restaurants.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <Card
              key={restaurant.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/owner/restaurants/${restaurant.id}/dashboard`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Store className="w-5 h-5" />
                      {restaurant.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {restaurant.description}
                    </CardDescription>
                  </div>
                  <Badge variant={restaurant.isDeleted ? 'secondary' : 'default'}>
                    {restaurant.isDeleted ? 'Inactive' : 'Active'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="text-muted-foreground">{restaurant.address}</div>
                  <div className="text-muted-foreground">{restaurant.phoneNumber}</div>
                  {restaurant.email && (
                    <div className="text-muted-foreground">{restaurant.email}</div>
                  )}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Created {new Date(restaurant.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Badge variant="outline">Rating: {restaurant.rate.toFixed(1)}</Badge>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/owner/restaurants/${restaurant.id}/dashboard`)
                    }}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/owner/restaurants/${restaurant.id}/employees`)
                    }}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Staff
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Store className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No restaurants yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first restaurant
            </p>
            <Button onClick={() => router.push('/owner/restaurants/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Restaurant
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
