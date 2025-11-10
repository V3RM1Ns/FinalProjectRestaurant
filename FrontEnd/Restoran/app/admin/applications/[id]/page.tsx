'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, CheckCircle, XCircle, User, Building, MapPin, Phone, Mail, Calendar } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Application {
  id: string
  userId: string
  businessName: string
  businessDescription: string
  businessAddress: string
  businessPhone: string
  businessEmail: string
  category: string
  additionalNotes?: string
  status: string
  applicationDate: string
  reviewedBy?: string
  reviewedAt?: string
  rejectionReason?: string
  user: {
    firstName: string
    lastName: string
  }
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchApplication()
  }, [params.id])

  const fetchApplication = async () => {
    setLoading(true)
    try {
      const data = await api.get<Application>(`/admin/applications/${params.id}`)
      setApplication(data)
    } catch (error: any) {
      console.error('Error fetching application:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load application',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this application? This will create a restaurant and grant the user Restaurant Owner role.')) return

    setActionLoading(true)
    try {
      await api.post(`/admin/applications/${params.id}/approve`, {})
      toast({
        title: 'Success',
        description: 'Application approved successfully',
      })
      router.push('/admin/applications')
    } catch (error: any) {
      console.error('Error approving application:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve application',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason',
        variant: 'destructive',
      })
      return
    }

    setActionLoading(true)
    try {
      await api.post(`/admin/applications/${params.id}/reject`, { reason: rejectionReason })
      toast({
        title: 'Success',
        description: 'Application rejected successfully',
      })
      setRejectDialogOpen(false)
      router.push('/admin/applications')
    } catch (error: any) {
      console.error('Error rejecting application:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject application',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100">Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
        <Card>
          <CardHeader>
            <CardTitle>Application Not Found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.push('/admin/applications')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Applications
      </Button>

      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Restaurant Ownership Application</CardTitle>
                <CardDescription>Application ID: {application.id}</CardDescription>
              </div>
              {getStatusBadge(application.status)}
            </div>
          </CardHeader>
        </Card>

        {/* Applicant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Applicant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{application.user.firstName} {application.user.lastName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Application Date</Label>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(application.applicationDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Business Name</Label>
              <p className="font-medium text-lg">{application.businessName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Category</Label>
              <div className="mt-1">
                <Badge variant="outline">{application.category}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Description</Label>
              <p className="text-sm">{application.businessDescription}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Address
                </Label>
                <p className="text-sm">{application.businessAddress}</p>
              </div>
              <div>
                <Label className="text-muted-foreground flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Phone
                </Label>
                <p className="text-sm">{application.businessPhone}</p>
              </div>
            </div>
            {application.businessEmail && (
              <div>
                <Label className="text-muted-foreground flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <p className="text-sm">{application.businessEmail}</p>
              </div>
            )}
            {application.additionalNotes && (
              <div>
                <Label className="text-muted-foreground">Additional Notes</Label>
                <p className="text-sm">{application.additionalNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Information */}
        {(application.reviewedAt || application.rejectionReason) && (
          <Card>
            <CardHeader>
              <CardTitle>Review Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.reviewedAt && (
                <div>
                  <Label className="text-muted-foreground">Reviewed At</Label>
                  <p className="text-sm">{new Date(application.reviewedAt).toLocaleString()}</p>
                </div>
              )}
              {application.rejectionReason && (
                <div>
                  <Label className="text-muted-foreground">Rejection Reason</Label>
                  <p className="text-sm">{application.rejectionReason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {application.status.toLowerCase() === 'pending' && (
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Review and make a decision on this application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Application
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Application
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application. This will be visible to the applicant.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              {actionLoading ? 'Rejecting...' : 'Reject Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

