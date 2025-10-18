"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Phone, User, FileText, Clock, CheckCircle, XCircle } from "lucide-react";

interface JobApplication {
  id: string;
  jobPostingId: string;
  jobTitle: string;
  restaurantName: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  coverLetter: string;
  resumeUrl?: string;
  status: string;
  applicationDate: string;
  reviewedDate?: string;
  reviewNotes?: string;
}

export default function JobApplicationsPage() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [reviewStatus, setReviewStatus] = useState<string>("Accepted");
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      let url = "https://localhost:7268/api/JobApplication/my-restaurants";
      
      if (jobId) {
        url = `https://localhost:7268/api/JobApplication/job-posting/${jobId}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const openReviewDialog = (application: JobApplication) => {
    setSelectedApplication(application);
    setReviewStatus(application.status === "Pending" ? "Accepted" : application.status);
    setReviewNotes(application.reviewNotes || "");
    setReviewDialogOpen(true);
  };

  const handleReview = async () => {
    if (!selectedApplication) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://localhost:7268/api/JobApplication/review", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationId: selectedApplication.id,
          status: reviewStatus,
          reviewNotes: reviewNotes || null,
        }),
      });

      if (response.ok) {
        alert("Başvuru değerlendirmesi kaydedildi ve başvuru sahibine email gönderildi!");
        setReviewDialogOpen(false);
        fetchApplications();
      } else {
        alert("Değerlendirme kaydedilemedi");
      }
    } catch (error) {
      console.error("Error reviewing application:", error);
      alert("Bir hata oluştu");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="secondary">Beklemede</Badge>;
      case "Accepted":
        return <Badge className="bg-green-500">Kabul Edildi</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Reddedildi</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Yükleniyor...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">İş Başvuruları</h1>
        <p className="text-muted-foreground">
          İş ilanlarınıza gelen başvuruları inceleyin ve değerlendirin
        </p>
      </div>

      <div className="grid gap-6">
        {applications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Henüz hiç başvuru bulunmamaktadır.
              </p>
            </CardContent>
          </Card>
        ) : (
          applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-1">{application.jobTitle}</CardTitle>
                    <CardDescription>{application.restaurantName}</CardDescription>
                  </div>
                  {getStatusBadge(application.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Applicant Info */}
                  <div className="bg-muted p-4 rounded-md space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{application.applicantName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${application.applicantEmail}`} className="hover:underline">
                        {application.applicantEmail}
                      </a>
                    </div>
                    {application.applicantPhone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${application.applicantPhone}`} className="hover:underline">
                          {application.applicantPhone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Application Details */}
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Ön Yazı:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {application.coverLetter}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        Başvuru: {new Date(application.applicationDate).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                    {application.reviewedDate && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          Değerlendirme: {new Date(application.reviewedDate).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                    )}
                  </div>

                  {application.reviewNotes && (
                    <div className="bg-muted p-3 rounded-md">
                      <h4 className="font-semibold text-sm mb-1">Değerlendirme Notunuz:</h4>
                      <p className="text-sm text-muted-foreground">
                        {application.reviewNotes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {application.resumeUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="mr-2 h-4 w-4" />
                          CV'yi Görüntüle
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => openReviewDialog(application)}
                    >
                      {application.status === "Pending" ? "Değerlendir" : "Değerlendirmeyi Güncelle"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Başvuruyu Değerlendir</DialogTitle>
            <DialogDescription>
              Başvuru sahibine email ile bildirim gönderilecektir
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Durum</Label>
              <Select value={reviewStatus} onValueChange={setReviewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Accepted">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Kabul Et
                    </div>
                  </SelectItem>
                  <SelectItem value="Rejected">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Reddet
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reviewNotes">Değerlendirme Notu (Opsiyonel)</Label>
              <Textarea
                id="reviewNotes"
                placeholder="Başvuru sahibine iletilecek notunuzu yazın..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleReview}>
              Kaydet ve Email Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Users, Eye } from "lucide-react";
import Link from "next/link";

interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements: string;
  position: string;
  salary?: number;
  employmentType: string;
  postedDate: string;
  expiryDate?: string;
  isActive: boolean;
  restaurantId: string;
  restaurantName: string;
  applicationCount: number;
}

interface Restaurant {
  id: string;
  name: string;
}

export default function JobPostingsManagementPage() {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    position: "",
    salary: "",
    employmentType: "Full-time",
    expiryDate: "",
    restaurantId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const [jobsResponse, restaurantsResponse] = await Promise.all([
        fetch("https://localhost:7268/api/JobPosting/my-restaurants", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://localhost:7268/api/Restaurant/my-restaurants", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobPostings(jobsData);
      }

      if (restaurantsResponse.ok) {
        const restaurantsData = await restaurantsResponse.json();
        setRestaurants(restaurantsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://localhost:7268/api/JobPosting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          salary: formData.salary ? parseFloat(formData.salary) : null,
          expiryDate: formData.expiryDate || null,
        }),
      });

      if (response.ok) {
        alert("İş ilanı başarıyla oluşturuldu!");
        setIsCreateDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        alert("İş ilanı oluşturulamadı");
      }
    } catch (error) {
      console.error("Error creating job posting:", error);
      alert("Bir hata oluştu");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://localhost:7268/api/JobPosting/${editingJob.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingJob.id,
          ...formData,
          salary: formData.salary ? parseFloat(formData.salary) : null,
          expiryDate: formData.expiryDate || null,
          isActive: editingJob.isActive,
        }),
      });

      if (response.ok) {
        alert("İş ilanı başarıyla güncellendi!");
        setIsEditDialogOpen(false);
        setEditingJob(null);
        resetForm();
        fetchData();
      } else {
        alert("İş ilanı güncellenemedi");
      }
    } catch (error) {
      console.error("Error updating job posting:", error);
      alert("Bir hata oluştu");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu iş ilanını silmek istediğinizden emin misiniz?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://localhost:7268/api/JobPosting/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("İş ilanı silindi!");
        fetchData();
      } else {
        alert("İş ilanı silinemedi");
      }
    } catch (error) {
      console.error("Error deleting job posting:", error);
      alert("Bir hata oluştu");
    }
  };

  const handleToggleActive = async (job: JobPosting) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://localhost:7268/api/JobPosting/${job.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: job.id,
          title: job.title,
          description: job.description,
          requirements: job.requirements,
          position: job.position,
          salary: job.salary,
          employmentType: job.employmentType,
          expiryDate: job.expiryDate,
          isActive: !job.isActive,
        }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error toggling active status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      requirements: "",
      position: "",
      salary: "",
      employmentType: "Full-time",
      expiryDate: "",
      restaurantId: "",
    });
  };

  const openEditDialog = (job: JobPosting) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      position: job.position,
      salary: job.salary?.toString() || "",
      employmentType: job.employmentType,
      expiryDate: job.expiryDate ? new Date(job.expiryDate).toISOString().split('T')[0] : "",
      restaurantId: job.restaurantId,
    });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <div className="container mx-auto p-6">Yükleniyor...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">İş İlanları Yönetimi</h1>
          <p className="text-muted-foreground">
            Restoranlarınız için iş ilanlarını yönetin
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni İlan Oluştur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni İş İlanı Oluştur</DialogTitle>
              <DialogDescription>
                Restoranınız için yeni bir iş ilanı oluşturun
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="restaurant">Restoran *</Label>
                  <Select
                    value={formData.restaurantId}
                    onValueChange={(value) => setFormData({ ...formData, restaurantId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Restoran seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurants.map((restaurant) => (
                        <SelectItem key={restaurant.id} value={restaurant.id}>
                          {restaurant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">İlan Başlığı *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="position">Pozisyon *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="employmentType">Çalışma Şekli *</Label>
                  <Select
                    value={formData.employmentType}
                    onValueChange={(value) => setFormData({ ...formData, employmentType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Tam Zamanlı</SelectItem>
                      <SelectItem value="Part-time">Yarı Zamanlı</SelectItem>
                      <SelectItem value="Contract">Sözleşmeli</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="salary">Maaş (TL)</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">İş Tanımı *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="requirements">Gereksinimler *</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    required
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="expiryDate">Son Başvuru Tarihi</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">Oluştur</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {jobPostings.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Henüz hiç iş ilanı oluşturmadınız.
              </p>
            </CardContent>
          </Card>
        ) : (
          jobPostings.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-1">{job.title}</CardTitle>
                    <CardDescription>{job.restaurantName}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={job.isActive ? "default" : "secondary"}>
                      {job.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                    <Badge>{job.employmentType}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{job.applicationCount} başvuru</span>
                    </div>
                    {job.salary && (
                      <span>{job.salary.toLocaleString()} ₺</span>
                    )}
                  </div>

                  <p className="text-sm line-clamp-2">{job.description}</p>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/owner/job-applications?jobId=${job.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Başvuruları Gör ({job.applicationCount})
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(job)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Düzenle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(job)}
                    >
                      {job.isActive ? "Pasif Yap" : "Aktif Yap"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(job.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Sil
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>İş İlanını Düzenle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">İlan Başlığı *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-position">Pozisyon *</Label>
                <Input
                  id="edit-position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-employmentType">Çalışma Şekli *</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(value) => setFormData({ ...formData, employmentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Tam Zamanlı</SelectItem>
                    <SelectItem value="Part-time">Yarı Zamanlı</SelectItem>
                    <SelectItem value="Contract">Sözleşmeli</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-salary">Maaş (TL)</Label>
                <Input
                  id="edit-salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-description">İş Tanımı *</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="edit-requirements">Gereksinimler *</Label>
                <Textarea
                  id="edit-requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  required
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="edit-expiryDate">Son Başvuru Tarihi</Label>
                <Input
                  id="edit-expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                İptal
              </Button>
              <Button type="submit">Güncelle</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

