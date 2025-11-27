"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, ShoppingCart, DollarSign, Briefcase, Table, UtensilsCrossed, Star, TrendingUp } from 'lucide-react'
import { OwnerApi } from '@/lib/owner-api'
import { useAuth } from '@/contexts/auth-context'
import { UserRole } from '@/types'

interface Statistics {
  totalCustomers: number
  totalOrders: number
  totalRevenue: number
  totalEmployees: number
  totalTables: number
  availableTables: number
  totalMenuItems: number
  averageOrderValue: number
  averageRating: number
  totalReviews: number
}

export default function StatisticsPage() {
  const params = useParams()
  const router = useRouter()
  const { hasRole } = useAuth()
  const restaurantId = params.restaurantId as string
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hasRole(UserRole.Owner)) {
      router.push('/unauthorized')
      return
    }
    fetchStatistics()
  }, [restaurantId, hasRole])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const data = await OwnerApi.getStatistics(restaurantId)
      setStatistics(data)
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!statistics) {
    return (
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push(`/owner/dashboard`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Failed to load statistics</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Customers',
      value: statistics.totalCustomers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Orders',
      value: statistics.totalOrders,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Revenue',
      value: `₺${statistics.totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Average Order Value',
      value: `₺${statistics.averageOrderValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Employees',
      value: statistics.totalEmployees,
      icon: Briefcase,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Total Tables',
      value: statistics.totalTables,
      icon: Table,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Available Tables',
      value: statistics.availableTables,
      icon: Table,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
    },
    {
      title: 'Total Menu Items',
      value: statistics.totalMenuItems,
      icon: UtensilsCrossed,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
    {
      title: 'Average Rating',
      value: statistics.averageRating.toFixed(2),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Total Reviews',
      value: statistics.totalReviews,
      icon: Star,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
  ]

  return (
    <div className="container mx-auto p-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push(`/owner/dashboard`)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Restaurant Statistics</h1>
        <p className="text-muted-foreground">Overview of your restaurant's performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
