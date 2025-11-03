"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { OwnerApi } from "@/lib/owner-api"
import { UserRole } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Star, ThumbsUp, ThumbsDown } from "lucide-react"
import Link from "next/link"

export default function OwnerReviewsPage() {
  const { hasRole } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const restaurantId = searchParams.get("restaurant")

  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPendingOnly, setShowPendingOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [responseText, setResponseText] = useState<{ [key: number]: string }>({})

  useEffect(() => {
    if (!hasRole(UserRole.Owner)) {
      router.push("/unauthorized")
      return
    }

    if (restaurantId) {
      loadReviews()
    }
  }, [hasRole, router, restaurantId, showPendingOnly, currentPage])

  const loadReviews = async () => {
    if (!restaurantId) return

    try {
      setIsLoading(true)
      const response = showPendingOnly
        ? await OwnerApi.getPendingReviews(restaurantId, currentPage, 10)
        : await OwnerApi.getReviews(restaurantId, currentPage, 10)

      setReviews(response.items || [])
      setTotalPages(response.totalPages || 1)
    } catch (error) {
      console.error("Error loading reviews:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (reviewId: number) => {
    try {
      await OwnerApi.approveReview(reviewId)
      loadReviews()
    } catch (error) {
      console.error("Error approving review:", error)
    }
  }

  const handleReject = async (reviewId: number) => {
    try {
      await OwnerApi.rejectReview(reviewId)
      loadReviews()
    } catch (error) {
      console.error("Error rejecting review:", error)
    }
  }

  const handleRespond = async (reviewId: number) => {
    const response = responseText[reviewId]
    if (!response?.trim()) return

    try {
      await OwnerApi.respondToReview(reviewId, response)
      setResponseText({ ...responseText, [reviewId]: "" })
      loadReviews()
    } catch (error) {
      console.error("Error responding to review:", error)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  if (!restaurantId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Restoran Seçilmedi</CardTitle>
            <CardDescription>Lütfen bir restoran seçin.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Star className="mr-2" />
            Yorumlar
          </h1>
          <p className="text-muted-foreground">Müşteri yorumlarını yönetin</p>
        </div>
        <Link href="/owner/dashboard">
          <Button variant="outline">Dashboard'a Dön</Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <Button
          variant={showPendingOnly ? "default" : "outline"}
          onClick={() => setShowPendingOnly(!showPendingOnly)}
        >
          {showPendingOnly ? "Tüm Yorumlar" : "Bekleyen Yorumlar"}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Yorum bulunamadı.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{review.customerName || "Anonim"}</CardTitle>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>
                  {review.status && (
                    <Badge
                      variant={
                        review.status === "Approved"
                          ? "default"
                          : review.status === "Rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {review.status}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{review.comment}</p>

                {review.ownerResponse && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Restoran Yanıtı:</p>
                    <p className="text-sm">{review.ownerResponse}</p>
                  </div>
                )}

                {review.status === "Pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="default" onClick={() => handleApprove(review.id)}>
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Onayla
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(review.id)}>
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Reddet
                    </Button>
                  </div>
                )}

                {review.status === "Approved" && !review.ownerResponse && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Yoruma yanıt yazın..."
                      value={responseText[review.id] || ""}
                      onChange={(e) =>
                        setResponseText({ ...responseText, [review.id]: e.target.value })
                      }
                    />
                    <Button size="sm" onClick={() => handleRespond(review.id)}>
                      Yanıt Gönder
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Önceki
          </Button>
          <span className="py-2 px-4">
            Sayfa {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Sonraki
          </Button>
        </div>
      )}
    </div>
  )
}

