"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import type { Restaurant, Menu, MenuItem, JobPosting } from "@/types"
import { getCategoryName } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Clock, Phone, Mail, Plus, Minus, Gift, Briefcase, Calendar, DollarSign } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ReviewSection } from "@/components/reviews/review-section"
import { customerApi } from "@/lib/customer-api"
import { RestaurantLocationMap } from "@/components/maps/RestaurantLocationMap"
import { jobPostingApi, jobApplicationApi } from "@/lib/api"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { AuthService } from "@/lib/auth"

export default function RestaurantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { addItem } = useCart()
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menus, setMenus] = useState<Menu[]>([])
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [currentMenuPage, setCurrentMenuPage] = useState<{[key: string]: number}>({})
  const menuItemsPerPage = 6
  
  // Job application states
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [jobDialogOpen, setJobDialogOpen] = useState(false)
  const [applyingJob, setApplyingJob] = useState(false)
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: "",
    cvFile: null as File | null,
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch restaurant details from API
        const restaurantData = await customerApi.restaurants.getById(params.id as string)
        
        // Fix imageUrl to use full URL
        if (restaurantData.imageUrl && !restaurantData.imageUrl.startsWith('http')) {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
          restaurantData.imageUrl = `${baseUrl}${restaurantData.imageUrl}`
        }
        
        setRestaurant(restaurantData)
        
        // Fetch restaurant menus
        const menusData = await customerApi.restaurants.getMenus(params.id as string)
        
        // Fix imageUrls in menu items
        menusData.forEach((menu: any) => {
          menu.menuItems?.forEach((item: any) => {
            if (item.imageUrl && !item.imageUrl.startsWith('http')) {
              const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
              item.imageUrl = `${baseUrl}${item.imageUrl}`
            }
          })
        })
        
        setMenus(menusData)
        
        // Fetch job postings
        try {
          const jobsData = await jobPostingApi.getByRestaurant(params.id as string)
          console.log("Fetched jobs:", jobsData)
          console.log("First job isActive:", jobsData?.[0]?.isActive)
          console.log("First job full data:", JSON.stringify(jobsData?.[0], null, 2))
          
          // Filter by isActive field
          const activeJobs = Array.isArray(jobsData) 
            ? jobsData.filter((job: any) => job.isActive === true)
            : []
          console.log("Active jobs:", activeJobs)
          console.log("Active jobs count:", activeJobs.length)
          setJobPostings(activeJobs)
        } catch (error) {
          console.error("Error fetching jobs:", error)
          setJobPostings([])
        }
      } catch (error: any) {
        console.error("Error fetching restaurant:", error)
        toast({
          title: "Hata",
          description: "Restoran bilgileri yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, toast])

  const handleDialogOpen = (item: MenuItem) => {
    setSelectedItem(item)
    setQuantity(1)
  }

  const handleAddToCart = async () => {
    if (!restaurant || !selectedItem) return

    const success = addItem(selectedItem, restaurant.id, restaurant.name)

    if (success) {
      toast({
        title: "Sepete eklendi",
        description: `${selectedItem.name} (${quantity} adet) sepetinize eklendi.`,
      })

      const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]') as HTMLButtonElement
      closeButton?.click()
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setSelectedItem(null)
        setQuantity(1)
      }, 100)
    }
  }

  const handleJobApply = (job: JobPosting) => {
    if (!user) {
      toast({
        title: "Giriş Gerekli",
        description: "İş başvurusu yapmak için giriş yapmalısınız.",
        variant: "destructive",
      })
      router.push('/login')
      return
    }
    setSelectedJob(job)
    setJobDialogOpen(true)
  }

  const handleSubmitApplication = async () => {
    if (!selectedJob || !user) return

    // Check if token exists
    const token = AuthService.getToken()
    if (!token) {
      toast({
        title: "Oturum Süresi Doldu",
        description: "Lütfen tekrar giriş yapın.",
        variant: "destructive",
      })
      router.push('/login')
      return
    }

    if (!applicationForm.coverLetter.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen ön yazı alanını doldurun.",
        variant: "destructive",
      })
      return
    }

    if (!applicationForm.cvFile) {
      toast({
        title: "Hata",
        description: "Lütfen CV dosyanızı yükleyin.",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (applicationForm.cvFile.size > 5 * 1024 * 1024) {
      toast({
        title: "Hata",
        description: "CV dosyası maksimum 5MB olabilir.",
        variant: "destructive",
      })
      return
    }

    // Check file type
    const allowedTypes = ['.pdf', '.doc', '.docx']
    const fileName = applicationForm.cvFile.name.toLowerCase()
    const isValidType = allowedTypes.some(type => fileName.endsWith(type))
    
    if (!isValidType) {
      toast({
        title: "Hata",
        description: "Sadece PDF, DOC veya DOCX formatında dosya yükleyebilirsiniz.",
        variant: "destructive",
      })
      return
    }

    setApplyingJob(true)
    try {
      const formData = new FormData()
      formData.append('JobPostingId', selectedJob.id)
      formData.append('CoverLetter', applicationForm.coverLetter)
      formData.append('cvFile', applicationForm.cvFile)

      await jobApplicationApi.create(formData)

      toast({
        title: "Başarılı!",
        description: "Başvurunuz alındı. Başvuru durumunuz hakkında e-posta adresinize bilgilendirme yapılacaktır.",
      })

      setJobDialogOpen(false)
      setApplicationForm({ coverLetter: "", cvFile: null })
      setSelectedJob(null)
    } catch (error: any) {
      console.error("Job application error:", error)
      
      // If unauthorized, redirect to login
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        toast({
          title: "Oturum Süresi Doldu",
          description: "Lütfen tekrar giriş yapın.",
          variant: "destructive",
        })
        router.push('/login')
        return
      }
      
      toast({
        title: "Hata",
        description: error.message || "Başvuru gönderilirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setApplyingJob(false)
    }
  }

  const getPaginatedItems = (items: MenuItem[], menuId: string) => {
    const page = currentMenuPage[menuId] || 1
    const startIndex = (page - 1) * menuItemsPerPage
    const endIndex = startIndex + menuItemsPerPage
    return items.slice(startIndex, endIndex)
  }

  const getTotalPages = (itemsCount: number) => {
    return Math.ceil(itemsCount / menuItemsPerPage)
  }

  const setMenuPage = (menuId: string, page: number) => {
    setCurrentMenuPage(prev => ({ ...prev, [menuId]: page }))
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-muted rounded-lg" />
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="container py-8">
        <p>Restoran bulunamadı</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img
          src={restaurant.imageUrl || "/placeholder.svg"}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container py-8">
        {/* Restaurant Info */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{restaurant.rating}</span>
                </div>
                <Badge>{getCategoryName(restaurant.category)}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="default"
                onClick={() => router.push(`/restaurants/${params.id}/reserve`)}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Rezervasyon Yap
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push(`/restaurants/${params.id}/rewards`)}
                className="gap-2"
              >
                <Gift className="h-4 w-4" />
                Rewards
              </Button>
              <Button variant="outline" size="icon">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-6">{restaurant.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Adres</p>
                    <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Çalışma Saatleri</p>
                    <p className="text-sm text-muted-foreground">09:00 - 23:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">İletişim</p>
                    <p className="text-sm text-muted-foreground">{restaurant.phoneNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Menu Section */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Menü</h2>

          <Tabs defaultValue={menus[0]?.id} className="w-full">
            <TabsList className="mb-6">
              {menus.map((menu) => (
                <TabsTrigger key={menu.id} value={menu.id}>
                  {menu.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {menus.map((menu) => {
              const paginatedItems = getPaginatedItems(menu.menuItems, menu.id)
              const totalPages = getTotalPages(menu.menuItems.length)
              const currentPage = currentMenuPage[menu.id] || 1

              return (
                <TabsContent key={menu.id} value={menu.id}>
                  <p className="text-muted-foreground mb-6">{menu.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="relative h-48">
                          <img
                            src={item.imageUrl || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {!item.isAvailable && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                              <Badge variant="destructive">Stokta Yok</Badge>
                            </div>
                          )}
                        </div>
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                            <span className="font-bold text-primary whitespace-nowrap">₺{item.price}</span>
                          </div>
                          <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Dialog 
                            open={selectedItem?.id === item.id} 
                            onOpenChange={(open) => handleDialogClose(open)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                className="w-full"
                                disabled={!item.isAvailable}
                                onClick={() => handleDialogOpen(item)}
                              >
                                Sepete Ekle
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{item.name}</DialogTitle>
                                <DialogDescription>{item.description}</DialogDescription>
                              </DialogHeader>
                              {selectedItem && (
                                <div className="space-y-4">
                                  <img
                                    src={selectedItem.imageUrl || "/placeholder.svg"}
                                    alt={selectedItem.name}
                                    className="w-full h-48 object-cover rounded-lg"
                                  />

                                  <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold">₺{selectedItem.price}</span>
                                    <div className="flex items-center gap-3">
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                      >
                                        <Minus className="h-4 w-4" />
                                      </Button>
                                      <span className="text-xl font-medium w-8 text-center">{quantity}</span>
                                      <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  <Button className="w-full" size="lg" onClick={handleAddToCart}>
                                    Sepete Ekle - ₺{selectedItem.price * quantity}
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Menu Items Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setMenuPage(menu.id, Math.max(1, currentPage - 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setMenuPage(menu.id, page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setMenuPage(menu.id, Math.min(totalPages, currentPage + 1))}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </TabsContent>
              )
            })}
          </Tabs>
        </div>

        {/* Job Postings Section */}
        {jobPostings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <Briefcase className="h-8 w-8" />
              İş İlanları
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobPostings.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <CardTitle>{job.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{job.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {job.position && (
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>Pozisyon: {job.position}</span>
                      </div>
                    )}
                    {job.salary && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>Maaş: ₺{job.salary.toLocaleString('tr-TR')}</span>
                      </div>
                    )}
                    {job.employmentType && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Çalışma Tipi: {job.employmentType}</span>
                      </div>
                    )}
                    {job.expiryDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Son Başvuru: {new Date(job.expiryDate).toLocaleDateString('tr-TR')}</span>
                      </div>
                    )}
                    <Button className="w-full" onClick={() => handleJobApply(job)}>
                      Başvur
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-12">
          <ReviewSection restaurantId={restaurant.id} restaurantName={restaurant.name} />
        </div>

        {/* Map Section - Only render on client side to avoid SSR issues with Leaflet */}
        {restaurant.latitude && restaurant.longitude && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Konum</h2>
            <Card>
              <CardContent className="p-4">
                <div className="h-64 w-full">
                  {typeof window !== 'undefined' && (
                    <RestaurantLocationMap
                      latitude={restaurant.latitude}
                      longitude={restaurant.longitude}
                      restaurantName={restaurant.name}
                      address={restaurant.address}
                    />
                  )}
                  {typeof window === 'undefined' && (
                    <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-muted-foreground">Harita yükleniyor...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Job Application Dialog */}
      <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedJob?.title} - İş Başvurusu</DialogTitle>
            <DialogDescription>
              Başvurunuzu tamamlamak için aşağıdaki bilgileri doldurun.
            </DialogDescription>
          </DialogHeader>
          
          {selectedJob && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">İş Tanımı</h4>
                <p className="text-sm text-muted-foreground">{selectedJob.description}</p>
              </div>
              
              {selectedJob.requirements && (
                <div>
                  <h4 className="font-semibold mb-2">Gereksinimler</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedJob.requirements}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="coverLetter">Ön Yazı *</Label>
                <Textarea
                  id="coverLetter"
                  placeholder="Kendinizi tanıtın ve neden bu pozisyon için uygun olduğunuzu açıklayın..."
                  value={applicationForm.coverLetter}
                  onChange={(e) => setApplicationForm({ ...applicationForm, coverLetter: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvFile">CV Dosyası * (PDF, DOC, DOCX - Max 5MB)</Label>
                <Input
                  id="cvFile"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    setApplicationForm({ ...applicationForm, cvFile: file })
                  }}
                  required
                  className="cursor-pointer"
                />
                {applicationForm.cvFile && (
                  <p className="text-sm text-muted-foreground">
                    Seçilen dosya: {applicationForm.cvFile.name}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setJobDialogOpen(false)} disabled={applyingJob}>
              İptal
            </Button>
            <Button onClick={handleSubmitApplication} disabled={applyingJob}>
              {applyingJob ? "Gönderiliyor..." : "Başvuruyu Gönder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
