"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Briefcase, ArrowLeft, ChevronLeft, ChevronRight, Mail, Phone, CheckCircle, XCircle, Download, FileText } from 'lucide-react'
import { OwnerApi } from '@/lib/owner-api'
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
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface JobApplication {
  id: string
  jobPostingId: string
  jobTitle: string
  restaurantName: string
  applicantId: string
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  coverLetter: string
  cvUrl?: string
  status: string
  applicationDate: string
  reviewedDate?: string
  reviewNotes?: string
}

export default function JobApplicationsPage() {
  const params = useParams()
  const router = useRouter()
  const { hasRole } = useAuth()
  const { toast } = useToast()
  const restaurantId = params.id as string
  const [data, setData] = useState<import('@/lib/owner-api').PaginatedResponse<JobApplication> | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [showPendingOnly, setShowPendingOnly] = useState(true)
  const pageSize = 10
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)

  useEffect(() => {
    if (!hasRole(UserRole.Owner)) {
      router.push('/unauthorized')
      return
    }
    fetchApplications()
  }, [restaurantId, currentPage, showPendingOnly, hasRole])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      
      if (showPendingOnly) {
        const response = await OwnerApi.getPendingJobApplications(restaurantId, currentPage, pageSize) as any
        setData(response)
      } else {
        const response = await OwnerApi.getJobApplications(restaurantId, currentPage, pageSize) as any
        setData(response)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast({
        title: "Error",
        description: "Failed to load job applications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (applicationId: string) => {
    try {
      await OwnerApi.acceptJobApplication(applicationId)
      toast({
        title: "Başarılı",
        description: "Başvuru başarıyla kabul edildi",
      })
      fetchApplications()
    } catch (error: any) {
      console.error('Error accepting application:', error)
      toast({
        title: "Hata",
        description: error?.message || "Başvuru kabul edilirken hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (applicationId: string, reason?: string) => {
    try {
      await OwnerApi.rejectJobApplication(applicationId, reason)
      toast({
        title: "Başarılı",
        description: "Başvuru reddedildi",
      })
      fetchApplications()
    } catch (error: any) {
      console.error('Error rejecting application:', error)
      toast({
        title: "Hata",
        description: error?.message || "Başvuru reddedilirken hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleDownloadCV = async (application: JobApplication) => {
    try {
      if (!application.cvUrl) {
        toast({
          title: "Hata",
          description: "CV dosyası bulunamadı",
          variant: "destructive",
        })
        return
      }

      // CV URL'ini tam URL'e çevir
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const cvUrl = application.cvUrl.startsWith('http') 
        ? application.cvUrl 
        : `${baseUrl}${application.cvUrl}`

      // Token'ı al
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      
      // Fetch ile dosyayı indir
      const response = await fetch(cvUrl, {
        method: 'GET',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (!response.ok) {
        throw new Error('CV indirilemedi')
      }

      // Blob'a çevir
      const blob = await response.blob()
      
      // Dosya adını belirle
      const fileName = `CV_${application.applicantName.replace(/\s+/g, '_')}.pdf`
      
      // İndirme linkini oluştur
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Başarılı",
        description: "CV başarıyla indirildi",
      })
    } catch (error: any) {
      console.error('Error downloading CV:', error)
      toast({
        title: "Hata",
        description: error?.message || "CV indirilirken hata oluştu",
        variant: "destructive",
      })
    }
  }

  const openRejectDialog = (applicationId: string) => {
    setSelectedApplicationId(applicationId)
    setRejectionReason('')
    setRejectDialogOpen(true)
  }

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Uyarı",
        description: "Lütfen bir red sebebi giriniz",
        variant: "destructive",
      })
      return
    }

    if (!selectedApplicationId) return

    setIsRejecting(true)
    await handleReject(selectedApplicationId, rejectionReason)
    setIsRejecting(false)
    setRejectDialogOpen(false)
    setSelectedApplicationId(null)
    setRejectionReason('')
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Pending: "secondary",
      Accepted: "default",
      Rejected: "destructive",
    }

    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/owner/dashboard`)}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold flex items-center">
            <Briefcase className="mr-2" />
            Job Applications
          </h1>
          {data && (
            <p className="text-sm text-muted-foreground mt-1">
              Total: {data.totalCount} application{data.totalCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={showPendingOnly ? "default" : "outline"}
            onClick={() => {
              setShowPendingOnly(true)
              setCurrentPage(1)
            }}
          >
            Pending Only
          </Button>
          <Button
            variant={!showPendingOnly ? "default" : "outline"}
            onClick={() => {
              setShowPendingOnly(false)
              setCurrentPage(1)
            }}
          >
            All Applications
          </Button>
        </div>
      </div>

      {!data || data.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications found</h3>
            <p className="text-muted-foreground">
              {showPendingOnly
                ? "No pending job applications at the moment"
                : "No job applications have been submitted yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {data.items.map((application) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{application.applicantName}</CardTitle>
                      <CardDescription>
                        Applied for: {application.jobTitle}
                      </CardDescription>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{application.applicantEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{application.applicantPhone}</span>
                    </div>
                    <div className="text-muted-foreground">
                      Applied: {new Date(application.applicationDate).toLocaleDateString('tr-TR')}
                    </div>
                  </div>

                  {/* Cover Letter Preview */}
                  <div className="border-l-4 border-primary pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Ön Yazı:</p>
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md whitespace-pre-line">
                      {application.coverLetter}
                    </p>
                  </div>

                  {application.reviewedDate && application.reviewNotes && (
                    <div>
                      <p className="text-sm font-medium mb-2">Review Notes:</p>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {application.reviewNotes}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Reviewed: {new Date(application.reviewedDate).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  )}

                  {application.status === "Pending" && (
                    <div className="flex flex-col gap-3 pt-4 border-t">
                      {/* CV Download Button - Büyük ve üstte */}
                      {application.cvUrl && (
                        <Button
                          size="lg"
                          variant="outline"
                          className="w-full gap-2 font-semibold"
                          onClick={() => handleDownloadCV(application)}
                        >
                          <Download className="h-5 w-5" />
                          CV İndir
                        </Button>
                      )}
                      
                      {/* Accept/Reject Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1"
                          onClick={() => handleAccept(application.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Kabul Et
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => openRejectDialog(application.id)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reddet
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={!data.hasPreviousPage}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!data.hasNextPage}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Reject Application Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting the application.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejection"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={isRejecting}
            >
              {isRejecting ? 'Rejecting...' : 'Reject'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
