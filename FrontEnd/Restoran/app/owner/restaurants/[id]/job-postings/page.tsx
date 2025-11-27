"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Plus,
  Calendar,
  DollarSign,
  Users,
  Briefcase,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { API_SERVER_URL } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

interface JobPosting {
  id: string
  title: string
  description: string
  requirements: string
  position: string
  salary: number
  employmentType: string
  postedDate: string
  expiryDate: string
  isActive: boolean
  restaurantId: string
  restaurantName: string
  applicationCount: number
}

export default function RestaurantJobPostingsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { getToken } = useAuth()
  const restaurantId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [restaurant, setRestaurant] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [restaurantId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const token = getToken()
      
      if (!token) {
        toast({
          title: "Oturum Hatası",
          description: "Lütfen tekrar giriş yapın",
          variant: "destructive",
        })
        router.push('/login')
        return
      }
      
      console.log('Loading job postings with token:', token?.substring(0, 20) + '...')
      
      // Load job postings
      const response = await fetch(`${API_SERVER_URL}/api/JobPosting/restaurant/${restaurantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('Job postings response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('Job postings error:', errorData)
        const errorMessage = errorData?.message || errorData?.title || `İş ilanları yüklenemedi (HTTP ${response.status})`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Job postings loaded:', data.length)
      setJobPostings(data)
      
      if (data.length > 0) {
        setRestaurant({ name: data[0].restaurantName })
      }
    } catch (error: any) {
      console.error("Error loading data:", error)
      toast({
        title: "Veri Yükleme Hatası",
        description: error.message || "İş ilanları yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (jobPostingId: string) => {
    if (!confirm("Bu iş ilanını silmek istediğinizden emin misiniz?")) return

    try {
      const token = getToken()
      const response = await fetch(`${API_SERVER_URL}/api/JobPosting/${jobPostingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage = errorData?.message || errorData?.title || `İş ilanı silinemedi (HTTP ${response.status})`
        throw new Error(errorMessage)
      }

      toast({
        title: "Başarılı",
        description: "İş ilanı başarıyla silindi",
      })
      loadData()
    } catch (error: any) {
      console.error("Error deleting job posting:", error)
      toast({
        title: "İş İlanı Silme Hatası",
        description: error.message || "İş ilanı silinirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    }
  }

  const toggleActive = async (jobPosting: JobPosting) => {
    try {
      const token = getToken()
      const response = await fetch(`${API_SERVER_URL}/api/JobPosting/${jobPosting.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: jobPosting.id,
          title: jobPosting.title,
          description: jobPosting.description,
          requirements: jobPosting.requirements,
          position: jobPosting.position,
          salary: jobPosting.salary,
          employmentType: jobPosting.employmentType,
          expiryDate: jobPosting.expiryDate,
          isActive: !jobPosting.isActive,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage = errorData?.message || errorData?.title || `İş ilanı güncellenemedi (HTTP ${response.status})`
        throw new Error(errorMessage)
      }

      toast({
        title: "Başarılı",
        description: `İş ilanı başarıyla ${!jobPosting.isActive ? 'aktif' : 'pasif'} edildi`,
      })
      loadData()
    } catch (error: any) {
      console.error("Error updating job posting:", error)
      toast({
        title: "İş İlanı Güncelleme Hatası",
        description: error.message || "İş ilanı güncellenirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/owner/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Dashboard'a Dön
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="w-8 h-8" />
              İş İlanları
            </h1>
            {restaurant && (
              <p className="text-muted-foreground mt-1">{restaurant.name}</p>
            )}
          </div>
          <Button onClick={() => router.push(`/owner/restaurants/${restaurantId}/job-postings/new`)}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni İlan Oluştur
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Toplam İlan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobPostings.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aktif İlanlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {jobPostings.filter(jp => jp.isActive).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Toplam Başvuru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {jobPostings.reduce((sum, jp) => sum + jp.applicationCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Postings List */}
      {jobPostings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground mb-4">Henüz iş ilanı yok</p>
            <Button onClick={() => router.push(`/owner/restaurants/${restaurantId}/job-postings/new`)}>
              <Plus className="w-4 h-4 mr-2" />
              İlk İlanı Oluştur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobPostings.map((jobPosting) => (
            <Card key={jobPosting.id} className={!jobPosting.isActive ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{jobPosting.title}</CardTitle>
                      {jobPosting.isActive ? (
                        <Badge className="bg-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="w-3 h-3 mr-1" />
                          Pasif
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{jobPosting.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(jobPosting)}
                    >
                      {jobPosting.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(jobPosting.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{jobPosting.position}</div>
                      <div className="text-xs text-muted-foreground">{jobPosting.employmentType}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">₺{jobPosting.salary.toLocaleString('tr-TR')}</div>
                      <div className="text-xs text-muted-foreground">Maaş</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{jobPosting.applicationCount} Başvuru</div>
                      <div className="text-xs text-muted-foreground">
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() => router.push(`/owner/restaurants/${restaurantId}/job-applications?jobPostingId=${jobPosting.id}`)}
                        >
                          Görüntüle
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">
                        {new Date(jobPosting.expiryDate) > new Date() ? 'Aktif' : 'Süresi Doldu'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(jobPosting.expiryDate).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </div>
                </div>
                
                {jobPosting.requirements && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-2">Gereksinimler:</div>
                    <div className="text-sm text-muted-foreground whitespace-pre-line">
                      {jobPosting.requirements}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
