"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Star, Check, X } from "lucide-react"
import type { Review } from "@/types"
import { ReviewStatus } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
    status: ReviewStatus.Pending,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isDeleted: false,
  },
  {
    id: "3",
    restaurantId: "2",
    customerId: "3",
    customerName: "Mehmet Kaya",
    rating: 2,
    comment: "Çok kötü bir deneyimdi. Yemekler soğuktu ve servis çok yavaştı.",
    status: ReviewStatus.Pending,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    isDeleted: false,
  },
  {
    id: "4",
    restaurantId: "1",
    customerId: "4",
    customerName: "Fatma Şahin",
    rating: 1,
    comment: "Kesinlikle tavsiye etmiyorum. Hijyen çok kötüydü.",
    status: ReviewStatus.Rejected,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isDeleted: false,
  },
]

export default function AdminReviewsPage() {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [adminResponse, setAdminResponse] = useState("")

  const handleApprove = async (reviewId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    setReviews(reviews.map((r) => (r.id === reviewId ? { ...r, status: ReviewStatus.Approved } : r)))

    toast({
      title: "Yorum onaylandı",
      description: "Yorum başarıyla onaylandı ve yayınlandı.",
    })
  }

  const handleReject = async (reviewId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    setReviews(reviews.map((r) => (r.id === reviewId ? { ...r, status: ReviewStatus.Rejected } : r)))

    toast({
      title: "Yorum reddedildi",
      description: "Yorum reddedildi ve yayınlanmayacak.",
    })
  }

  const handleAddResponse = async () => {
    if (!selectedReview || !adminResponse.trim()) return

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    setReviews(
      reviews.map((r) =>
        r.id === selectedReview.id ? { ...r, adminResponse: adminResponse.trim(), status: ReviewStatus.Approved } : r,
      ),
    )

    toast({
      title: "Yanıt eklendi",
      description: "Restoran yanıtı başarıyla eklendi.",
    })

    setSelectedReview(null)
    setAdminResponse("")
  }

  const pendingReviews = reviews.filter((r) => r.status === ReviewStatus.Pending)
  const approvedReviews = reviews.filter((r) => r.status === ReviewStatus.Approved)
  const rejectedReviews = reviews.filter((r) => r.status === ReviewStatus.Rejected)

  const ReviewCard = ({ review }: { review: Review }) => (
    <Card>
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
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
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
                <Badge
                  variant={
                    review.status === ReviewStatus.Approved
                      ? "default"
                      : review.status === ReviewStatus.Rejected
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {review.status === ReviewStatus.Approved
                    ? "Onaylandı"
                    : review.status === ReviewStatus.Rejected
                      ? "Reddedildi"
                      : "Bekliyor"}
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground mb-3">{review.comment}</p>
            {review.adminResponse && (
              <div className="mb-3 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Restoran Yanıtı:</p>
                <p className="text-sm text-muted-foreground">{review.adminResponse}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              {review.status === ReviewStatus.Pending && (
                <>
                  <Button size="sm" onClick={() => handleApprove(review.id)}>
                    <Check className="h-4 w-4 mr-1" />
                    Onayla
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReject(review.id)}>
                    <X className="h-4 w-4 mr-1" />
                    Reddet
                  </Button>
                </>
              )}
              {review.status === ReviewStatus.Approved && !review.adminResponse && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedReview(review)
                        setAdminResponse("")
                      }}
                    >
                      Yanıt Ekle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Restoran Yanıtı Ekle</DialogTitle>
                      <DialogDescription>Bu yoruma restoran adına yanıt verin</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">{review.customerName}</p>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                      <Textarea
                        placeholder="Yanıtınızı yazın..."
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        rows={4}
                      />
                      <Button onClick={handleAddResponse} className="w-full">
                        Yanıtı Kaydet
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Yorum Yönetimi</h1>
        <p className="text-muted-foreground">Müşteri yorumlarını inceleyin ve yönetin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{pendingReviews.length}</CardTitle>
            <CardDescription>Bekleyen Yorumlar</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{approvedReviews.length}</CardTitle>
            <CardDescription>Onaylanan Yorumlar</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{rejectedReviews.length}</CardTitle>
            <CardDescription>Reddedilen Yorumlar</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Bekleyen ({pendingReviews.length})</TabsTrigger>
          <TabsTrigger value="approved">Onaylanan ({approvedReviews.length})</TabsTrigger>
          <TabsTrigger value="rejected">Reddedilen ({rejectedReviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingReviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">Bekleyen yorum bulunmuyor.</CardContent>
            </Card>
          ) : (
            pendingReviews.map((review) => <ReviewCard key={review.id} review={review} />)
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedReviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">Onaylanmış yorum bulunmuyor.</CardContent>
            </Card>
          ) : (
            approvedReviews.map((review) => <ReviewCard key={review.id} review={review} />)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedReviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Reddedilmiş yorum bulunmuyor.
              </CardContent>
            </Card>
          ) : (
            rejectedReviews.map((review) => <ReviewCard key={review.id} review={review} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
