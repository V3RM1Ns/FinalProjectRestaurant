'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingCart, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface Statistics {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  averageOrderValue: number
  completedOrders: number
  pendingOrders: number
  averageDeliveryTime: number
}

interface TopItem {
  menuItemId: string
  menuItemName: string
  quantitySold: number
  totalRevenue: number
}

export default function OwnerStatisticsPage() {
  const params = useParams()
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [topItems, setTopItems] = useState<TopItem[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [params.restaurantId])

  const fetchStatistics = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/Owner/restaurants/${params.restaurantId}`

      // Fetch statistics
      const statsResponse = await fetch(`${baseUrl}/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (statsResponse.ok) {
        const data = await statsResponse.json()
        setStatistics(data)
      }

      // Fetch top selling items
      const topItemsResponse = await fetch(`${baseUrl}/top-selling-items?count=10`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (topItemsResponse.ok) {
        const data = await topItemsResponse.json()
        setTopItems(data)
      }

      // Fetch revenue chart data
      const revenueResponse = await fetch(`${baseUrl}/revenue-chart?days=30`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (revenueResponse.ok) {
        const data = await revenueResponse.json()
        setRevenueData(data)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Loading statistics...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Statistics & Analytics</h1>
        <p className="text-muted-foreground">Detailed performance metrics for your restaurant</p>
      </div>

      {statistics && (
        <>
          {/* Key Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${statistics.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">All time revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {statistics.completedOrders} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">Unique customers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${statistics.averageOrderValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Per order</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.completedOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {statistics.totalOrders > 0
                    ? `${((statistics.completedOrders / statistics.totalOrders) * 100).toFixed(1)}% completion rate`
                    : 'No orders yet'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">Awaiting processing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.averageDeliveryTime} min</div>
                <p className="text-xs text-muted-foreground">Average time</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Revenue Chart */}
      {revenueData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue ($)" strokeWidth={2} />
                <Line type="monotone" dataKey="orderCount" stroke="#82ca9d" name="Orders" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Selling Items */}
      {topItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topItems}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="menuItemName" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantitySold" fill="#8884d8" name="Quantity Sold" />
                <Bar dataKey="totalRevenue" fill="#82ca9d" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

