'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, Loader2, MapPin, Upload, X } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

interface Restaurant {
  id: string
  name: string
  address: string
  phoneNumber: string
  email?: string
  website?: string
  description: string
  imageUrl?: string
  category: string
  latitude?: number
  longitude?: number
  ownerId: string
  rate: number
}

const RESTAURANT_CATEGORIES = [
  { value: '0', label: 'Turkish' },
  { value: '1', label: 'Italian' },
  { value: '2', label: 'Japanese' },
  { value: '3', label: 'Chinese' },
  { value: '4', label: 'American' },
  { value: '5', label: 'Mexican' },
  { value: '6', label: 'Indian' },
  { value: '7', label: 'FastFood' },
  { value: '8', label: 'Seafood' },
  { value: '9', label: 'Vegan' },
  { value: '10', label: 'Dessert' },
  { value: '11', label: 'Other' },
]

export default function EditRestaurantPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    email: '',
    website: '',
    description: '',
    category: '',
    latitude: '',
    longitude: '',
    imageUrl: '',
  })

  useEffect(() => {
    if (params.id) {
      fetchRestaurant(params.id as string)
    }
  }, [params.id])

  const fetchRestaurant = async (id: string) => {
    try {
      setLoading(true)
      const data = await adminApi.getRestaurantById(id)
      
      setFormData({
        name: data.name || '',
        address: data.address || '',
        phoneNumber: data.phoneNumber || '',
        email: data.email || '',
        website: data.website || '',
        description: data.description || '',
        category: data.category || '',
        latitude: data.latitude?.toString() || '',
        longitude: data.longitude?.toString() || '',
        imageUrl: data.imageUrl || '',
      })
      
      if (data.imageUrl) {
        setImagePreview(data.imageUrl)
      }
    } catch (error: any) {
      console.error('Error fetching restaurant:', error)
      toast({
        title: 'Hata',
        description: error.message || 'Restoran bilgileri yüklenemedi',
        variant: 'destructive',
      })
      router.push('/admin/restaurants')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Hata',
          description: 'Lütfen bir resim dosyası seçin',
          variant: 'destructive',
        })
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Hata',
          description: 'Dosya boyutu en fazla 5MB olabilir',
          variant: 'destructive',
        })
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(formData.imageUrl || null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updateData = new FormData()
      updateData.append('Name', formData.name)
      updateData.append('Address', formData.address)
      updateData.append('PhoneNumber', formData.phoneNumber)
      updateData.append('Description', formData.description)
      
      if (formData.email) updateData.append('Email', formData.email)
      if (formData.website) updateData.append('Website', formData.website)
      if (formData.category) updateData.append('Category', formData.category)
      
      // Convert coordinates to proper format - ensure dot is used as decimal separator
      if (formData.latitude) {
        const lat = formData.latitude.toString().replace(',', '.')
        updateData.append('Latitude', lat)
      }
      if (formData.longitude) {
        const lng = formData.longitude.toString().replace(',', '.')
        updateData.append('Longitude', lng)
      }
      
      if (imageFile) updateData.append('ImageFile', imageFile)

      await adminApi.updateRestaurant(params.id as string, updateData)

      toast({
        title: 'Başarılı!',
        description: 'Restoran bilgileri güncellendi',
      })

      router.push('/admin/restaurants')
    } catch (error: any) {
      console.error('Error updating restaurant:', error)
      toast({
        title: 'Hata',
        description: error.message || 'Restoran güncellenemedi',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/restaurants')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri Dön
        </Button>
        <h1 className="text-3xl font-bold">Restoran Düzenle</h1>
        <p className="text-muted-foreground">Restoran bilgilerini güncelleyin</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Ana Bilgiler */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Temel Bilgiler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <Label htmlFor="name">Restoran Adı *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                    <Label htmlFor="category">Kategori</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {RESTAURANT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Açıklama *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>İletişim Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Adres *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="phoneNumber">Telefon *</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Konum Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Restoranın haritada görünmesi için koordinat bilgilerini girin.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="latitude">Enlem (Latitude)</Label>
                    <Input
                      id="latitude"
                      type="text"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="Örn: 41.0082"
                      pattern="[0-9.,\-]+"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Nokta veya virgül kullanabilirsiniz
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="longitude">Boylam (Longitude)</Label>
                    <Input
                      id="longitude"
                      type="text"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="Örn: 28.9784"
                      pattern="[0-9.,\-]+"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Nokta veya virgül kullanabilirsiniz
                    </p>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    💡 Koordinat Nasıl Bulunur?
                  </p>
                  <ol className="text-xs text-blue-700 space-y-1 ml-4 list-decimal">
                    <li>Google Maps'te restoranı bulun</li>
                    <li>Konuma sağ tıklayın</li>
                    <li>Koordinatları kopyalayın (ilk sayı: Latitude, ikinci: Longitude)</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Yan Panel - Resim */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Restoran Resmi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="Restaurant preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-muted-foreground">
                      Henüz resim yüklenmemiş
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="image">Yeni Resim Yükle</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maksimum 5MB, JPG, PNG veya WebP
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Değişiklikleri Kaydet
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/admin/restaurants')}
                >
                  İptal
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
