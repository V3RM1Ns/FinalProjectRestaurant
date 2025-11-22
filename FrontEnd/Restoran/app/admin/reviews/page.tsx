"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Star, Check, X, Trash2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { reviewApi } from "@/lib/api"

interface Review {
  id: string
  restaurantId: string
  restaurantName: string
  customerId: string
  customerName: string
  customerEmail?: string
  rating: number
  comment: string
  status: string
  ownerResponse?: string
  respondedAt?: string
  createdAt: string
  isReported: boolean
  reportReason?: string
  reportedAt?: string
  adminNote?: string
}

interface PaginatedResponse {
  items: Review[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export default function AdminReviewsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [pendingReviews, setPendingReviews] = useState<PaginatedResponse | null>(null)
  const [allReviews, setAllReviews] = useState<PaginatedResponse | null>(null)
  const [reportedReviews, setReportedReviews] = useState<PaginatedResponse | null>(null)
  
  const [pendingPage, setPendingPage] = useState(1)
  const [allPage, setAllPage] = useState(1)
  const [reportedPage, setReportedPage] = useState(1)
  const pageSize = 10

  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)
  const [rejectError, setRejectError] = useState("")

  useEffect(() => {
    loadPendingReviews()
  }, [pendingPage])

  useEffect(() => {
    loadAllReviews()
  }, [allPage])

  useEffect(() => {
    loadReportedReviews()
  }, [reportedPage])

  const loadPendingReviews = async () => {
    try {
      setLoading(true)
      console.log('Loading pending reviews, page:', pendingPage, 'pageSize:', pageSize)
      const data = await reviewApi.admin.getPending(pendingPage, pageSize)
      console.log('Pending reviews response:', data)
      setPendingReviews(data)
    } catch (error: any) {
      console.error('Error loading pending reviews:', error)
      toast({
        title: "Hata",
        description: error.message || "Bekleyen yorumlar yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAllReviews = async () => {
    try {
      const data = await reviewApi.admin.getAll(allPage, pageSize)
      setAllReviews(data)
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Yorumlar yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const loadReportedReviews = async () => {
    try {
      const data = await reviewApi.admin.getReported(reportedPage, pageSize)
      setReportedReviews(data)
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Şikayet edilen yorumlar yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleApprove = async (reviewId: string) => {
    try {
      await reviewApi.admin.approve(reviewId)
      toast({
        title: "Başarılı",
        description: "Yorum başarıyla onaylandı",
      })
      // Reload all tabs
      loadPendingReviews()
      loadAllReviews()
      loadReportedReviews()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Yorum onaylanırken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleReject = async () => {
    if (!selectedReview) return

    // Validation - reason is required
    if (!rejectReason.trim()) {
      setRejectError("Reddetme nedeni zorunludur")
      return
    }

    if (rejectReason.trim().length < 10) {
      setRejectError("Reddetme nedeni en az 10 karakter olmalıdır")
      return
    }

    try {
      await reviewApi.admin.reject(selectedReview.id, rejectReason)
      toast({
        title: "Başarılı",
        description: "Yorum reddedildi",
      })
      setShowRejectDialog(false)
      setRejectReason("")
      setRejectError("")
      setSelectedReview(null)
      // Reload all tabs
      loadPendingReviews()
      loadAllReviews()
      loadReportedReviews()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Yorum reddedilirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!reviewToDelete) return

    try {
      await reviewApi.admin.delete(reviewToDelete)
      toast({
        title: "Başarılı",
        description: "Yorum silindi",
      })
      setShowDeleteDialog(false)
      setReviewToDelete(null)
      // Reload all tabs
      loadPendingReviews()
      loadAllReviews()
      loadReportedReviews()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Yorum silinirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const ReviewCard = ({ review, showActions = true }: { review: Review; showActions?: boolean }) => (
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
                <p className="text-sm text-muted-foreground">{review.customerEmail}</p>
                <p className="text-sm text-muted-foreground">
                  Restoran: <span className="font-medium">{review.restaurantName}</span>
                </p>
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
                    review.status === "Approved"
                      ? "default"
                      : review.status === "Rejected"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {review.status === "Approved"
                    ? "Onaylandı"
                    : review.status === "Rejected"
                      ? "Reddedildi"
                      : "Bekliyor"}
                </Badge>
                {review.isReported && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Şikayet Edildi
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-muted-foreground mb-3">{review.comment}</p>
            {review.ownerResponse && (
              <div className="mb-3 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Restoran Yanıtı:</p>
                <p className="text-sm text-muted-foreground">{review.ownerResponse}</p>
                {review.respondedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(review.respondedAt).toLocaleDateString("tr-TR")}
                  </p>
                )}
              </div>
            )}
            {review.isReported && review.reportReason && (
              <div className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm font-medium mb-1 text-destructive">Şikayet Nedeni:</p>
                <p className="text-sm text-muted-foreground">{review.reportReason}</p>
                {review.reportedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(review.reportedAt).toLocaleDateString("tr-TR")}
                  </p>
                )}
              </div>
            )}
            {showActions && (
              <div className="flex items-center gap-2">
                {review.status === "Pending" && (
                  <>
                    <Button size="sm" onClick={() => handleApprove(review.id)}>
                      <Check className="h-4 w-4 mr-1" />
                      Onayla
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedReview(review)
                        setShowRejectDialog(true)
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reddet
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReviewToDelete(review.id)
                    setShowDeleteDialog(true)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Sil
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const Pagination = ({ data, page, setPage }: { data: PaginatedResponse | null; page: number; setPage: (page: number) => void }) => {
    if (!data || data.totalPages <= 1) return null

    return (
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          Toplam {data.totalCount} sonuç - Sayfa {data.pageNumber} / {data.totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!data.hasPreviousPage}
            onClick={() => setPage(page - 1)}
          >
            Önceki
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!data.hasNextPage}
            onClick={() => setPage(page + 1)}
          >
            Sonraki
          </Button>
        </div>
      </div>
    )
  }

  if (loading && !pendingReviews) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Yorum Yönetimi</h1>
        <p className="text-muted-foreground">Müşteri yorumlarını inceleyin ve yönetin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{pendingReviews?.totalCount || 0}</CardTitle>
            <CardDescription>Bekleyen Yorumlar</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{allReviews?.totalCount || 0}</CardTitle>
            <CardDescription>Tüm Yorumlar</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{reportedReviews?.totalCount || 0}</CardTitle>
            <CardDescription>Şikayet Edilen</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Bekleyen ({pendingReviews?.totalCount || 0})</TabsTrigger>
          <TabsTrigger value="all">Tüm Yorumlar ({allReviews?.totalCount || 0})</TabsTrigger>
          <TabsTrigger value="reported">Şikayet Edilen ({reportedReviews?.totalCount || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {!pendingReviews || pendingReviews.items.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Bekleyen yorum bulunmuyor.
              </CardContent>
            </Card>
          ) : (
            <>
              {pendingReviews.items.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
              <Pagination data={pendingReviews} page={pendingPage} setPage={setPendingPage} />
            </>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {!allReviews || allReviews.items.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Yorum bulunmuyor.
              </CardContent>
            </Card>
          ) : (
            <>
              {allReviews.items.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
              <Pagination data={allReviews} page={allPage} setPage={setAllPage} />
            </>
          )}
        </TabsContent>

        <TabsContent value="reported" className="space-y-4">
          {!reportedReviews || reportedReviews.items.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Şikayet edilen yorum bulunmuyor.
              </CardContent>
            </Card>
          ) : (
            <>
              {reportedReviews.items.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
              <Pagination data={reportedReviews} page={reportedPage} setPage={setReportedPage} />
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={(open) => {
        setShowRejectDialog(open)
        if (!open) {
          setRejectReason("")
          setRejectError("")
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yorumu Reddet</DialogTitle>
            <DialogDescription>
              Bu yorumu reddetmek için bir neden belirtmelisiniz (minimum 10 karakter).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Reddetme nedeni (zorunlu, min. 10 karakter) *"
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value)
                  setRejectError("")
                }}
                rows={4}
                className={rejectError ? "border-destructive" : ""}
              />
              {rejectError && (
                <p className="text-sm text-destructive">{rejectError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {rejectReason.length} / 10 karakter (minimum)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectDialog(false)
              setRejectReason("")
              setRejectError("")
            }}>
              İptal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectReason.trim() || rejectReason.trim().length < 10}
            >
              Reddet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yorumu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu yorumu kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
