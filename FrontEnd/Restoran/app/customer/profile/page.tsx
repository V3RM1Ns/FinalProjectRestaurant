'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { customerApi } from '@/lib/customer-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { ShoppingBag, Calendar, Star, Heart, TrendingUp, Award, DollarSign, User, Shield, Store, Loader2, Mail, Phone, MapPin, Building } from 'lucide-react'

export default function CustomerProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('statistics')
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  })
  const [updatingProfile, setUpdatingProfile] = useState(false)

  // Security form state
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [updatingSecurity, setUpdatingSecurity] = useState(false)

  // Restaurant owner application state
  const [applicationForm, setApplicationForm] = useState({
    restaurantName: '',
    restaurantAddress: '',
    restaurantPhone: '',
    cuisine: '',
    description: '',
    taxNumber: '',
    businessLicense: ''
  })
  const [submittingApplication, setSubmittingApplication] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const data = await customerApi.statistics.getCustomerStatistics()
      setStats(data)
      
      // Load user profile data if available
      if (user) {
        setProfileForm({
          firstName: (user as any).firstName || '',
          lastName: (user as any).lastName || '',
          email: user.email || '',
          phone: (user as any).phone || '',
          address: (user as any).address || ''
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdatingProfile(true)

    try {
      // API call to update profile
      // await customerApi.profile.update(profileForm)
      
      toast({
        title: 'Başarılı!',
        description: 'Profil bilgileriniz güncellendi.',
      })
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Profil güncellenirken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast({
        title: 'Hata',
        description: 'Yeni şifreler eşleşmiyor.',
        variant: 'destructive',
      })
      return
    }

    if (securityForm.newPassword.length < 6) {
      toast({
        title: 'Hata',
        description: 'Şifre en az 6 karakter olmalıdır.',
        variant: 'destructive',
      })
      return
    }

    setUpdatingSecurity(true)

    try {
      // API call to update password
      // await customerApi.security.changePassword(securityForm)
      
      toast({
        title: 'Başarılı!',
        description: 'Şifreniz güncellendi.',
      })
      
      setSecurityForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Şifre güncellenirken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setUpdatingSecurity(false)
    }
  }

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!applicationForm.restaurantName || !applicationForm.restaurantAddress || !applicationForm.cuisine) {
      toast({
        title: 'Hata',
        description: 'Lütfen zorunlu alanları doldurun.',
        variant: 'destructive',
      })
      return
    }

    setSubmittingApplication(true)

    try {
      // API call to submit restaurant owner application
      // await customerApi.applications.submitRestaurantOwner(applicationForm)
      
      toast({
        title: 'Başarılı!',
        description: 'Restoran sahipliği başvurunuz alındı. En kısa sürede değerlendirilecektir.',
      })
      
      setApplicationForm({
        restaurantName: '',
        restaurantAddress: '',
        restaurantPhone: '',
        cuisine: '',
        description: '',
        taxNumber: '',
        businessLicense: ''
      })
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Başvuru gönderilirken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setSubmittingApplication(false)
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
      <div>
        <h1 className="text-3xl font-bold">Profilim</h1>
        <p className="text-muted-foreground">Profil bilgilerinizi yönetin ve istatistiklerinizi görüntüleyin</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            İstatistikler
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil Bilgileri
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Güvenlik
          </TabsTrigger>
          <TabsTrigger value="restaurant-owner" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Restoran Sahipliği
          </TabsTrigger>
        </TabsList>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          {/* Main Statistics */}
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
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₺{stats?.totalSpent?.toFixed(2) || '0.00'}</div>
                <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Yorum</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalReviews || 0}</div>
                <p className="text-xs text-muted-foreground">Yaptığınız yorum sayısı</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Statistics */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Favorites & Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Tercihler & Favoriler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Favori Restoranlar</span>
                    <span className="text-sm text-muted-foreground">
                      {stats?.favoriteRestaurantsCount || 0}
                    </span>
                  </div>
                  <Progress value={(stats?.favoriteRestaurantsCount / 10) * 100} />
                </div>

                {stats?.favoriteRestaurantName && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">En Çok Sipariş Verilen Restoran</p>
                    <p className="font-medium">{stats.favoriteRestaurantName}</p>
                  </div>
                )}

                {stats?.favoriteCuisine && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Favori Mutfak Türü</p>
                    <p className="font-medium">{stats.favoriteCuisine}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rating Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Değerlendirme İstatistikleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Ortalama Verdiğiniz Puan</span>
                    <span className="text-sm font-medium">
                      {stats?.averageRatingGiven?.toFixed(1) || 'N/A'} / 5.0
                    </span>
                  </div>
                  <Progress value={(stats?.averageRatingGiven / 5) * 100} />
                </div>

                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Yapılan Yorum Sayısı</span>
                    <span className="font-medium">{stats?.totalReviews || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Yorum Yapılan Restoran</span>
                    <span className="font-medium">{stats?.reviewedRestaurantsCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Aktivite Özeti
              </CardTitle>
              <CardDescription>Son 30 gün içindeki aktiviteleriniz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Son Siparişler</span>
                  </div>
                  <p className="text-2xl font-bold">{stats?.lastMonthOrders || 0}</p>
                  <p className="text-xs text-muted-foreground">Son 30 gün</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Son Rezervasyonlar</span>
                  </div>
                  <p className="text-2xl font-bold">{stats?.lastMonthReservations || 0}</p>
                  <p className="text-xs text-muted-foreground">Son 30 gün</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Son Harcama</span>
                  </div>
                  <p className="text-2xl font-bold">₺{stats?.lastMonthSpent?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-muted-foreground">Son 30 gün</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Başarılarım
              </CardTitle>
              <CardDescription>Kazandığınız rozetler ve başarılar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {/* First Order Achievement */}
                {stats?.totalOrders > 0 && (
                  <div className="flex flex-col items-center p-4 border rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center mb-2">
                      <ShoppingBag className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-center">İlk Sipariş</p>
                    <p className="text-xs text-muted-foreground text-center">Tamamlandı</p>
                  </div>
                )}

                {/* 10 Orders Achievement */}
                {stats?.totalOrders >= 10 && (
                  <div className="flex flex-col items-center p-4 border rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center mb-2">
                      <ShoppingBag className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-center">10 Sipariş</p>
                    <p className="text-xs text-muted-foreground text-center">Tamamlandı</p>
                  </div>
                )}

                {/* First Reservation Achievement */}
                {stats?.totalReservations > 0 && (
                  <div className="flex flex-col items-center p-4 border rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center mb-2">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-center">İlk Rezervasyon</p>
                    <p className="text-xs text-muted-foreground text-center">Tamamlandı</p>
                  </div>
                )}

                {/* First Review Achievement */}
                {stats?.totalReviews > 0 && (
                  <div className="flex flex-col items-center p-4 border rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-yellow-500 flex items-center justify-center mb-2">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-center">İlk Yorum</p>
                    <p className="text-xs text-muted-foreground text-center">Tamamlandı</p>
                  </div>
                )}

                {/* Favorite Restaurant Achievement */}
                {stats?.favoriteRestaurantsCount > 0 && (
                  <div className="flex flex-col items-center p-4 border rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center mb-2">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-center">İlk Favori</p>
                    <p className="text-xs text-muted-foreground text-center">Tamamlandı</p>
                  </div>
                )}

                {/* Big Spender Achievement */}
                {stats?.totalSpent >= 1000 && (
                  <div className="flex flex-col items-center p-4 border rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-amber-500 flex items-center justify-center mb-2">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-center">Büyük Harcama</p>
                    <p className="text-xs text-muted-foreground text-center">₺1000+</p>
                  </div>
                )}

                {/* Loyal Customer Achievement */}
                {stats?.totalOrders >= 50 && (
                  <div className="flex flex-col items-center p-4 border rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center mb-2">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-center">Sadık Müşteri</p>
                    <p className="text-xs text-muted-foreground text-center">50+ Sipariş</p>
                  </div>
                )}

                {/* Active Reviewer Achievement */}
                {stats?.totalReviews >= 10 && (
                  <div className="flex flex-col items-center p-4 border rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-pink-500 flex items-center justify-center mb-2">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-center">Aktif Yorumcu</p>
                    <p className="text-xs text-muted-foreground text-center">10+ Yorum</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Info Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil Bilgilerim
              </CardTitle>
              <CardDescription>Kişisel bilgilerinizi güncelleyin</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Ad</Label>
                    <Input
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      placeholder="Adınız"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Soyad</Label>
                    <Input
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      placeholder="Soyadınız"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="ornek@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+90 555 123 4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-3" />
                    <Textarea
                      id="address"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder="Adresiniz"
                      rows={3}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={updatingProfile}>
                  {updatingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Güncelleniyor...
                    </>
                  ) : (
                    'Bilgileri Güncelle'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Güvenlik Ayarları
              </CardTitle>
              <CardDescription>Şifrenizi değiştirin ve hesabınızı güvende tutun</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={securityForm.currentPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                    placeholder="Mevcut şifreniz"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Yeni Şifre</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={securityForm.newPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                    placeholder="Yeni şifreniz (en az 6 karakter)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={securityForm.confirmPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                    placeholder="Yeni şifrenizi tekrar girin"
                  />
                </div>

                <Button type="submit" disabled={updatingSecurity}>
                  {updatingSecurity ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Güncelleniyor...
                    </>
                  ) : (
                    'Şifreyi Güncelle'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Restaurant Owner Application Tab */}
        <TabsContent value="restaurant-owner" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Restoran Sahipliği Başvurusu
              </CardTitle>
              <CardDescription>
                Restoranınızı platformumuza eklemek için başvuru yapın
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurantName">Restoran Adı *</Label>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="restaurantName"
                      value={applicationForm.restaurantName}
                      onChange={(e) => setApplicationForm({ ...applicationForm, restaurantName: e.target.value })}
                      placeholder="Restoranınızın adı"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restaurantAddress">Restoran Adresi *</Label>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-3" />
                    <Textarea
                      id="restaurantAddress"
                      value={applicationForm.restaurantAddress}
                      onChange={(e) => setApplicationForm({ ...applicationForm, restaurantAddress: e.target.value })}
                      placeholder="Restoranınızın tam adresi"
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurantPhone">Restoran Telefonu</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="restaurantPhone"
                        type="tel"
                        value={applicationForm.restaurantPhone}
                        onChange={(e) => setApplicationForm({ ...applicationForm, restaurantPhone: e.target.value })}
                        placeholder="+90 212 345 6789"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cuisine">Mutfak Türü *</Label>
                    <Input
                      id="cuisine"
                      value={applicationForm.cuisine}
                      onChange={(e) => setApplicationForm({ ...applicationForm, cuisine: e.target.value })}
                      placeholder="Örn: Türk, İtalyan, Japon"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Restoran Açıklaması</Label>
                  <Textarea
                    id="description"
                    value={applicationForm.description}
                    onChange={(e) => setApplicationForm({ ...applicationForm, description: e.target.value })}
                    placeholder="Restoranınızı tanıtan kısa bir açıklama yazın..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxNumber">Vergi Numarası</Label>
                    <Input
                      id="taxNumber"
                      value={applicationForm.taxNumber}
                      onChange={(e) => setApplicationForm({ ...applicationForm, taxNumber: e.target.value })}
                      placeholder="1234567890"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessLicense">İşletme Ruhsatı No</Label>
                    <Input
                      id="businessLicense"
                      value={applicationForm.businessLicense}
                      onChange={(e) => setApplicationForm({ ...applicationForm, businessLicense: e.target.value })}
                      placeholder="İşletme ruhsat numarası"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Not:</strong> Başvurunuz incelendikten sonra 3-5 iş günü içinde size geri dönüş yapılacaktır. 
                    Başvurunuzun durumunu e-posta adresinizden takip edebilirsiniz.
                  </p>
                </div>

                <Button type="submit" disabled={submittingApplication} className="w-full">
                  {submittingApplication ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    'Başvuruyu Gönder'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
