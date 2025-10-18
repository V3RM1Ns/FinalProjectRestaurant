"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { Review } from "@/types"
import { ReviewStatus, UserRole } from "@/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ReviewSectionProps {
  restaurantId: string
  restaurantName: string
}

// Mock reviews data
const mockReviews: Review[] = [
  {
    id: "1",
    restaurantId: "1",
    customerId: "1",
    customerName: "Ahmet Yılmaz",
    rating: 5,
    comment: "Harika bir deneyimdi! Yemekler çok lezzetliydi ve servis mükemmeldi.",
    status: ReviewStatus.Approved,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isDeleted: false,
  },
  {
    id: "2",
    restaurantId: "1",
    customerId: "2",
    customerName: "Ayşe Demir",
    rating: 4,
    comment: "Güzel bir mekan, yemekler lezzetli. Sadece servis biraz yavaştı.",
    status: ReviewStatus.Approved,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isDeleted: false,
  },
  {
    id: "3",
    restaurantId: "1",
    customerId: "3",
    customerName: "Mehmet Kaya",
    rating: 5,
    comment: "Kesinlikle tavsiye ederim. Özellikle İskender kebap muhteşemdi!",
    status: ReviewStatus.Approved,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isDeleted: false,
  },
]

export function ReviewSection({ restaurantId, restaurantName }: ReviewSectionProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isCustomer = user?.roles.includes(UserRole.Customer)
  const approvedReviews = reviews.filter((r) => r.status === ReviewStatus.Approved)

  const handleSubmitReview = async () => {
    if (!user || !isCustomer) {
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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newReview: Review = {
      id: Date.now().toString(),
      restaurantId,
      customerId: user.id,
      customerName: user.fullName,
      rating,
      comment: comment.trim(),
      status: ReviewStatus.Pending,
      createdAt: new Date().toISOString(),
      isDeleted: false,
    }

    setReviews([newReview, ...reviews])
    setRating(0)
    setComment("")
    setIsSubmitting(false)

    toast({
      title: "Yorum gönderildi",
      description: "Yorumunuz admin onayından sonra yayınlanacaktır.",
    })
  }

  const averageRating = approvedReviews.length
    ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
    : "0.0"

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
      {isCustomer && (
        <Card>
          <CardHeader>
            <CardTitle>Değerlendirme Yaz</CardTitle>
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
              {isSubmitting ? "Gönderiliyor..." : "Yorum Gönder"}
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
                    {review.adminResponse && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Restoran Yanıtı:</p>
                        <p className="text-sm text-muted-foreground">{review.adminResponse}</p>
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
