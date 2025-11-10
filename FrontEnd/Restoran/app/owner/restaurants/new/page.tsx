'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function NewRestaurantPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phoneNumber: '',
    address: '',
    website: '',
    email: '',
    category: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('auth_token') // 'token' yerine 'auth_token'
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const fullUrl = `${apiUrl}/api/Owner/restaurants`
      
      console.log('=== RESTORAN OLUŞTURMA DEBUG ===')
      console.log('API URL:', apiUrl)
      console.log('Full URL:', fullUrl)
      console.log('Token:', token ? 'Mevcut (İlk 20 karakter: ' + token.substring(0, 20) + '...)' : 'YOK!')
      console.log('Form Data:', JSON.stringify(formData, null, 2))
      
      if (!token) {
        toast({
          title: 'Hata',
          description: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.',
          variant: 'destructive',
        })
        console.error('TOKEN BULUNAMADI!')
        router.push('/login') // Login sayfasına yönlendir
        return
      }

      console.log('İstek gönderiliyor...')
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      console.log('Response Status:', response.status)
      console.log('Response Status Text:', response.statusText)
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data = await response.json()
        console.log('✅ BAŞARILI! Response Data:', data)
        toast({
          title: 'Başarılı',
          description: 'Restoran başarıyla oluşturuldu',
        })
        router.push(`/owner/restaurants/${data.id}/dashboard`)
      } else {
        const errorText = await response.text()
        console.error('❌ HATA Response Text:', errorText)
        
        let errorMessage = 'Restoran oluşturulamadı'
        try {
          const errorJson = JSON.parse(errorText)
          console.error('❌ HATA JSON:', errorJson)
          errorMessage = errorJson.message || errorJson.title || errorMessage
          
          // Validation errors varsa göster
          if (errorJson.errors) {
            console.error('Validation Errors:', errorJson.errors)
            errorMessage += '\n' + JSON.stringify(errorJson.errors, null, 2)
          }
        } catch (parseError) {
          console.error('Error response parse edilemedi:', parseError)
        }
        
        toast({
          title: 'Hata',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('❌ EXCEPTION:', error)
      console.error('Error Type:', error instanceof Error ? error.constructor.name : typeof error)
      console.error('Error Message:', error instanceof Error ? error.message : String(error))
      console.error('Error Stack:', error instanceof Error ? error.stack : 'No stack trace')
      
      toast({
        title: 'Hata',
        description: `Bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      console.log('=== İŞLEM TAMAMLANDI ===')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push('/owner/restaurants')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Restaurants
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add New Restaurant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter restaurant name"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your restaurant"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Turkish">Turkish</SelectItem>
                  <SelectItem value="Italian">Italian</SelectItem>
                  <SelectItem value="Japanese">Japanese</SelectItem>
                  <SelectItem value="American">American</SelectItem>
                  <SelectItem value="Mexican">Mexican</SelectItem>
                  <SelectItem value="Fast Food">Fast Food</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address, city, postal code"
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone *</Label>
              <Input
                id="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+90 XXX XXX XX XX"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="restaurant@example.com"
              />
            </div>

            <div>
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.example.com"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/owner/restaurants')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Restaurant'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
