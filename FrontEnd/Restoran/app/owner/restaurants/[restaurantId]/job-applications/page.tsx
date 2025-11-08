'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, Check, X, Eye, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface JobApplication {
  id: string
  jobTitle: string
  restaurantName: string
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  coverLetter?: string
  resumeUrl?: string
  status: string
  applicationDate: string
}

interface PaginatedResult {
  items: JobApplication[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export default function OwnerJobApplicationsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [applications, setApplications] = useState<PaginatedResult | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [showPendingOnly, setShowPendingOnly] = useState(true)
  const pageSize = 10

  useEffect(() => {
    fetchApplications(currentPage)
  }, [currentPage, showPendingOnly])

  const fetchApplications = async (page: number) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const endpoint = showPendingOnly
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/Owner/restaurants/${params.restaurantId}/job-applications/pending`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/Owner/restaurants/${params.restaurantId}/job-applications`

      const response = await fetch(
        `${endpoint}?pageNumber=${page}&pageSize=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      } else if (response.status === 401) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast({
        title: 'Error',
        description: 'Failed to load job applications',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (applicationId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Owner/job-applications/${applicationId}/accept`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Application accepted successfully',
        })
        setSelectedApplication(null)
        fetchApplications(currentPage)
      } else {
        throw new Error('Failed to accept application')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept application',
        variant: 'destructive',
      })
    }
  }

  const handleReject = async (applicationId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Owner/job-applications/${applicationId}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify('Position has been filled'),
        }
      )

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Application rejected',
        })
        setSelectedApplication(null)
        fetchApplications(currentPage)
      } else {
        throw new Error('Failed to reject application')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject application',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-100">Pending</Badge>
      case 'Accepted':
        return <Badge variant="default" className="bg-green-600">Accepted</Badge>
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const totalPages = applications ? Math.ceil(applications.totalCount / pageSize) : 0

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Job Applications</h1>
        <p className="text-muted-foreground">Review and manage job applications</p>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          variant={showPendingOnly ? 'default' : 'outline'}
          onClick={() => {
            setShowPendingOnly(true)
            setCurrentPage(1)
          }}
        >
          Pending Applications
        </Button>
        <Button
          variant={!showPendingOnly ? 'default' : 'outline'}
          onClick={() => {
            setShowPendingOnly(false)
            setCurrentPage(1)
          }}
        >
          All Applications
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {showPendingOnly ? 'Pending' : 'All'} Applications ({applications?.totalCount || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : applications && applications.items.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.items.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.applicantName}</TableCell>
                      <TableCell>{application.jobTitle}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{application.applicantEmail}</div>
                          <div className="text-muted-foreground">{application.applicantPhone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(application.applicationDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedApplication(application)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No applications found
            </div>
          )}
        </CardContent>
      </Card>

      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Applicant Name</div>
                  <div className="font-medium">{selectedApplication.applicantName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Job Title</div>
                  <div className="font-medium">{selectedApplication.jobTitle}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div>{selectedApplication.applicantEmail}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div>{selectedApplication.applicantPhone}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Application Date</div>
                  <div>{new Date(selectedApplication.applicationDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div>{getStatusBadge(selectedApplication.status)}</div>
                </div>
              </div>

              {selectedApplication.coverLetter && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Cover Letter</div>
                  <div className="p-4 bg-muted rounded-lg text-sm">
                    {selectedApplication.coverLetter}
                  </div>
                </div>
              )}

              {selectedApplication.resumeUrl && (
                <div>
                  <Button variant="outline" asChild className="w-full">
                    <a href={selectedApplication.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="w-4 h-4 mr-2" />
                      View Resume
                    </a>
                  </Button>
                </div>
              )}
            </div>

            {selectedApplication.status === 'Pending' && (
              <DialogFooter className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleReject(selectedApplication.id)}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleAccept(selectedApplication.id)}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Accept
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

