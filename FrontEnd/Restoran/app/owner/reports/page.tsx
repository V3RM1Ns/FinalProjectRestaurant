"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { useRestaurant } from "@/contexts/restaurant-context"
import { ownerApi, SalesReportDto, RevenueChartDto, CategorySalesDto } from "@/lib/owner-api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, TrendingUp, DollarSign, ShoppingBag, BarChart3 } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default function OwnerReportsPage() {
  const { selectedRestaurant } = useRestaurant()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [reportType, setReportType] = useState<"sales" | "revenue" | "category">("sales")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  
  const [salesReport, setSalesReport] = useState<SalesReportDto | null>(null)
  const [revenueChart, setRevenueChart] = useState<RevenueChartDto | null>(null)
  const [categorySales, setCategorySales] = useState<CategorySalesDto[]>([])

  useEffect(() => {
    if (selectedRestaurant) {
      loadReports()
    }
  }, [selectedRestaurant, reportType, dateRange])

  const loadReports = async () => {
    if (!selectedRestaurant) return
    
    setLoading(true)
    try {
      const startDate = dateRange.from.toISOString()
      const endDate = dateRange.to.toISOString()

      if (reportType === "sales") {
        const data = await ownerApi.reports.getSalesReport(
          selectedRestaurant.id,
          startDate,
          endDate
        )
        setSalesReport(data)
      } else if (reportType === "revenue") {
        const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
        const data = await ownerApi.dashboard.getRevenueChart(selectedRestaurant.id, days)
        setRevenueChart(data)
      } else if (reportType === "category") {
        const data = await ownerApi.reports.getCategorySales(
          selectedRestaurant.id,
          startDate,
          endDate
        )
        setCategorySales(data)
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Raporlar yüklenirken hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    toast({
      title: "Rapor İndiriliyor",
      description: "Rapor Excel formatında indiriliyor...",
    })
    // Export logic would go here
  }

  if (!selectedRestaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Restoran Seçin</CardTitle>
            <CardDescription>
              Devam etmek için lütfen bir restoran seçin
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Raporlar ve İstatistikler</h1>
          <p className="text-muted-foreground">{selectedRestaurant.name}</p>
        </div>
        <Button onClick={handleExportReport}>
          <Download className="h-4 w-4 mr-2" />
          Rapor İndir
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
          <CardDescription>Rapor türü ve tarih aralığı seçin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Rapor Türü</label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Satış Raporu</SelectItem>
                  <SelectItem value="revenue">Gelir Grafiği</SelectItem>
                  <SelectItem value="category">Kategori Satışları</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Başlangıç Tarihi</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, "PPP", { locale: tr }) : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Bitiş Tarihi</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, "PPP", { locale: tr }) : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : (
        <>
          {/* Sales Report */}
          {reportType === "sales" && salesReport && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₺{salesReport.totalRevenue.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Sipariş</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{salesReport.totalOrders}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ortalama Sipariş</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₺{salesReport.averageOrderValue.toFixed(2)}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>En Çok Satan Ürünler</CardTitle>
                  <CardDescription>Seçilen tarih aralığındaki en popüler ürünler</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ürün Adı</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Satış Adedi</TableHead>
                        <TableHead>Toplam Gelir</TableHead>
                        <TableHead>Birim Fiyat</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesReport.topProducts.map((product) => (
                        <TableRow key={product.menuItemId}>
                          <TableCell className="font-medium">{product.menuItemName}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.quantitySold}</TableCell>
                          <TableCell>₺{product.totalRevenue.toFixed(2)}</TableCell>
                          <TableCell>₺{product.price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Günlük Satışlar</CardTitle>
                  <CardDescription>Tarih bazında gelir dağılımı</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Sipariş Sayısı</TableHead>
                        <TableHead>Gelir</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesReport.dailySales.map((daily) => (
                        <TableRow key={daily.date}>
                          <TableCell>{format(new Date(daily.date), "PPP", { locale: tr })}</TableCell>
                          <TableCell>{daily.orderCount}</TableCell>
                          <TableCell className="font-medium">₺{daily.revenue.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}

          {/* Revenue Chart */}
          {reportType === "revenue" && revenueChart && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₺{revenueChart.totalRevenue.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Günlük Ortalama</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₺{revenueChart.averageDailyRevenue.toFixed(2)}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Günlük Gelir Grafiği</CardTitle>
                  <CardDescription>Tarih bazında gelir analizi</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Sipariş Sayısı</TableHead>
                        <TableHead>Gelir</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueChart.dailyRevenue.map((daily) => (
                        <TableRow key={daily.date}>
                          <TableCell>{format(new Date(daily.date), "PPP", { locale: tr })}</TableCell>
                          <TableCell>{daily.orderCount}</TableCell>
                          <TableCell className="font-medium">₺{daily.revenue.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}

          {/* Category Sales */}
          {reportType === "category" && categorySales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Kategori Satışları</CardTitle>
                <CardDescription>Ürün kategorilerine göre satış dağılımı</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Satılan Ürün</TableHead>
                      <TableHead>Gelir</TableHead>
                      <TableHead>Yüzde</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categorySales.map((category) => (
                      <TableRow key={category.category}>
                        <TableCell className="font-medium">{category.category}</TableCell>
                        <TableCell>{category.itemsSold}</TableCell>
                        <TableCell>₺{category.revenue.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-primary h-full"
                                style={{ width: `${category.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {category.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

