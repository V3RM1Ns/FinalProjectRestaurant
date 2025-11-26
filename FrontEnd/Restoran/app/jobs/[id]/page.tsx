"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, DollarSign, Clock, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

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

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchJob();
    }
  }, [params.id]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`https://localhost:7268/api/JobPosting/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      }
    } catch (error) {
      console.error("Error fetching job:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push("/login");
      return;
    }

    setApplying(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://localhost:7268/api/JobApplication", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobPostingId: params.id,
          coverLetter,
          resumeUrl: resumeUrl || null,
        }),
      });

      if (response.ok) {
        alert("Başvurunuz başarıyla gönderildi!");
        router.push("/customer/applications");
      } else {
        const error = await response.text();
        alert(error || "Başvuru gönderilemedi");
      }
    } catch (error) {
      console.error("Error applying:", error);
      alert("Bir hata oluştu");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Yükleniyor...</div>;
  }

  if (!job) {
    return <div className="container mx-auto p-6">İş ilanı bulunamadı</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/jobs">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Link>
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
              <CardDescription className="text-xl">
                {job.restaurantName}
              </CardDescription>
            </div>
            <Badge variant={job.employmentType === "Full-time" ? "default" : "secondary"}>
              {job.employmentType}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                <span>{job.position}</span>
              </div>
              {job.salary && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{job.salary.toLocaleString()} ₺</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>İlan Tarihi: {new Date(job.postedDate).toLocaleDateString("tr-TR")}</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">İş Tanımı</h3>
              <p className="text-muted-foreground whitespace-pre-line">{job.description}</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Gereksinimler</h3>
              <p className="text-muted-foreground whitespace-pre-line">{job.requirements}</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/restaurants/${job.restaurantId}`}>
                  Restoran Sayfası
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {user?.role === "Customer" && (
        <Card>
          <CardHeader>
            <CardTitle>Başvuru Yap</CardTitle>
            <CardDescription>
              Bu pozisyona başvurmak için aşağıdaki formu doldurun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleApply} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coverLetter">Ön Yazı *</Label>
                <Textarea
                  id="coverLetter"
                  placeholder="Kendinizi tanıtın ve neden bu pozisyon için uygun olduğunuzu açıklayın..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  required
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resumeUrl">CV URL (Opsiyonel)</Label>
                <Input
                  id="resumeUrl"
                  type="url"
                  placeholder="https://example.com/cv.pdf"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  CV'nizi online bir platforma yükleyip linkini buraya yapıştırabilirsiniz
                </p>
              </div>

              <Button type="submit" disabled={applying} className="w-full">
                {applying ? "Gönderiliyor..." : "Başvuruyu Gönder"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center mb-4">
              Başvuru yapmak için giriş yapmanız gerekmektedir.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Giriş Yap</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
