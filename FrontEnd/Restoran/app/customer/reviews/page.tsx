'use client'

import { useEffect, useState } from 'react'
import { customerApi } from '@/lib/customer-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, Edit, Trash2, MessageSquare } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function CustomerReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingReview, setEditingReview] = useState<any>(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      const data = await customerApi.reviews.getMyReviews(1, 100)
      setReviews(data.items || data)
    } catch (error) {
      console.error('Error loading reviews:', error)
      toast({
        title: 'Hata',
        description: 'Yorumlar yüklenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditReview = (review: any) => {
    setEditingReview(review)
    setEditRating(review.rating)
    setEditComment(review.comment)
  }

  const handleSaveEdit = async () => {
    if (!editingReview) return

    try {
      await customerApi.reviews.update(editingReview.id, {
        rating: editRating,
        comment: editComment,
      })
      toast({
        title: 'Başarılı',
        description: 'Yorum başarıyla güncellendi',
      })
      setEditingReview(null)
      loadReviews()
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Yorum güncellenirken bir hata oluştu',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return

    try {
      await customerApi.reviews.delete(reviewId)
      toast({
        title: 'Başarılı',
        description: 'Yorum başarıyla silindi',
      })
      loadReviews()
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Yorum silinirken bir hata oluştu',
        variant: 'destructive',
      })
    }
  }

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer' : ''}`}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    )
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
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-8 w-8" />
          Yorumlarım
        </h1>
        <p className="text-muted-foreground">Yaptığınız yorumları görüntüleyin ve düzenleyin</p>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Henüz yorum yapmadınız</p>
            <Button asChild>
              <a href="/customer/orders">Siparişlerinizi Değerlendirin</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle>{review.restaurantName}</CardTitle>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditReview(review)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Yorumu Düzenle</DialogTitle>
                          <DialogDescription>
                            {review.restaurantName} için yorumunuzu düzenleyin
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Puan</Label>
                            {renderStars(editRating, true, setEditRating)}
                          </div>
                          <div className="space-y-2">
                            <Label>Yorumunuz</Label>
                            <Textarea
                              placeholder="Deneyiminizi paylaşın..."
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                              rows={5}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditingReview(null)}>
                            İptal
                          </Button>
                          <Button onClick={handleSaveEdit}>Kaydet</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteReview(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{review.comment}</p>
                {review.response && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Restoran Yanıtı:</p>
                    <p className="text-sm text-muted-foreground">{review.response}</p>
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

