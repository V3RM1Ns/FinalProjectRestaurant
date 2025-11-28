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

interface Restaurant {
  id: string;
  name: string;
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
      
      if (jobId) {
        // Belirli bir iş ilanına gelen başvurular
        const url = `https://localhost:7268/api/JobApplication/job-posting/${jobId}`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setApplications(data);
        }
      } else {
        // Tüm restoranların başvurularını getir
        // Önce restoranları al
        const restaurantsResponse = await fetch("https://localhost:7268/api/Owner/restaurants", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (restaurantsResponse.ok) {
          const restaurants: Restaurant[] = await restaurantsResponse.json();
          
          // Her restoran için başvuruları çek
          const allApplications: JobApplication[] = [];
          for (const restaurant of restaurants) {
            const appsResponse = await fetch(
              `https://localhost:7268/api/JobApplication/restaurant/${restaurant.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (appsResponse.ok) {
              const apps = await appsResponse.json();
              allApplications.push(...apps);
            }
          }
          
          // Tarihe göre sırala (en yeni önce)
          allApplications.sort((a, b) => 
            new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()
          );
          
          setApplications(allApplications);
        }
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
                        <a 
                          href={application.resumeUrl.startsWith('http') 
                            ? application.resumeUrl 
                            : `https://localhost:7268${application.resumeUrl}`
                          } 
                          target="_blank" 
                          rel="noopener noreferrer"
                          download
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          CV'yi İndir
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
