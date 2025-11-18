'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, MapPin, User, Store, StoreIcon, Loader2, Tag } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export default function AdminRestaurantsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [restaurants, setRestaurants] = useState<PaginatedResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [toggleLoading, setToggleLoading] = useState<string | null>(null)
  
  // Category management states
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [availableCategories, setAvailableCategories] = useState<Array<{ id: number; name: string }>>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [categoryLoading, setCategoryLoading] = useState(false)

  useEffect(() => {
    fetchRestaurants(currentPage)
    fetchAvailableCategories()
  }, [currentPage, pageSize])

  const fetchRestaurants = async (page: number) => {
    setLoading(true)
    try {
      const data = await adminApi.getRestaurants(page, pageSize)
      setRestaurants(data)
    } catch (error: any) {
      console.error('Error fetching restaurants:', error)
      toast({
        title: 'Hata',
        description: error.message || 'Restoranlar yüklenirken bir hata oluştu',
        variant: 'destructive',
      })
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableCategories = async () => {
    try {
      const data = await adminApi.getAllRestaurantCategories()
      // Backend'den "1:Turkish" formatında geliyor
      const categories = data.categories.map((cat: string) => {
        const [id, name] = cat.split(':')
        return { id: parseInt(id), name }
      })
      setAvailableCategories(categories)
    } catch (error: any) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleToggleRestaurantStatus = async (restaurantId: string, currentStatus: boolean) => {
    setToggleLoading(restaurantId)
    try {
      await adminApi.toggleRestaurantStatus(restaurantId)

      toast({
        title: 'Başarılı',
        description: `Restoran ${currentStatus ? 'deaktif edildi' : 'aktif edildi'}`,
      })

      await fetchRestaurants(currentPage)
    } catch (error: any) {
      console.error('Error toggling restaurant status:', error)
      toast({
        title: 'Hata',
        description: error.message || 'Restoran durumu güncellenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setToggleLoading(null)
    }
  }

  const handleOpenCategoryDialog = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    setSelectedCategory('')
    setShowCategoryDialog(true)
  }

  const handleUpdateCategory = async () => {
    if (!selectedRestaurant || !selectedCategory) return

    setCategoryLoading(true)
    try {
      await adminApi.updateRestaurantCategory(selectedRestaurant.id, parseInt(selectedCategory))
      toast({
        title: 'Başarılı',
        description: 'Restoran kategorisi başarıyla güncellendi',
      })
      setShowCategoryDialog(false)
      setSelectedCategory('')
      setSelectedRestaurant(null)
      await fetchRestaurants(currentPage)
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Kategori güncellenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setCategoryLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (restaurants?.totalPages || 1)) {
      setCurrentPage(newPage)
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    if (!category) return 'bg-gray-100 text-gray-800 border-gray-200'
    
    const lowerCategory = category.toLowerCase()
    if (lowerCategory.includes('turkish')) return 'bg-red-100 text-red-800 border-red-200'
    if (lowerCategory.includes('italian')) return 'bg-green-100 text-green-800 border-green-200'
    if (lowerCategory.includes('japanese')) return 'bg-pink-100 text-pink-800 border-pink-200'
    if (lowerCategory.includes('chinese')) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (lowerCategory.includes('mexican')) return 'bg-orange-100 text-orange-800 border-orange-200'
    if (lowerCategory.includes('fast')) return 'bg-blue-100 text-blue-800 border-blue-200'
    return 'bg-purple-100 text-purple-800 border-purple-200'
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Restoran Yönetimi</h1>
        <p className="text-muted-foreground mt-2">Sistemdeki tüm restoranları yönetin</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tüm Restoranlar ({restaurants?.totalCount || 0})</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Göster:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Restoranlar yükleniyor...</p>
            </div>
          ) : restaurants && restaurants.items.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Restoran Adı</TableHead>
                      <TableHead>Adres</TableHead>
                      <TableHead className="w-[150px]">Kategori</TableHead>
                      <TableHead className="w-[180px]">Sahip</TableHead>
                      <TableHead className="w-[100px]">Durum</TableHead>
                      <TableHead className="w-[200px] text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {restaurants.items.map((restaurant) => (
                      <TableRow key={restaurant.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-muted-foreground" />
                            {restaurant.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {restaurant.address}
                          </div>
                        </TableCell>
                        <TableCell>
                          {restaurant.category ? (
                            <Badge variant="outline" className={getCategoryBadgeColor(restaurant.category)}>
                              {restaurant.category}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">Belirtilmemiş</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-muted-foreground" />
                            <div className="text-sm">
                              <p className="font-medium">{restaurant.ownerName}</p>
                              <p className="text-muted-foreground text-xs">{restaurant.ownerEmail}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {restaurant.isActive ? (
                            <Badge variant="default" className="bg-green-600">Aktif</Badge>
                          ) : (
                            <Badge variant="destructive">Pasif</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenCategoryDialog(restaurant)}
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              Kategori
                            </Button>
                            <Button
                              size="sm"
                              variant={restaurant.isActive ? "destructive" : "default"}
                              onClick={() => handleToggleRestaurantStatus(restaurant.id, restaurant.isActive)}
                              disabled={toggleLoading === restaurant.id}
                            >
                              {toggleLoading === restaurant.id ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  İşleniyor...
                                </>
                              ) : restaurant.isActive ? (
                                'Deaktif Et'
                              ) : (
                                'Aktif Et'
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  {((restaurants.pageNumber - 1) * restaurants.pageSize) + 1} - {Math.min(restaurants.pageNumber * restaurants.pageSize, restaurants.totalCount)} arası gösteriliyor (Toplam: {restaurants.totalCount})
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!restaurants.hasPreviousPage}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Önceki
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, restaurants.totalPages) }, (_, i) => {
                      let pageNum
                      if (restaurants.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= restaurants.totalPages - 2) {
                        pageNum = restaurants.totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={currentPage === pageNum ? "default" : "outline"}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!restaurants.hasNextPage}
                  >
                    Sonraki
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <StoreIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Restoran bulunamadı</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Management Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kategori Güncelle</DialogTitle>
            <DialogDescription>
              {selectedRestaurant?.name} restoranının kategorisini güncelleyin
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedRestaurant?.category && (
              <div>
                <h4 className="text-sm font-medium mb-2">Mevcut Kategori</h4>
                <Badge variant="outline" className={getCategoryBadgeColor(selectedRestaurant.category)}>
                  {selectedRestaurant.category}
                </Badge>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium mb-3">Yeni Kategori Seç</h4>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              İptal
            </Button>
            <Button
              onClick={handleUpdateCategory}
              disabled={!selectedCategory || categoryLoading}
            >
              {categoryLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                'Güncelle'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
