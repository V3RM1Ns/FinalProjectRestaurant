"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Gift, Plus, ArrowLeft, Pencil, Trash2, Loader2 } from 'lucide-react'
import { OwnerApi, type Reward, type CreateRewardDto, type UpdateRewardDto } from '@/lib/owner-api'
import { useAuth } from '@/contexts/auth-context'
import { UserRole } from '@/types'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function RestaurantRewardsPage() {
  const params = useParams()
  const router = useRouter()
  const { hasRole } = useAuth()
  const { toast } = useToast()
  const restaurantId = params.restaurantId as string

  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [deletingReward, setDeletingReward] = useState<Reward | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pointsRequired: 0,
    discountAmount: 0,
    discountPercentage: 0,
    imageUrl: '',
    isActive: true,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    maxRedemptions: 0,
  })

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (!hasRole(UserRole.Owner)) {
      router.push('/unauthorized')
      return
    }
    fetchRewards()
  }, [restaurantId, hasRole])

  const fetchRewards = async () => {
    try {
      setLoading(true)
      const data = await OwnerApi.getRewards(restaurantId)
      setRewards(data)
    } catch (error) {
      console.error('Error fetching rewards:', error)
      toast({
        title: 'Hata',
        description: 'Ödüller yüklenirken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (reward?: Reward) => {
    if (reward) {
      setEditingReward(reward)
      setFormData({
        name: reward.name,
        description: reward.description,
        pointsRequired: reward.pointsRequired,
        discountAmount: reward.discountAmount || 0,
        discountPercentage: reward.discountPercentage || 0,
        imageUrl: reward.imageUrl || '',
        isActive: reward.isActive,
        startDate: reward.startDate ? new Date(reward.startDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        endDate: reward.endDate ? new Date(reward.endDate).toISOString().slice(0, 16) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        maxRedemptions: reward.maxRedemptions || 0,
      })
      setImagePreview(reward.imageUrl || null)
    } else {
      setEditingReward(null)
      setFormData({
        name: '',
        description: '',
        pointsRequired: 0,
        discountAmount: 0,
        discountPercentage: 0,
        imageUrl: '',
        isActive: true,
        startDate: new Date().toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        maxRedemptions: 0,
      })
      setImagePreview(null)
    }
    setSelectedImage(null)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingReward(null)
    setFormData({
      name: '',
      description: '',
      pointsRequired: 0,
      discountAmount: 0,
      discountPercentage: 0,
      imageUrl: '',
      isActive: true,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      maxRedemptions: 0,
    })
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Hata',
          description: 'Görsel boyutu 5MB\'dan küçük olmalıdır.',
          variant: 'destructive',
        })
        return
      }
      
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setFormData({ ...formData, imageUrl: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description || formData.pointsRequired <= 0) {
      toast({
        title: 'Hata',
        description: 'Lütfen tüm zorunlu alanları doldurun.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const rewardData: any = {
        name: formData.name,
        description: formData.description,
        pointsRequired: formData.pointsRequired,
        discountAmount: formData.discountAmount || 0,
        discountPercentage: formData.discountPercentage || 0,
        imageUrl: formData.imageUrl || 'string',
        isActive: formData.isActive,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        maxRedemptions: formData.maxRedemptions || 0,
      }

      if (editingReward) {
        await OwnerApi.updateReward(editingReward.id, rewardData)
        toast({
          title: 'Başarılı',
          description: 'Ödül başarıyla güncellendi.',
        })
      } else {
        // Create için restaurantId ekliyoruz
        rewardData.restaurantId = restaurantId
        await OwnerApi.createReward(rewardData)
        toast({
          title: 'Başarılı',
          description: 'Ödül başarıyla oluşturuldu.',
        })
      }
      handleCloseDialog()
      fetchRewards()
    } catch (error: any) {
      console.error('Error saving reward:', error)
      toast({
        title: 'Hata',
        description: error.message || 'Ödül kaydedilirken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingReward) return

    try {
      await OwnerApi.deleteReward(deletingReward.id)
      toast({
        title: 'Başarılı',
        description: 'Ödül başarıyla silindi.',
      })
      setDeletingReward(null)
      fetchRewards()
    } catch (error: any) {
      console.error('Error deleting reward:', error)
      toast({
        title: 'Hata',
        description: error.message || 'Ödül silinirken bir hata oluştu.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Ödüller yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push(`/owner/dashboard`)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard'a Dön
            </Button>
          </div>
          <h1 className="text-3xl font-bold flex items-center">
            <Gift className="mr-2" />
            Ödüller
          </h1>
          <p className="text-muted-foreground">
            Restoranınız için sadakat ödüllerini yönetin
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Toplam: {rewards.length} ödül
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Ödül Ekle
        </Button>
      </div>

      {rewards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz ödül yok</h3>
            <p className="text-muted-foreground mb-4">
              İlk ödülünüzü oluşturarak müşterilerinizi ödüllendirin
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              İlk Ödülü Oluştur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => (
            <Card key={reward.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{reward.name}</CardTitle>
                    <CardDescription className="mt-2">{reward.description}</CardDescription>
                  </div>
                  <Badge variant={reward.isActive ? 'default' : 'secondary'}>
                    {reward.isActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                  <span className="text-sm font-medium">Gereken Puan</span>
                  <span className="text-2xl font-bold text-primary">{reward.pointsRequired}</span>
                </div>
                {(reward.discountAmount > 0 || reward.discountPercentage > 0) && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">İndirim: </span>
                    {reward.discountAmount > 0 && (
                      <span className="text-lg font-bold text-green-600">₺{reward.discountAmount}</span>
                    )}
                    {reward.discountPercentage > 0 && (
                      <span className="text-lg font-bold text-green-600 ml-2">%{reward.discountPercentage}</span>
                    )}
                  </div>
                )}
                {reward.maxRedemptions > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Kullanım: {reward.currentRedemptions} / {reward.maxRedemptions}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {new Date(reward.startDate).toLocaleDateString('tr-TR')} - {new Date(reward.endDate).toLocaleDateString('tr-TR')}
                </div>
                <div className="flex gap-2 pt-3 border-t">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleOpenDialog(reward)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Düzenle
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => setDeletingReward(reward)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingReward ? 'Ödülü Düzenle' : 'Yeni Ödül Oluştur'}
              </DialogTitle>
              <DialogDescription>
                Ödül bilgilerini girin. Müşteriler puanlarını bu ödüller için kullanabilecek.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Ödül Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Ücretsiz İçecek"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Açıklama *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ödül hakkında detaylı açıklama"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="pointsRequired">Gereken Puan *</Label>
                  <Input
                    id="pointsRequired"
                    type="number"
                    min="1"
                    value={formData.pointsRequired}
                    onChange={(e) => setFormData({ ...formData, pointsRequired: parseInt(e.target.value) || 0 })}
                    placeholder="100"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxRedemptions">Maksimum Kullanım</Label>
                  <Input
                    id="maxRedemptions"
                    type="number"
                    min="0"
                    value={formData.maxRedemptions}
                    onChange={(e) => setFormData({ ...formData, maxRedemptions: parseInt(e.target.value) || 0 })}
                    placeholder="0 = Sınırsız"
                  />
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">İndirim Bilgileri</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="discountAmount">İndirim Tutarı (₺)</Label>
                    <Input
                      id="discountAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discountAmount}
                      onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="discountPercentage">İndirim Yüzdesi (%)</Label>
                    <Input
                      id="discountPercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Not: Hem tutar hem de yüzde girebilirsiniz. İkisi de uygulanacaktır.
                </p>
              </div>
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">Ödül Görseli</h4>
                <div className="grid gap-3">
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <img 
                        src={imagePreview} 
                        alt="Ödül önizleme" 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="rewardImage">Görsel Yükle</Label>
                    <Input
                      id="rewardImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG veya WEBP (Maks. 5MB)
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <strong>veya</strong>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="imageUrl">Görsel URL'si</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://example.com/reward-image.jpg"
                      disabled={!!selectedImage}
                    />
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">Geçerlilik Tarihleri</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">Bitiş Tarihi</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <Label htmlFor="isActive" className="font-semibold">Ödül Aktif Mi?</Label>
                  <p className="text-xs text-muted-foreground">Müşteriler bu ödülü görebilir ve kullanabilir</p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>
            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                İptal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingReward ? 'Güncelle' : 'Oluştur'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingReward} onOpenChange={() => setDeletingReward(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ödülü Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletingReward?.name}</strong> ödülünü silmek istediğinizden emin misiniz? 
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
