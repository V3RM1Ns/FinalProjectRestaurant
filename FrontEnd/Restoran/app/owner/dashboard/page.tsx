"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Calendar, Users, UtensilsCrossed, Briefcase } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface OwnerDashboard {
  restaurantId: string
  totalRevenue: number
  todayRevenue: number
  totalOrders: number
  todayOrders: number
  activeReservations: number
  menuItemCount: number
  employeeCount: number
  topSellingItems: Array<{
    menuItemId: string
    menuItemName: string
    quantitySold: number
  }>
}

const mockDashboard: OwnerDashboard = {
  restaurantId: "1",
  totalRevenue: 125000,
  todayRevenue: 4500,
  totalOrders: 850,
  todayOrders: 23,
  activeReservations: 12,
  menuItemCount: 45,
  employeeCount: 8,
  topSellingItems: [
    { menuItemId: "1", menuItemName: "İskender Kebap", quantitySold: 156 },
    { menuItemId: "2", menuItemName: "Adana Kebap", quantitySold: 134 },
    { menuItemId: "3", menuItemName: "Kuzu Tandır", quantitySold: 98 },
    { menuItemId: "5", menuItemName: "Karışık Meze", quantitySold: 87 },
    { menuItemId: "4", menuItemName: "Mercimek Çorbası", quantitySold: 76 },
  ],
}

export default function OwnerDashboardPage() {
  const [dashboard, setDashboard] = useState<OwnerDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setDashboard(mockDashboard)
      setLoading(false)
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!dashboard) return null

  const stats = [
    {
      title: "Toplam Gelir",
      value: `₺${dashboard.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "Tüm zamanlar",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Bugünkü Gelir",
      value: `₺${dashboard.todayRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "Bugün",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Toplam Sipariş",
      value: dashboard.totalOrders.toString(),
      icon: ShoppingCart,
      description: "Tüm zamanlar",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Bugünkü Sipariş",
      value: dashboard.todayOrders.toString(),
      icon: ShoppingCart,
      description: "Bugün",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Aktif Rezervasyon",
      value: dashboard.activeReservations.toString(),
      icon: Calendar,
      description: "Bekleyen",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      title: "Menü Öğeleri",
      value: dashboard.menuItemCount.toString(),
      icon: UtensilsCrossed,
      description: "Toplam ürün",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Çalışan Sayısı",
      value: dashboard.employeeCount.toString(),
      icon: Briefcase,
      description: "Aktif çalışan",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Ortalama Sipariş",
      value: `₺${Math.round(dashboard.totalRevenue / dashboard.totalOrders)}`,
      icon: Users,
      description: "Sipariş başına",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
  ]

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Restoranınızın genel durumu</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Top Selling Items */}
      <Card>
        <CardHeader>
          <CardTitle>En Çok Satan Ürünler</CardTitle>
          <CardDescription>Toplam satış miktarına göre sıralanmış</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboard.topSellingItems}>
              <XAxis dataKey="menuItemName" angle={-45} textAnchor="end" height={100} fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantitySold" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
