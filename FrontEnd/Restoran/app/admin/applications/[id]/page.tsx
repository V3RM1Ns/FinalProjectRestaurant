'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Check, X, User, Building2, Mail, Phone, Calendar, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'

interface Application {
  id: string
  userId: string
  businessName: string
  businessDescription: string
  businessAddress: string
  businessPhone: string
  businessEmail?: string
  category: string
  additionalNotes?: string
  status: string
  applicationDate: string
  reviewedBy?: string
  reviewedAt?: string
  rejectionReason?: string
  createdAt: string
  user: {
    firstName: string
    lastName: string
  }
}

export default function AdminApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchApplication()
  }, [params.id])

  const fetchApplication = async () => {
    setLoading(true)
    try {
      const data = await api.get<Application>(`/admin/applications/${params.id}`)
      console.log('Application data:', data)
      setApplication(data)
    } catch (error: any) {
      console.error('Error fetching application:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load application details',
        variant: 'destructive',
      })
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!application) return

    setProcessing(true)
    try {
      await api.post(`/admin/applications/${application.id}/approve`, {})
      toast({
        title: 'Success',
        description: 'Application approved successfully',
      })
      router.push('/admin/dashboard')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve application',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!application || !rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason',
        variant: 'destructive',
      })
      return
    }

    setProcessing(true)
    try {
      await api.post(`/admin/applications/${application.id}/reject`, { reason: rejectionReason })
      toast({
        title: 'Success',
        description: 'Application rejected',
      })
      router.push('/admin/dashboard')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject application',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Loading application details...</div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Application not found</div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-100">Pending</Badge>
      case 'Approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push('/admin/dashboard')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Application Details</h1>
          {getStatusBadge(application.status)}
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Applicant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="font-medium">
                  {application.user.firstName} {application.user.lastName}
                </div>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Application Date</div>
                <div className="font-medium">
                  {new Date(application.applicationDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Business Name</div>
                <div className="font-medium">{application.businessName}</div>
              </div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground mb-1">Business Description</div>
              <div>{application.businessDescription}</div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground mb-1">Category</div>
              <Badge variant="outline">{application.category}</Badge>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-muted-foreground mb-1">Address</div>
              <div>{application.businessAddress}</div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium">{application.businessPhone}</div>
                </div>
              </div>
              {application.businessEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium">{application.businessEmail}</div>
                  </div>
                </div>
              )}
            </div>
            {application.additionalNotes && (
              <>
                <Separator />
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Additional Notes</div>
                  <div className="text-sm">{application.additionalNotes}</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {application.status === 'Rejected' && application.rejectionReason && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Rejection Reason</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{application.rejectionReason}</p>
              {application.reviewedAt && (
                <p className="text-sm text-muted-foreground mt-2">
                  Reviewed on {new Date(application.reviewedAt).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {application.status === 'Pending' && (
          <Card>
            <CardHeader>
              <CardTitle>Review Application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve Application
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Enter reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Reject Application
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
