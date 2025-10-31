"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  DollarSign, 
  ShoppingBag, 
  Star, 
  UserPlus,
  MessageSquare,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Eye
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRestaurant } from "@/contexts/restaurant-context"
import { ownerApi } from "@/lib/owner-api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  AppUser, 
  JobApplication, 
  Review, 
  Order, 
  Reservation,
  JobApplicationStatus,
  ReviewStatus,
  OrderStatus,
  ReservationStatus 
} from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DashboardStats {
  totalRevenue: number
  todayRevenue: number
  totalOrders: number
  todayOrders: number
  totalEmployees: number
  pendingApplications: number
  pendingReviews: number
  activeReservations: number
}

export default function OwnerDashboardPage() {
  const { selectedRestaurant } = useRestaurant()
  const { toast } = useToast()
  
  const [dashboard, setDashboard] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    todayRevenue: 0,
    totalOrders: 0,
    todayOrders: 0,
    totalEmployees: 0,
    pendingApplications: 0,
    pendingReviews: 0,
    activeReservations: 0,
  })
  
  const [employees, setEmployees] = useState<AppUser[]>([])
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  
  // Dialog states
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<AppUser | null>(null)
  const [employeeForm, setEmployeeForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
  })
  
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [reviewResponse, setReviewResponse] = useState("")
  
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    if (selectedRestaurant) {
      loadAllData()
    }
  }, [selectedRestaurant])

  const loadAllData = async () => {
    if (!selectedRestaurant) return
    
    setLoading(true)
    try {
      // Yeni Owner API'yi kullanarak dashboard verilerini çek
      const dashboardData = await ownerApi.dashboard.getDashboard(selectedRestaurant.id)
      setDashboard(dashboardData)
      
      setStats({
        totalRevenue: dashboardData.totalRevenue,
        todayRevenue: dashboardData.todayRevenue,
        totalOrders: dashboardData.totalOrders,
        todayOrders: dashboardData.todayOrders,
        totalEmployees: dashboardData.employeeCount,
        pendingApplications: dashboardData.pendingApplicationsCount,
        pendingReviews: dashboardData.pendingReviewsCount,
        activeReservations: dashboardData.activeReservations,
      })

      await Promise.all([
        loadEmployees(),
        loadJobApplications(),
        loadReviews(),
        loadOrders(),
        loadReservations(),
      ])
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Veriler yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadEmployees = async () => {
    if (!selectedRestaurant) return
    try {
      const response = await ownerApi.employees.getAll(selectedRestaurant.id, 1, 100)
      setEmployees(response.items || [])
    } catch (error: any) {
      console.error("Error loading employees:", error)
    }
  }

  const loadJobApplications = async () => {
    if (!selectedRestaurant) return
    try {
      const response = await ownerApi.jobApplications.getPending(selectedRestaurant.id, 1, 100)
      setJobApplications(response.items || [])
    } catch (error: any) {
      console.error("Error loading job applications:", error)
    }
  }

  const loadReviews = async () => {
    if (!selectedRestaurant) return
    try {
      const response = await ownerApi.reviews.getPending(selectedRestaurant.id, 1, 100)
      setReviews(response.items || [])
    } catch (error: any) {
      console.error("Error loading reviews:", error)
    }
  }

  const loadOrders = async () => {
    if (!selectedRestaurant) return
    try {
      const response = await ownerApi.orders.getAll(selectedRestaurant.id, 1, 20)
      setOrders(response.items || [])
    } catch (error: any) {
      console.error("Error loading orders:", error)
    }
  }

  const loadReservations = async () => {
    if (!selectedRestaurant) return
    try {
      const response = await ownerApi.reservations.getAll(selectedRestaurant.id, 1, 20)
      setReservations(response.items || [])
    } catch (error: any) {
      console.error("Error loading reservations:", error)
    }
  }

  // Employee CRUD operations
  const handleSaveEmployee = async () => {
    if (!selectedRestaurant) return
    
    try {
      if (editingEmployee) {
        await ownerApi.employees.update(selectedRestaurant.id, editingEmployee.id, employeeForm)
        toast({
          title: "Başarılı",
          description: "Çalışan güncellendi",
        })
      } else {
        await ownerApi.employees.create(selectedRestaurant.id, employeeForm)
        toast({
          title: "Başarılı",
          description: "Çalışan eklendi",
        })
      }
      
      setEmployeeDialogOpen(false)
      setEditingEmployee(null)
      setEmployeeForm({ fullName: "", email: "", phoneNumber: "", password: "" })
      await loadEmployees()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İşlem başarısız",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!selectedRestaurant || !confirm("Bu çalışanı silmek istediğinizden emin misiniz?")) return
    
    try {
      await ownerApi.employees.delete(selectedRestaurant.id, employeeId)
      toast({
        title: "Başarılı",
        description: "Çalışan silindi",
      })
      await loadEmployees()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Silme işlemi başarısız",
        variant: "destructive",
      })
    }
  }

  const handleEditEmployee = (employee: AppUser) => {
    setEditingEmployee(employee)
    setEmployeeForm({
      fullName: employee.fullName,
      email: employee.email,
      phoneNumber: employee.phoneNumber || "",
      password: "",
    })
    setEmployeeDialogOpen(true)
  }

  // Job Application operations
  const handleAcceptApplication = async (applicationId: number) => {
    try {
      await ownerApi.jobApplications.accept(applicationId)
      toast({
        title: "Başarılı",
        description: "Başvuru kabul edildi",
      })
      setApplicationDialogOpen(false)
      await loadJobApplications()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İşlem başarısız",
        variant: "destructive",
      })
    }
  }

  const handleRejectApplication = async (applicationId: number) => {
    try {
      await ownerApi.jobApplications.reject(applicationId, rejectionReason)
      toast({
        title: "Başarılı",
        description: "Başvuru reddedildi",
      })
      setApplicationDialogOpen(false)
      setRejectionReason("")
      await loadJobApplications()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İşlem başarısız",
        variant: "destructive",
      })
    }
  }

  // Review operations
  const handleApproveReview = async (reviewId: number) => {
    try {
      await ownerApi.reviews.approve(reviewId)
      toast({
        title: "Başarılı",
        description: "Yorum onaylandı",
      })
      await loadReviews()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İşlem başarısız",
        variant: "destructive",
      })
    }
  }

  const handleRejectReview = async (reviewId: number) => {
    try {
      await ownerApi.reviews.reject(reviewId)
      toast({
        title: "Başarılı",
        description: "Yorum reddedildi",
      })
      await loadReviews()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İşlem başarısız",
        variant: "destructive",
      })
    }
  }

  const handleRespondToReview = async (reviewId: number, response: string) => {
    try {
      await ownerApi.reviews.respond(reviewId, response)
      toast({
        title: "Başarılı",
        description: "Yanıt gönderildi",
      })
      setReviewDialogOpen(false)
      setReviewResponse("")
      await loadReviews()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İşlem başarısız",
        variant: "destructive",
      })
    }
  }

  // Order operations
  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await ownerApi.orders.updateStatus(orderId, newStatus)
      toast({
        title: "Başarılı",
        description: "Sipariş durumu güncellendi",
      })
      await loadOrders()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İşlem başarısız",
        variant: "destructive",
      })
    }
  }

  // Reservation operations
  const handleUpdateReservationStatus = async (reservationId: string, newStatus: string) => {
    try {
      await ownerApi.reservations.updateStatus(reservationId, newStatus)
      toast({
        title: "Başarılı",
        description: "Rezervasyon durumu güncellendi",
      })
      await loadReservations()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İşlem başarısız",
        variant: "destructive",
      })
    }
  }

  if (!selectedRestaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Restoran Seçin</CardTitle>
            <CardDescription>
              Devam etmek için lütfen bir restoran seçin
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{selectedRestaurant.name}</h1>
          <p className="text-muted-foreground">Restoran Yönetim Paneli</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Bugün: ₺{stats.todayRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Siparişler</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Bugün: {stats.todayOrders}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Çalışanlar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Bekleyen başvuru: {stats.pendingApplications}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rezervasyonlar</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeReservations}</div>
            <p className="text-xs text-muted-foreground">
              Bekleyen yorum: {stats.pendingReviews}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">
            Çalışanlar ({employees.length})
          </TabsTrigger>
          <TabsTrigger value="applications">
            İş Başvuruları ({jobApplications.length})
          </TabsTrigger>
          <TabsTrigger value="reviews">
            Yorumlar ({reviews.length})
          </TabsTrigger>
          <TabsTrigger value="orders">
            Siparişler ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="reservations">
            Rezervasyonlar ({reservations.length})
          </TabsTrigger>
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Çalışanlar</CardTitle>
                  <CardDescription>Restoranınızda çalışan personeli yönetin</CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingEmployee(null)
                  setEmployeeForm({ fullName: "", email: "", phoneNumber: "", password: "" })
                  setEmployeeDialogOpen(true)
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Çalışan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Kayıt Tarihi</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Henüz çalışan bulunmuyor
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.fullName}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.phoneNumber || "-"}</TableCell>
                        <TableCell>{new Date(employee.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditEmployee(employee)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteEmployee(employee.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>İş Başvuruları</CardTitle>
              <CardDescription>Restoranınıza yapılan iş başvurularını inceleyin</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Başvuran</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Başvuru Tarihi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Henüz başvuru bulunmuyor
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">{application.applicantName}</TableCell>
                        <TableCell>{application.applicantEmail}</TableCell>
                        <TableCell>{application.applicantPhone || "-"}</TableCell>
                        <TableCell>{new Date(application.appliedDate).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              application.status === JobApplicationStatus.Pending
                                ? "secondary"
                                : application.status === JobApplicationStatus.Accepted
                                ? "default"
                                : "destructive"
                            }
                          >
                            {application.status === JobApplicationStatus.Pending && "Beklemede"}
                            {application.status === JobApplicationStatus.Accepted && "Kabul Edildi"}
                            {application.status === JobApplicationStatus.Rejected && "Reddedildi"}
                            {application.status === JobApplicationStatus.Reviewed && "İncelendi"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(application)
                                setApplicationDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {application.status === JobApplicationStatus.Pending && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleAcceptApplication(application.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedApplication(application)
                                    setApplicationDialogOpen(true)
                                  }}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yorumlar</CardTitle>
              <CardDescription>Restoranınıza gelen yorumları yönetin</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>Puan</TableHead>
                    <TableHead>Yorum</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Henüz yorum bulunmuyor
                      </TableCell>
                    </TableRow>
                  ) : (
                    reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">{review.customerName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{review.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{review.comment}</TableCell>
                        <TableCell>{new Date(review.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              review.status === ReviewStatus.Pending
                                ? "secondary"
                                : review.status === ReviewStatus.Approved
                                ? "default"
                                : "destructive"
                            }
                          >
                            {review.status === ReviewStatus.Pending && "Beklemede"}
                            {review.status === ReviewStatus.Approved && "Onaylandı"}
                            {review.status === ReviewStatus.Rejected && "Reddedildi"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {review.status === ReviewStatus.Pending && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleApproveReview(review.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRejectReview(review.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedReview(review)
                                setReviewResponse(review.adminResponse || "")
                                setReviewDialogOpen(true)
                              }}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Siparişler</CardTitle>
              <CardDescription>Restoranınızın siparişlerini görüntüleyin</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sipariş No</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Henüz sipariş bulunmuyor
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.slice(0, 10).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                        <TableCell>{new Date(order.orderDate).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell>₺{order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>{order.type}</TableCell>
                        <TableCell>
                          <Badge>{order.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reservations Tab */}
        <TabsContent value="reservations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rezervasyonlar</CardTitle>
              <CardDescription>Restoranınızın rezervasyonlarını görüntüleyin</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Kişi Sayısı</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Henüz rezervasyon bulunmuyor
                      </TableCell>
                    </TableRow>
                  ) : (
                    reservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell className="font-medium">{reservation.customerName}</TableCell>
                        <TableCell>{reservation.customerPhone}</TableCell>
                        <TableCell>{new Date(reservation.reservationDate).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell>{reservation.numberOfGuests}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              reservation.status === ReservationStatus.Confirmed
                                ? "default"
                                : reservation.status === ReservationStatus.Pending
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {reservation.status === ReservationStatus.Pending && "Beklemede"}
                            {reservation.status === ReservationStatus.Confirmed && "Onaylandı"}
                            {reservation.status === ReservationStatus.Cancelled && "İptal"}
                            {reservation.status === ReservationStatus.Completed && "Tamamlandı"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Employee Dialog */}
      <Dialog open={employeeDialogOpen} onOpenChange={setEmployeeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "Çalışanı Düzenle" : "Yeni Çalışan Ekle"}</DialogTitle>
            <DialogDescription>
              Çalışan bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Ad Soyad</Label>
              <Input
                id="fullName"
                value={employeeForm.fullName}
                onChange={(e) => setEmployeeForm({ ...employeeForm, fullName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={employeeForm.email}
                onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Telefon</Label>
              <Input
                id="phoneNumber"
                value={employeeForm.phoneNumber}
                onChange={(e) => setEmployeeForm({ ...employeeForm, phoneNumber: e.target.value })}
              />
            </div>
            {!editingEmployee && (
              <div>
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={employeeForm.password}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmployeeDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveEmployee}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Dialog */}
      <Dialog open={applicationDialogOpen} onOpenChange={setApplicationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Başvuru Detayları</DialogTitle>
            <DialogDescription>
              {selectedApplication?.applicantName} - {selectedApplication?.applicantEmail}
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <Label>Telefon</Label>
                <p className="text-sm">{selectedApplication.applicantPhone || "-"}</p>
              </div>
              <div>
                <Label>Başvuru Mektubu</Label>
                <p className="text-sm whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
              </div>
              <div>
                <Label>Başvuru Tarihi</Label>
                <p className="text-sm">{new Date(selectedApplication.appliedDate).toLocaleDateString('tr-TR')}</p>
              </div>
              {selectedApplication.status === JobApplicationStatus.Pending && (
                <div>
                  <Label htmlFor="rejectionReason">Red Nedeni (Opsiyonel)</Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Red nedeni belirtebilirsiniz..."
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedApplication?.status === JobApplicationStatus.Pending && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleRejectApplication(selectedApplication.id)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reddet
                </Button>
                <Button onClick={() => handleAcceptApplication(selectedApplication.id)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Kabul Et
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setApplicationDialogOpen(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Response Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yoruma Yanıt Ver</DialogTitle>
            <DialogDescription>
              {selectedReview?.customerName} - {selectedReview?.rating} ⭐
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div>
                <Label>Yorum</Label>
                <p className="text-sm whitespace-pre-wrap">{selectedReview.comment}</p>
              </div>
              <div>
                <Label htmlFor="reviewResponse">Yanıtınız</Label>
                <Textarea
                  id="reviewResponse"
                  value={reviewResponse}
                  onChange={(e) => setReviewResponse(e.target.value)}
                  placeholder="Müşteriye yanıt yazın..."
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleRespondToReview}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Yanıt Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
