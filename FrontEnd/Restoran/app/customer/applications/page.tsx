"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Clock, FileText } from "lucide-react";
import Link from "next/link";

interface JobApplication {
  id: string;
  jobPostingId: string;
  jobTitle: string;
  restaurantName: string;
  coverLetter: string;
  resumeUrl?: string;
  status: string;
  applicationDate: string;
  reviewedDate?: string;
  reviewNotes?: string;
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://localhost:7268/api/JobApplication/my-applications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        <h1 className="text-3xl font-bold mb-2">Başvurularım</h1>
        <p className="text-muted-foreground">
          Yaptığınız iş başvurularını buradan takip edebilirsiniz
        </p>
      </div>

      <div className="grid gap-6">
        {applications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground mb-4">
                Henüz hiç başvuru yapmadınız.
              </p>
              <div className="text-center">
                <Button asChild>
                  <Link href="/jobs">İş İlanlarını Görüntüle</Link>
                </Button>
              </div>
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
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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

                  <div>
                    <h4 className="font-semibold text-sm mb-1">Ön Yazı:</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {application.coverLetter}
                    </p>
                  </div>

                  {application.reviewNotes && (
                    <div className="bg-muted p-3 rounded-md">
                      <h4 className="font-semibold text-sm mb-1">Değerlendirme Notu:</h4>
                      <p className="text-sm text-muted-foreground">
                        {application.reviewNotes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" asChild size="sm">
                      <Link href={`/jobs/${application.jobPostingId}`}>
                        İlanı Görüntüle
                      </Link>
                    </Button>
                    {application.resumeUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="mr-2 h-4 w-4" />
                          CV
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

