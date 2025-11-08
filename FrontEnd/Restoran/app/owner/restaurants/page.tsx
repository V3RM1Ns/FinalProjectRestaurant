'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Store, Users, Calendar, TrendingUp } from 'lucide-react'

interface Restaurant {
  id: string
  name: string
  address: string
  phone: string
  category: string
  description: string
  isActive: boolean
  createdAt: string
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
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Owner/restaurants`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setRestaurants(data)
      } else if (response.status === 401) {
        router.push('/login')
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
                  <Badge variant={restaurant.isActive ? 'default' : 'secondary'}>
                    {restaurant.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Badge variant="outline">{restaurant.category}</Badge>
                  </div>
                  <div className="text-muted-foreground">{restaurant.address}</div>
                  <div className="text-muted-foreground">{restaurant.phone}</div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Created {new Date(restaurant.createdAt).toLocaleDateString()}
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

