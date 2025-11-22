'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, Eye, Store, Calendar, User, Mail, Phone, MapPin } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

interface RestaurantApplication {
  id: string
  ownerId: string
  ownerName: string
  ownerEmail: string
  restaurantName: string
  description: string
  address: string
  phoneNumber: string
  email: string
  website?: string
  category: string
  imageUrl?: string
  additionalNotes?: string
  status: string
  applicationDate: string
  reviewedAt?: string
  reviewerName?: string
  rejectionReason?: string
}

export default function AdminRestaurantApplicationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [applications, setApplications] = useState<RestaurantApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<RestaurantApplication | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const data = await api.get<RestaurantApplication[]>('/Admin/restaurant-applications/pending')
      setApplications(data)
    } catch (error: any) {
      console.error('Error fetching applications:', error)
      toast({
        title: 'Hata',
        description: error.message || 'Başvurular yüklenemedi',
        variant: 'destructive',
      })
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (applicationId: string) => {
    setActionLoading(true)
    try {
      await api.post(`/Admin/restaurant-applications/${applicationId}/approve`, {})
      toast({
        title: 'Başarılı!',
        description: 'Restoran başvurusu onaylandı.',
      })
      fetchApplications()
      setShowDetailsDialog(false)
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Başvuru onaylanamadı',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedApplication) return
    
    setActionLoading(true)
    try {
      await api.post(`/Admin/restaurant-applications/${selectedApplication.id}/reject`, {
        rejectionReason: rejectionReason || 'Başvuru reddedildi'
      })
      toast({
        title: 'Başarılı!',
        description: 'Restoran başvurusu reddedildi.',
      })
      fetchApplications()
      setShowRejectDialog(false)
      setShowDetailsDialog(false)
      setRejectionReason('')
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Başvuru reddedilemedi',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const openRejectDialog = (application: RestaurantApplication) => {
    setSelectedApplication(application)
    setShowDetailsDialog(false)
    setShowRejectDialog(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100">Beklemede</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Onaylandı</Badge>
      case 'rejected':
        return <Badge variant="destructive">Reddedildi</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Store className="w-8 h-8" />
          Restoran Başvuruları
        </h1>
        <p className="text-muted-foreground">Bekleyen restoran başvurularını inceleyin ve onaylayın</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bekleyen Başvurular ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : applications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restoran Adı</TableHead>
                  <TableHead>Sahip</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Başvuru Tarihi</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.restaurantName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{app.ownerName}</span>
                        <span className="text-sm text-muted-foreground">{app.ownerEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>{app.category}</TableCell>
                    <TableCell>{new Date(app.applicationDate).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(app)
                            setShowDetailsDialog(true)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detay
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(app.id)}
                          disabled={actionLoading}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Onayla
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openRejectDialog(app)}
                          disabled={actionLoading}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reddet
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Bekleyen başvuru bulunmamaktadır.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Başvuru Detayları</DialogTitle>
            <DialogDescription>Restoran başvurusu hakkında detaylı bilgi</DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {selectedApplication.imageUrl && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <Image
                    src={selectedApplication.imageUrl}
                    alt={selectedApplication.restaurantName}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Restoran Adı</Label>
                  <p className="text-lg">{selectedApplication.restaurantName}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Kategori</Label>
                  <p className="text-lg">{selectedApplication.category}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Açıklama</Label>
                <p className="text-muted-foreground">{selectedApplication.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-semibold">Sahip</Label>
                    <p>{selectedApplication.ownerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-semibold">E-posta</Label>
                    <p>{selectedApplication.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-semibold">Telefon</Label>
                    <p>{selectedApplication.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-semibold">Adres</Label>
                    <p>{selectedApplication.address}</p>
                  </div>
                </div>
              </div>

              {selectedApplication.website && (
                <div>
                  <Label className="text-sm font-semibold">Website</Label>
                  <p className="text-blue-600">{selectedApplication.website}</p>
                </div>
              )}

              {selectedApplication.additionalNotes && (
                <div>
                  <Label className="text-sm font-semibold">Ek Notlar</Label>
                  <p className="text-muted-foreground">{selectedApplication.additionalNotes}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Başvuru Tarihi: {new Date(selectedApplication.applicationDate).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Kapat
            </Button>
            {selectedApplication && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => openRejectDialog(selectedApplication)}
                  disabled={actionLoading}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reddet
                </Button>
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(selectedApplication.id)}
                  disabled={actionLoading}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Onayla
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Başvuruyu Reddet</DialogTitle>
            <DialogDescription>
              Bu başvuruyu reddetmek istediğinizden emin misiniz? Lütfen ret sebebini belirtin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Ret Sebebi</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Başvurunun reddedilme sebebini açıklayın..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectDialog(false)
              setRejectionReason('')
            }}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              Reddet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

