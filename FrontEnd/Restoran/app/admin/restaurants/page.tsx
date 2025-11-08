'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, MapPin, User, Store, StoreIcon } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface Restaurant {
  id: string
  name: string
  address: string
  phoneNumber: string
  category: string
  ownerName: string
  ownerEmail: string
  isActive: boolean
  createdAt: string
}

interface PaginatedResult {
  items: Restaurant[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export default function AdminRestaurantsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [restaurants, setRestaurants] = useState<PaginatedResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [toggleLoading, setToggleLoading] = useState<string | null>(null)
  const pageSize = 10

  useEffect(() => {
    fetchRestaurants(currentPage)
  }, [currentPage])

  const fetchRestaurants = async (page: number) => {
    setLoading(true)
    try {
      const data = await api.get<PaginatedResult>(`/admin/restaurants?pageNumber=${page}&pageSize=${pageSize}`)
      console.log('Restaurants data:', data)
      setRestaurants(data)
    } catch (error: any) {
      console.error('Error fetching restaurants:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load restaurants',
        variant: 'destructive',
      })
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRestaurantStatus = async (restaurantId: string, currentStatus: boolean) => {
    setToggleLoading(restaurantId)
    try {
      await api.post(`/admin/restaurants/${restaurantId}/toggle-status`, {})

      toast({
        title: 'Success',
        description: `Restaurant ${currentStatus ? 'deactivated' : 'activated'} successfully`,
      })

      // Sayfayı yenile
      await fetchRestaurants(currentPage)
    } catch (error: any) {
      console.error('Error toggling restaurant status:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update restaurant status',
        variant: 'destructive',
      })
    } finally {
      setToggleLoading(null)
    }
  }

  const totalPages = restaurants ? Math.ceil(restaurants.totalCount / pageSize) : 0

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Restaurant Management</h1>
        <p className="text-muted-foreground">Manage all restaurants in the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Restaurants ({restaurants?.totalCount || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : restaurants && restaurants.items.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurant Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restaurants.items.map((restaurant) => (
                    <TableRow key={restaurant.id}>
                      <TableCell>
                        <div className="font-medium">{restaurant.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {restaurant.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{restaurant.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {restaurant.ownerName}
                        </div>
                        <div className="text-sm text-muted-foreground">{restaurant.ownerEmail}</div>
                      </TableCell>
                      <TableCell>{restaurant.phoneNumber}</TableCell>
                      <TableCell>
                        {restaurant.isActive ? (
                          <Badge variant="default" className="gap-1">
                            <Store className="w-3 h-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <StoreIcon className="w-3 h-3" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(restaurant.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={restaurant.isActive ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => handleToggleRestaurantStatus(restaurant.id, restaurant.isActive)}
                          disabled={toggleLoading === restaurant.id}
                        >
                          {toggleLoading === restaurant.id ? (
                            'Loading...'
                          ) : restaurant.isActive ? (
                            <>
                              <StoreIcon className="w-4 h-4 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Store className="w-4 h-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No restaurants found</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
