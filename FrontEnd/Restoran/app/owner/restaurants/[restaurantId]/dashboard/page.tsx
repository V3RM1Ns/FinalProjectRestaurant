'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Utensils,
  Calendar,
  Star,
  FileText,
  ChefHat,
  Briefcase,
} from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface TopSellingItem {
  menuItemId: string
  menuItemName: string
  category: string
  quantitySold: number
  totalRevenue: number
  price: number
}

interface RecentOrder {
  orderId: string
  customerName: string
  totalAmount: number
  status: string
  orderType: string
  orderDate: string
}

interface DashboardData {
  restaurantId: string
  restaurantName: string
  totalRevenue: number
  todayRevenue: number
  totalOrders: number
  todayOrders: number
  activeReservations: number
  menuItemCount: number
  employeeCount: number
  pendingApplicationsCount: number
  pendingReviewsCount: number
  averageRating: number
  topSellingItems: TopSellingItem[]
  recentOrders: RecentOrder[]
}

export default function RestaurantDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [params.restaurantId])

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const url = `${API_BASE_URL}/api/Owner/restaurants/${params.restaurantId}/dashboard`
      console.log('Fetching dashboard from:', url)
      console.log('Token:', token ? 'exists' : 'missing')
      
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Dashboard data:', data)
        setDashboard(data)
      } else if (response.status === 401) {
        console.error('Unauthorized - redirecting to login')
        router.push('/login')
      } else {
        const errorText = await response.text()
        console.error('Error response:', errorText)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Loading dashboard...</div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Failed to load dashboard data</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{dashboard.restaurantName}</h1>
        <p className="text-muted-foreground">Restaurant Dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboard.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Today: ${dashboard.todayRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Today: {dashboard.todayOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.activeReservations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/owner/restaurants/${params.restaurantId}/menu`)}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Menu Items</span>
              <Utensils className="h-6 w-6" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{dashboard.menuItemCount}</div>
            <Button variant="outline" className="w-full">Manage Menu</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/owner/restaurants/${params.restaurantId}/employees`)}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Employees</span>
              <ChefHat className="h-6 w-6" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{dashboard.employeeCount}</div>
            <Button variant="outline" className="w-full">View Staff</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/owner/restaurants/${params.restaurantId}/job-applications`)}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Applications</span>
              <Briefcase className="h-6 w-6" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{dashboard.pendingApplicationsCount}</div>
            <Button variant="outline" className="w-full">Review Applications</Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Items */}
      {dashboard.topSellingItems && dashboard.topSellingItems.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.topSellingItems.map((item) => (
                <div key={item.menuItemId} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{item.menuItemName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantitySold} sold • ${item.totalRevenue.toFixed(2)} revenue • ${item.price.toFixed(2)} each
                    </p>
                  </div>
                  <Badge>{item.category}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      {dashboard.recentOrders && dashboard.recentOrders.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.recentOrders.map((order) => (
                <div key={order.orderId} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      ${order.totalAmount.toFixed(2)} • {order.orderType}
                    </p>
                  </div>
                  <Badge variant={
                    order.status === 'Completed' ? 'default' : 
                    order.status === 'Pending' ? 'secondary' : 
                    'outline'
                  }>
                    {order.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Button
          variant="outline"
          onClick={() => router.push(`/owner/restaurants/${params.restaurantId}/statistics`)}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Statistics
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/owner/orders?restaurant=${params.restaurantId}`)}
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Orders
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/owner/reservations?restaurant=${params.restaurantId}`)}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Reservations
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/owner/restaurants/${params.restaurantId}/reports`)}
        >
          <FileText className="w-4 h-4 mr-2" />
          Reports
        </Button>
      </div>
    </div>
  )
}
