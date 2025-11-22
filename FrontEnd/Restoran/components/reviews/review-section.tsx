"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { customerApi } from "@/lib/customer-api"

interface Review {
  id: string
  restaurantId: string
  customerId: string
  customerName: string
  customerEmail?: string
  rating: number
  comment: string
  status: string
  ownerResponse?: string
  respondedAt?: string
  createdAt: string
  isReported?: boolean
  reportReason?: string
  reportedAt?: string
}

interface ReviewSectionProps {
  restaurantId: string
  restaurantName: string
}

export function ReviewSection({ restaurantId, restaurantName }: ReviewSectionProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canReview, setCanReview] = useState(false)
  const [myReview, setMyReview] = useState<Review | null>(null)
  const [averageRating, setAverageRating] = useState("0.0")

  useEffect(() => {
    fetchReviews()
    if (user) {
      checkCanReview()
      fetchMyReview()
    }
  }, [restaurantId, user])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await customerApi.restaurants.getReviews(restaurantId, 1, 50)
      
      // Handle both paginated and non-paginated responses
      const reviewsList = response.items || response.data || response || []
      const allReviews = Array.isArray(reviewsList) ? reviewsList : []
      setReviews(allReviews)
      
      // Calculate average rating from all approved reviews
      const approved = allReviews.filter((r: Review) => r.status === "Approved")
      if (approved.length > 0) {
        const avg = approved.reduce((sum: number, r: Review) => sum + r.rating, 0) / approved.length
        setAverageRating(avg.toFixed(1))
      } else {
        setAverageRating("0.0")
      }
    } catch (error: any) {
      console.error('Error fetching reviews:', error)
      setReviews([])
      setAverageRating("0.0")
    } finally {
      setLoading(false)
    }
  }

  const checkCanReview = async () => {
    try {
      const canReviewResult = await customerApi.restaurants.canReview(restaurantId)
      setCanReview(canReviewResult)
    } catch (error) {
      setCanReview(false)
    }
  }

  const fetchMyReview = async () => {
    try {
      const review = await customerApi.restaurants.getMyReview(restaurantId)
      setMyReview(review)
      if (review) {
        setRating(review.rating)
        setComment(review.comment)
      }
    } catch (error) {
      // No review found is ok
      setMyReview(null)
    }
  }

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Giriş gerekli",
        description: "Yorum yapmak için müşteri olarak giriş yapmalısınız.",
        variant: "destructive",
      })
      return
    }

    if (rating === 0) {
      toast({
        title: "Puan seçin",
        description: "Lütfen bir puan seçin.",
        variant: "destructive",
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: "Yorum yazın",
        description: "Lütfen bir yorum yazın.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (myReview) {
        // Update existing review
        await customerApi.reviews.update(myReview.id, {
          rating,
          comment: comment.trim(),
        })
        toast({
          title: "Yorum güncellendi",
          description: "Yorumunuz başarıyla güncellendi.",
        })
      } else {
        // Create new review
        await customerApi.reviews.create({
          restaurantId,
          rating,
          comment: comment.trim(),
        })
        toast({
          title: "Yorum gönderildi",
          description: "Yorumunuz admin onayından sonra yayınlanacaktır.",
        })
      }

      // Refresh data
      setRating(0)
      setComment("")
      await fetchReviews()
      await fetchMyReview()
      await checkCanReview()
    } catch (error: any) {
      console.error('Error submitting review:', error)
      toast({
        title: "Hata",
        description: error.message || "Yorum gönderilirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter approved reviews
  const approvedReviews = reviews.filter((r) => r.status === "Approved")

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Değerlendirmeler</CardTitle>
          <CardDescription>
            {approvedReviews.length} değerlendirme • Ortalama {averageRating} puan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-6 w-6 ${
                  star <= Math.round(Number(averageRating))
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
            <span className="text-2xl font-bold ml-2">{averageRating}</span>
          </div>
        </CardContent>
      </Card>

      {/* Write Review */}
      {user && (canReview || myReview) && (
        <Card>
          <CardHeader>
            <CardTitle>{myReview ? "Yorumunuzu Düzenleyin" : "Değerlendirme Yaz"}</CardTitle>
            <CardDescription>Deneyiminizi diğer müşterilerle paylaşın</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Puanınız</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
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
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>

            <Button onClick={handleSubmitReview} disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gönderiliyor...
                </>
              ) : myReview ? (
                "Yorumu Güncelle"
              ) : (
                "Yorum Gönder"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Müşteri Yorumları</h3>
        {approvedReviews.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Henüz onaylanmış yorum bulunmuyor.
            </CardContent>
          </Card>
        ) : (
          approvedReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>{review.customerName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">{review.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                    {review.ownerResponse && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Restoran Yanıtı:</p>
                        <p className="text-sm text-muted-foreground">{review.ownerResponse}</p>
                        {review.respondedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(review.respondedAt).toLocaleDateString("tr-TR")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

