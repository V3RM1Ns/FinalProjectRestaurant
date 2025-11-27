"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { API_SERVER_URL } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

export default function NewJobPostingPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { getToken } = useAuth()
  const restaurantId = params.id as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    position: "",
    salary: "",
    employmentType: "Full-time",
    expiryDate: "",
    restaurantId: restaurantId,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.position || !formData.salary || !formData.expiryDate) {
      toast({
        title: "Hata",
        description: "Lütfen tüm zorunlu alanları doldurun",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
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
      
      console.log('Creating job posting with token:', token?.substring(0, 20) + '...')
      
      const response = await fetch(`${API_SERVER_URL}/api/JobPosting`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements,
          position: formData.position,
          salary: parseFloat(formData.salary),
          employmentType: formData.employmentType,
          expiryDate: new Date(formData.expiryDate).toISOString(),
          restaurantId: restaurantId,
        }),
      })

      console.log('Create job posting response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('Create job posting error:', errorData)
        const errorMessage = errorData?.message || errorData?.title || `İş ilanı oluşturulamadı (HTTP ${response.status})`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('Job posting created:', result)
      
      toast({
        title: "Başarılı",
        description: "İş ilanı başarıyla oluşturuldu",
      })
      
      router.push(`/owner/restaurants/${restaurantId}/job-postings`)
    } catch (error: any) {
      console.error("Error creating job posting:", error)
      toast({
        title: "İş İlanı Oluşturma Hatası",
        description: error.message || "İş ilanı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/owner/restaurants/${restaurantId}/job-postings`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>
        
        <h1 className="text-3xl font-bold">Yeni İş İlanı Oluştur</h1>
        <p className="text-muted-foreground mt-1">İş ilanı bilgilerini girin</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>İlan Detayları</CardTitle>
          <CardDescription>
            Tüm zorunlu alanları doldurun ve ilanınızı yayınlayın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">İlan Başlığı *</Label>
              <Input
                id="title"
                placeholder="Örn: Garson Aranıyor"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="position">Pozisyon *</Label>
              <Input
                id="position"
                placeholder="Örn: Garson"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama *</Label>
              <Textarea
                id="description"
                placeholder="İş tanımı ve sorumluluklar..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <Label htmlFor="requirements">Gereksinimler</Label>
              <Textarea
                id="requirements"
                placeholder="Örn:&#10;- İyi iletişim becerileri&#10;- En az 2 yıl deneyim&#10;- Takım çalışmasına yatkın"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Her gereksinimi yeni satıra yazın
              </p>
            </div>

            {/* Salary and Employment Type */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salary">Maaş (₺) *</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="15000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentType">Çalışma Türü *</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(value) => setFormData({ ...formData, employmentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Tam Zamanlı</SelectItem>
                    <SelectItem value="Part-time">Yarı Zamanlı</SelectItem>
                    <SelectItem value="Contract">Sözleşmeli</SelectItem>
                    <SelectItem value="Temporary">Geçici</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Son Başvuru Tarihi *</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/owner/restaurants/${restaurantId}/job-postings`)}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  "İlanı Yayınla"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
