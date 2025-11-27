'use client'

import { useEffect, useState } from 'react'
import { customerApi } from '@/lib/customer-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Calendar, Star, Heart, TrendingUp, Award, MessageSquare, Edit, Trash2, Loader2, ChevronLeftIcon, ChevronRightIcon, Package, Clock, Gift, Ticket } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from '@/components/ui/pagination'

interface Statistics {
  totalOrders: number
  totalReservations: number
  totalSpent: number
  favoriteRestaurantsCount: number
}

interface Restaurant {
  id: string
  name: string
  cuisine: string
  location: string
  averageRating: number
}

interface Order {
  id: string
  restaurantName?: string
  orderNumber?: string
  status: string
  totalAmount: number
  createdAt: string
  orderDate?: string
  restaurantId?: string
  deliveryPersonId?: string
  deliveryPersonName?: string
  deliveryAddress?: string
  type?: string
}

interface Reservation {
  id: string
  restaurantName: string
  reservationDate: string
  partySize: number
  status: string
}

interface Review {
  id: string
  restaurantId: string
  restaurantName: string
  customerId: string
  customerName: string
  rating: number
  comment: string
  status: string
  ownerResponse?: string
  respondedAt?: string
  createdAt: string
}

interface LoyaltyBalance {
  customerId: string
  restaurantId: string
  restaurantName: string
  totalPoints: number
  availablePoints: number
  redeemedPoints: number
  recentTransactions: LoyaltyTransaction[]
}

interface LoyaltyTransaction {
  id: string
  customerId: string
  restaurantId: string
  restaurantName: string
  points: number
  description: string
  type: string
  earnedAt: string
  expiryDate?: string
  isRedeemed: boolean
}

export default function CustomerDashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState<Statistics | null>(null)
  const [recommendations, setRecommendations] = useState<Restaurant[]>([])
  const [activeOrders, setActiveOrders] = useState<Order[]>([])
  const [orderHistory, setOrderHistory] = useState<Order[]>([])
  const [currentOrders, setCurrentOrders] = useState<Order[]>([])
  const [allReservations, setAllReservations] = useState<Reservation[]>([])
  const [upcomingReservations, setUpcomingReservations] = useState<Reservation[]>([])
  const [myReviews, setMyReviews] = useState<Review[]>([])
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [editRating, setEditRating] = useState(0)
  const [editComment, setEditComment] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Pagination states for reviews
  const [reviewsPage, setReviewsPage] = useState(1)
  const [reviewsPageSize] = useState(5)
  const [totalReviewsCount, setTotalReviewsCount] = useState(0)
  const [reviewsLoading, setReviewsLoading] = useState(false)

  // Loyalty states
  const [loyaltyBalances, setLoyaltyBalances] = useState<LoyaltyBalance[]>([])
  const [loyaltyLoading, setLoyaltyLoading] = useState(false)
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false)
  const [redeemCode, setRedeemCode] = useState('')
  const [redeemingCode, setRedeemingCode] = useState(false)
  const [selectedRestaurantForHistory, setSelectedRestaurantForHistory] = useState<string | null>(null)
  const [loyaltyHistory, setLoyaltyHistory] = useState<LoyaltyTransaction[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    loadReviews()
  }, [reviewsPage])

  const loadDashboardData = async () => {
    try {
      const [statsData, recsData, activeOrdersData, historyOrdersData, currentOrdersData, allReservationsData] = await Promise.all([
        customerApi.statistics.getCustomerStatistics(),
        customerApi.statistics.getRecommendations(6),
        customerApi.orders.getActive(1, 10),
        customerApi.orders.getHistory(1, 10),
        customerApi.orders.getCurrent(),
        customerApi.reservations.getAll(1, 20),
      ])

      setStats(statsData)
      setRecommendations(recsData)
      
      // Parse active orders
      if (activeOrdersData && activeOrdersData.items) {
        setActiveOrders(activeOrdersData.items)
      } else if (Array.isArray(activeOrdersData)) {
        setActiveOrders(activeOrdersData)
      }

      // Parse order history
      if (historyOrdersData && historyOrdersData.items) {
        setOrderHistory(historyOrdersData.items)
      } else if (Array.isArray(historyOrdersData)) {
        setOrderHistory(historyOrdersData)
      }

      // Parse current orders
      if (Array.isArray(currentOrdersData)) {
        setCurrentOrders(currentOrdersData)
      }

      // Parse all reservations
      if (allReservationsData && allReservationsData.items) {
        setAllReservations(allReservationsData.items)
        // Filter upcoming reservations
        const upcoming = allReservationsData.items.filter((r: Reservation) => 
          new Date(r.reservationDate) >= new Date() && r.status !== 'Cancelled'
        )
        setUpcomingReservations(upcoming)
      } else if (Array.isArray(allReservationsData)) {
        setAllReservations(allReservationsData)
        const upcoming = allReservationsData.filter((r: Reservation) => 
          new Date(r.reservationDate) >= new Date() && r.status !== 'Cancelled'
        )
        setUpcomingReservations(upcoming)
      }

      // Load reviews
      await loadReviews()
    } catch (error) {
      console.error('Error loading dashboard:', error)
      toast({
        title: 'Hata',
        description: 'Dashboard verileri yüklenirken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async () => {
    try {
      setReviewsLoading(true)
      const reviewsData = await customerApi.reviews.getAll(reviewsPage, reviewsPageSize)
      
      if (reviewsData && reviewsData.items) {
        setMyReviews(reviewsData.items)
        setTotalReviewsCount(reviewsData.totalCount || 0)
      } else if (Array.isArray(reviewsData)) {
        setMyReviews(reviewsData)
        setTotalReviewsCount(reviewsData.length)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
      toast({
        title: 'Hata',
        description: 'Yorumlar yüklenirken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setReviewsLoading(false)
    }
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setEditRating(review.rating)
    setEditComment(review.comment)
  }

  const handleUpdateReview = async () => {
    if (!editingReview) return

    if (editRating === 0) {
      toast({
        title: 'Puan seçin',
        description: 'Lütfen bir puan seçin.',
        variant: 'destructive',
      })
      return
    }

    if (!editComment.trim()) {
      toast({
        title: 'Yorum yazın',
        description: 'Lütfen bir yorum yazın.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await customerApi.reviews.update(editingReview.id, {
        rating: editRating,
        comment: editComment.trim(),
      })

      toast({
        title: 'Başarılı',
        description: 'Yorumunuz güncellendi.',
      })

      setEditingReview(null)
      setEditRating(0)
      setEditComment('')
      await loadDashboardData()
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Yorum güncellenirken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return

    try {
      await customerApi.reviews.delete(reviewId)
      toast({
        title: 'Başarılı',
        description: 'Yorumunuz silindi.',
      })
      await loadDashboardData()
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Yorum silinirken bir hata oluştu.',
        variant: 'destructive',
      })
    }
  }

  const loadLoyaltyBalance = async () => {
    try {
      setLoyaltyLoading(true)
      const balances = await customerApi.loyalty.getBalance()
      setLoyaltyBalances(balances || [])
    } catch (error) {
      console.error('Error loading loyalty balance:', error)
    } finally {
      setLoyaltyLoading(false)
    }
  }

  const handleRedeemCode = async () => {
    if (!redeemCode.trim()) {
      toast({
        title: 'Hata',
        description: 'Lütfen bir kod girin.',
        variant: 'destructive',
      })
      return
    }

    setRedeemingCode(true)
    try {
      const result = await customerApi.loyalty.redeemCode(redeemCode.trim())
      toast({
        title: 'Başarılı!',
        description: `${result.points} puan kazandınız! (${result.restaurantName})`,
      })
      setRedeemCode('')
      setRedeemDialogOpen(false)
      await loadLoyaltyBalance()
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Kod kullanılırken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setRedeemingCode(false)
    }
  }

  const loadLoyaltyHistory = async (restaurantId?: string) => {
    try {
      setHistoryLoading(true)
      const history = await customerApi.loyalty.getHistory(restaurantId)
      setLoyaltyHistory(history || [])
    } catch (error) {
      console.error('Error loading loyalty history:', error)
      toast({
        title: 'Hata',
        description: 'Sadakat geçmişi yüklenirken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setHistoryLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Müşteri Paneli</h1>
          <p className="text-muted-foreground">Hoş geldiniz! İşte aktiviteleriniz.</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Sipariş</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Rezervasyon</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReservations || 0}</div>
            <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Harcama</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{stats?.totalSpent?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favori Restoranlar</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.favoriteRestaurantsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Kayıtlı</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders and Reservations Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Siparişler ve Rezervasyonlar
          </CardTitle>
          <CardDescription>Tüm siparişleriniz ve rezervasyonlarınız</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active-orders" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="active-orders">
                Aktif Siparişler
                {activeOrders.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{activeOrders.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="order-history">
                Geçmiş Siparişler
                {orderHistory.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{orderHistory.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="current-orders">
                Mevcut Siparişler
                {currentOrders.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{currentOrders.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="reservations">
                Rezervasyonlar
                {allReservations.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{allReservations.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Active Orders Tab */}
            <TabsContent value="active-orders" className="space-y-4">
              {activeOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Aktif siparişiniz bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <Link key={order.id} href={`/customer/orders/${order.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{order.restaurantName || 'Restoran'}</p>
                            <Badge variant="outline">{order.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Sipariş #{order.orderNumber || order.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(order.createdAt || order.orderDate || '').toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₺{order.totalAmount?.toFixed(2)}</p>
                          <Button variant="link" size="sm" className="h-auto p-0">
                            Detaylar →
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Order History Tab */}
            <TabsContent value="order-history" className="space-y-4">
              {orderHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Geçmiş siparişiniz bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderHistory.map((order) => (
                    <Link key={order.id} href={`/customer/orders/${order.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{order.restaurantName || 'Restoran'}</p>
                            <Badge 
                              variant={
                                order.status === 'Completed' ? 'default' : 
                                order.status === 'Cancelled' ? 'destructive' : 
                                'secondary'
                              }
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Sipariş #{order.orderNumber || order.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(order.createdAt || order.orderDate || '').toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₺{order.totalAmount?.toFixed(2)}</p>
                          <Button variant="link" size="sm" className="h-auto p-0">
                            Detaylar →
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Current Orders Tab */}
            <TabsContent value="current-orders" className="space-y-4">
              {currentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Mevcut siparişiniz bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentOrders.map((order) => (
                    <Link key={order.id} href={`/customer/orders/${order.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{order.restaurantName || 'Restoran'}</p>
                            <Badge variant="default">{order.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Sipariş #{order.orderNumber || order.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(order.createdAt || order.orderDate || '').toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₺{order.totalAmount?.toFixed(2)}</p>
                          <Button variant="link" size="sm" className="h-auto p-0">
                            Detaylar →
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Reservations Tab */}
            <TabsContent value="reservations" className="space-y-4">
              {allReservations.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Rezervasyonunuz bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allReservations.map((reservation) => {
                    const isUpcoming = new Date(reservation.reservationDate) >= new Date()
                    const isPast = new Date(reservation.reservationDate) < new Date()
                    
                    return (
                      <Link key={reservation.id} href={`/customer/reservations/${reservation.id}`}>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{reservation.restaurantName}</p>
                              <Badge 
                                variant={
                                  reservation.status === 'Confirmed' ? 'default' : 
                                  reservation.status === 'Cancelled' ? 'destructive' : 
                                  'secondary'
                                }
                              >
                                {reservation.status}
                              </Badge>
                              {isUpcoming && reservation.status === 'Confirmed' && (
                                <Badge variant="outline">Yaklaşan</Badge>
                              )}
                              {isPast && reservation.status === 'Confirmed' && (
                                <Badge variant="secondary">Geçmiş</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {new Date(reservation.reservationDate).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              <span className="font-medium">{reservation.partySize} Kişi</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <Button variant="link" size="sm" className="h-auto p-0">
                              Detaylar →
                            </Button>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Active Orders - Old Section - Remove this */}
      {/* {activeOrders && activeOrders.length > 0 && (...)} */}

      {/* Upcoming Reservations - Old Section - Remove this */}
      {/* {upcomingReservations && upcomingReservations.length > 0 && (...)} */}

      {/* Recommended Restaurants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Sizin İçin Önerilen Restoranlar
          </CardTitle>
          <CardDescription>Tercihlerinize göre seçilmiş restoranlar</CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations && recommendations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((restaurant) => (
                <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                      <CardDescription>{restaurant.cuisine}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{restaurant.averageRating?.toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{restaurant.location}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Henüz öneri bulunmuyor</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/restaurants">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Yeni Sipariş
              </CardTitle>
              <CardDescription>Restoranları keşfedin ve sipariş verin</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/customer/reservations">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Rezervasyon Yap
              </CardTitle>
              <CardDescription>Masa rezervasyonu yapın</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/customer/favorites">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Favorilerim
              </CardTitle>
              <CardDescription>Favori restoranlarınızı görün</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/customer/loyalty">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Sadakat Puanları
              </CardTitle>
              <CardDescription>Puanlarınızı görüntüleyin ve kod kullanın</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* My Reviews */}
      {myReviews && myReviews.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Yorumlarım
                </CardTitle>
                <CardDescription>
                  Restoranlar hakkındaki yorumlarınız ({totalReviewsCount} toplam)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {reviewsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {myReviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Link href={`/restaurants/${review.restaurantId}`}>
                          <p className="font-medium hover:underline">{review.restaurantName}</p>
                        </Link>
                        <div className="flex items-center gap-2">
                          <Badge variant={review.status === 'Approved' ? 'default' : review.status === 'Pending' ? 'secondary' : 'destructive'}>
                            {review.status === 'Approved' ? 'Onaylandı' : review.status === 'Pending' ? 'Beklemede' : 'Reddedildi'}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditReview(review)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteReview(review.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-2">
                          {new Date(review.createdAt).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                      
                      {review.ownerResponse && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Restoran Yanıtı:</p>
                          <p className="text-sm text-muted-foreground">{review.ownerResponse}</p>
                          {review.respondedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(review.respondedAt).toLocaleDateString('tr-TR')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalReviewsCount > reviewsPageSize && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Sayfa {reviewsPage} / {Math.ceil(totalReviewsCount / reviewsPageSize)}
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReviewsPage(Math.max(1, reviewsPage - 1))}
                            disabled={reviewsPage === 1 || reviewsLoading}
                          >
                            <ChevronLeftIcon className="h-4 w-4 mr-1" />
                            Önceki
                          </Button>
                        </PaginationItem>
                        
                        {(() => {
                          const totalPages = Math.ceil(totalReviewsCount / reviewsPageSize)
                          const pages = []
                          
                          if (totalPages <= 7) {
                            // Show all pages if 7 or fewer
                            for (let i = 1; i <= totalPages; i++) {
                              pages.push(
                                <PaginationItem key={i}>
                                  <Button
                                    variant={reviewsPage === i ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setReviewsPage(i)}
                                    disabled={reviewsLoading}
                                  >
                                    {i}
                                  </Button>
                                </PaginationItem>
                              )
                            }
                          } else {
                            // Show first page
                            pages.push(
                              <PaginationItem key={1}>
                                <Button
                                  variant={reviewsPage === 1 ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setReviewsPage(1)}
                                  disabled={reviewsLoading}
                                >
                                  1
                                </Button>
                              </PaginationItem>
                            )
                            
                            // Show ellipsis if needed
                            if (reviewsPage > 3) {
                              pages.push(
                                <PaginationItem key="ellipsis-1">
                                  <PaginationEllipsis />
                                </PaginationItem>
                              )
                            }
                            
                            // Show current page and neighbors
                            const start = Math.max(2, reviewsPage - 1)
                            const end = Math.min(totalPages - 1, reviewsPage + 1)
                            
                            for (let i = start; i <= end; i++) {
                              pages.push(
                                <PaginationItem key={i}>
                                  <Button
                                    variant={reviewsPage === i ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setReviewsPage(i)}
                                    disabled={reviewsLoading}
                                  >
                                    {i}
                                  </Button>
                                </PaginationItem>
                              )
                            }
                            
                            // Show ellipsis if needed
                            if (reviewsPage < totalPages - 2) {
                              pages.push(
                                <PaginationItem key="ellipsis-2">
                                  <PaginationEllipsis />
                                </PaginationItem>
                              )
                            }
                            
                            // Show last page
                            pages.push(
                              <PaginationItem key={totalPages}>
                                <Button
                                  variant={reviewsPage === totalPages ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setReviewsPage(totalPages)}
                                  disabled={reviewsLoading}
                                >
                                  {totalPages}
                                </Button>
                              </PaginationItem>
                            )
                          }
                          
                          return pages
                        })()}
                        
                        <PaginationItem>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReviewsPage(Math.min(Math.ceil(totalReviewsCount / reviewsPageSize), reviewsPage + 1))}
                            disabled={reviewsPage === Math.ceil(totalReviewsCount / reviewsPageSize) || reviewsLoading}
                          >
                            Sonraki
                            <ChevronRightIcon className="h-4 w-4 ml-1" />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Review Dialog */}
      <Dialog open={!!editingReview} onOpenChange={(open) => !open && setEditingReview(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yorumu Düzenle</DialogTitle>
            <DialogDescription>
              {editingReview?.restaurantName} restoranı için yorumunuzu düzenleyin
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Puanınız</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                    disabled={isSubmitting}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || editRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Yorumunuz</label>
              <Textarea
                placeholder="Deneyiminizi anlatın..."
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={4}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingReview(null)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button onClick={handleUpdateReview} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                'Güncelle'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loyalty Points Dialog */}
      <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Sadakat Puanlarım
            </DialogTitle>
            <DialogDescription>
              Restoranlardaki puan bakiyeleriniz ve kod kullanma
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Redeem Code Section */}
            <div className="border rounded-lg p-4 bg-gradient-to-r from-orange-50 to-amber-50">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Kod Kullan
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Sadakat kodu girin (örn: LP-XXXXXX)"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  disabled={redeemingCode}
                />
                <Button onClick={handleRedeemCode} disabled={redeemingCode}>
                  {redeemingCode ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Kullanılıyor...
                    </>
                  ) : (
                    'Kullan'
                  )}
                </Button>
              </div>
            </div>

            {/* Loyalty Balances */}
            <div>
              <h3 className="font-semibold mb-3">Puan Bakiyelerim</h3>
              {loyaltyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : loyaltyBalances.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Henüz puan bakiyeniz bulunmuyor</p>
                  <p className="text-sm mt-1">Sipariş vererek puan kazanmaya başlayın!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {loyaltyBalances.map((balance) => (
                    <div key={balance.restaurantId} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{balance.restaurantName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Toplam: {balance.totalPoints} puan
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{balance.availablePoints}</div>
                          <p className="text-xs text-muted-foreground">Kullanılabilir Puan</p>
                        </div>
                      </div>

                      {balance.redeemedPoints > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Kullanılan: {balance.redeemedPoints} puan
                        </div>
                      )}

                      {/* Recent Transactions */}
                      {balance.recentTransactions && balance.recentTransactions.length > 0 && (
                        <div className="pt-3 border-t">
                          <p className="text-sm font-medium mb-2">Son İşlemler</p>
                          <div className="space-y-2">
                            {balance.recentTransactions.slice(0, 3).map((transaction) => (
                              <div key={transaction.id} className="flex items-center justify-between text-sm">
                                <div className="flex-1">
                                  <p className="font-medium">{transaction.description}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(transaction.earnedAt).toLocaleDateString('tr-TR', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                                <Badge variant={transaction.type === 'Bonus' ? 'default' : 'secondary'}>
                                  +{transaction.points}
                                </Badge>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 mt-2"
                            onClick={() => {
                              setSelectedRestaurantForHistory(balance.restaurantId)
                              loadLoyaltyHistory(balance.restaurantId)
                            }}
                          >
                            Tüm geçmişi gör →
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRedeemDialogOpen(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loyalty History Dialog */}
      <Dialog open={!!selectedRestaurantForHistory} onOpenChange={(open) => !open && setSelectedRestaurantForHistory(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Puan Geçmişi</DialogTitle>
            <DialogDescription>
              {loyaltyBalances.find(b => b.restaurantId === selectedRestaurantForHistory)?.restaurantName} için puan hareketleriniz
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : loyaltyHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>İşlem geçmişi bulunamadı</p>
              </div>
            ) : (
              loyaltyHistory.map((transaction) => (
                <div key={transaction.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{transaction.description}</p>
                        <Badge variant={transaction.type === 'Bonus' ? 'default' : transaction.type === 'Earned' ? 'secondary' : 'outline'}>
                          {transaction.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.earnedAt).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {transaction.expiryDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Son kullanma: {new Date(transaction.expiryDate).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">+{transaction.points}</div>
                      <p className="text-xs text-muted-foreground">puan</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRestaurantForHistory(null)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
