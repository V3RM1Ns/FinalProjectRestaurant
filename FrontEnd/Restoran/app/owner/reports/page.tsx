"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { OwnerApi } from "@/lib/owner-api"
import { UserRole } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Download } from "lucide-react"
import Link from "next/link"

export default function OwnerReportsPage() {
  const { hasRole } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const restaurantId = searchParams.get("restaurant")

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [salesReport, setSalesReport] = useState<any>(null)
  const [categorySales, setCategorySales] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!hasRole(UserRole.Owner)) {
      router.push("/unauthorized")
      return
    }

    // Set default dates (last 30 days)
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)

    setEndDate(end.toISOString().split("T")[0])
    setStartDate(start.toISOString().split("T")[0])
  }, [hasRole, router])

  const loadReports = async () => {
    if (!restaurantId || !startDate || !endDate) return

    try {
      setIsLoading(true)
      const [salesData, categoryData] = await Promise.all([
        OwnerApi.getSalesReport(restaurantId, startDate, endDate),
        OwnerApi.getCategorySales(restaurantId, startDate, endDate),
      ])

      setSalesReport(salesData)
      setCategorySales(categoryData || [])
    } catch (error) {
      console.error("Error loading reports:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!restaurantId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Restoran Seçilmedi</CardTitle>
            <CardDescription>Lütfen bir restoran seçin.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <FileText className="mr-2" />
            Raporlar
          </h1>
          <p className="text-muted-foreground">Satış raporlarını ve analizleri görüntüleyin</p>
        </div>
        <Link href="/owner/dashboard">
          <Button variant="outline">Dashboard'a Dön</Button>
        </Link>
      </div>

      {/* Date Range Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Rapor Dönemi</CardTitle>
          <CardDescription>Rapor için tarih aralığı seçin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="startDate">Başlangıç Tarihi</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate">Bitiş Tarihi</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={loadReports} disabled={isLoading}>
              {isLoading ? "Yükleniyor..." : "Rapor Oluştur"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales Summary */}
      {salesReport && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Toplam Gelir</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₺{salesReport.totalRevenue?.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Toplam Sipariş</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{salesReport.totalOrders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ortalama Sipariş</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₺{salesReport.averageOrderValue?.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Category Sales */}
          {categorySales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Kategori Bazlı Satışlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categorySales.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{category.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {category.itemsSold} adet satıldı
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₺{category.revenue?.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          %{category.percentage?.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Products */}
          {salesReport.topProducts && salesReport.topProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>En Çok Satan Ürünler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salesReport.topProducts.slice(0, 10).map((product: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="font-semibold text-lg text-muted-foreground">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.menuItemName}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.quantitySold} adet
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₺{product.totalRevenue?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Button */}
          <div className="flex justify-end">
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Raporu İndir (PDF)
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

