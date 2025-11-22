"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Store, Briefcase, FileText, LayoutDashboard } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

interface DashboardStats {
    totalUsers: number
    totalRestaurants: number
    totalRestaurantOwners: number
    totalEmployees: number
    totalPendingApplications: number
}

export default function AdminDashboardPage() {
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        fetchDashboardStats()
    }, [])

    const fetchDashboardStats = async () => {
        try {
            setLoading(true)
            const response = await api.get<DashboardStats>("/Admin/dashboard")
            setStats(response)
        } catch (error) {
            console.error("Dashboard fetch error:", error)
            toast({
                title: "Error",
                description: "Failed to load dashboard data",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <LayoutDashboard className="w-8 h-8" />
                    Admin Dashboard
                </h1>
                <p className="text-muted-foreground">System overview and management</p>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Restoranlar</CardTitle>
                            <Store className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalRestaurants}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sahipler</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalRestaurantOwners}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Çalışanlar</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-200 bg-orange-50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Bekleyen Başvurular</CardTitle>
                            <FileText className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.totalPendingApplications}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/users')}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Kullanıcı Yönetimi</CardTitle>
                            <Users className="w-8 h-8 text-primary" />
                        </div>
                        <CardDescription>Tüm kullanıcıları görüntüleyin ve yönetin</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full">
                            Kullanıcıları Yönet
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/restaurants')}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Restoran Yönetimi</CardTitle>
                            <Store className="w-8 h-8 text-primary" />
                        </div>
                        <CardDescription>Tüm restoranları görüntüleyin ve yönetin</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full">
                            Restoranları Yönet
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/applications')}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Başvurular</CardTitle>
                            <FileText className="w-8 h-8 text-primary" />
                        </div>
                        <CardDescription>Sahiplik başvurularını gözden geçirin</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-muted-foreground">Bekleyen</span>
                            <Badge variant="destructive">{stats?.totalPendingApplications || 0}</Badge>
                        </div>
                        <Button variant="outline" className="w-full" onClick={(e) => {
                            e.stopPropagation()
                            router.push('/admin/applications')
                        }}>
                            Başvuruları Gözden Geçir
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/restaurant-applications')}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Restoran Başvuruları</CardTitle>
                            <Store className="w-8 h-8 text-orange-600" />
                        </div>
                        <CardDescription>Yeni restoran başvurularını inceleyin ve onaylayın</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full" onClick={(e) => {
                            e.stopPropagation()
                            router.push('/admin/restaurant-applications')
                        }}>
                            Restoran Başvurularını Gör
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/restaurants-map')}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Restoran Haritası</CardTitle>
                            <LayoutDashboard className="w-8 h-8 text-blue-600" />
                        </div>
                        <CardDescription>Tüm restoranları harita üzerinde görüntüleyin</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full" onClick={(e) => {
                            e.stopPropagation()
                            router.push('/admin/restaurants-map')
                        }}>
                            Haritayı Görüntüle
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/reviews')}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Yorumlar</CardTitle>
                            <FileText className="w-8 h-8 text-primary" />
                        </div>
                        <CardDescription>Kullanıcı yorumlarını ve puanlarını yönetin</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full">
                            Yorumları Yönet
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
