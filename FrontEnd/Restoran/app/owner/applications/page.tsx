"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { OwnerApi } from "@/lib/owner-api"
import { UserRole } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Check, X, Eye } from "lucide-react"
import Link from "next/link"

export default function OwnerApplicationsPage() {
  const { hasRole } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const restaurantId = searchParams.get("restaurant")

  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPendingOnly, setShowPendingOnly] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!hasRole(UserRole.Owner)) {
      router.push("/unauthorized")
      return
    }

    if (restaurantId) {
      loadApplications()
    }
  }, [hasRole, router, restaurantId, showPendingOnly, currentPage])

  const loadApplications = async () => {
    if (!restaurantId) return

    try {
      setIsLoading(true)
      const response = showPendingOnly
        ? await OwnerApi.getPendingJobApplications(restaurantId, currentPage, 10)
        : await OwnerApi.getJobApplications(restaurantId, currentPage, 10)

      setApplications(response.items || [])
      setTotalPages(response.totalPages || 1)
    } catch (error) {
      console.error("Error loading applications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (applicationId: number) => {
    try {
      await OwnerApi.acceptJobApplication(applicationId)
      loadApplications()
    } catch (error) {
      console.error("Error accepting application:", error)
    }
  }

  const handleReject = async (applicationId: number) => {
    try {
      await OwnerApi.rejectJobApplication(applicationId, "Pozisyon dolu")
      loadApplications()
    } catch (error) {
      console.error("Error rejecting application:", error)
    }
  }

  if (!restaurantId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Restoran Seçilmedi</CardTitle>
            <CardDescription>Lütfen bir restoran seçin.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <FileText className="mr-2" />
            İş Başvuruları
          </h1>
          <p className="text-muted-foreground">Restoran iş başvurularını yönetin</p>
        </div>
        <Link href="/owner/dashboard">
          <Button variant="outline">Dashboard'a Dön</Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <Button
          variant={showPendingOnly ? "default" : "outline"}
          onClick={() => setShowPendingOnly(!showPendingOnly)}
        >
          {showPendingOnly ? "Tüm Başvurular" : "Bekleyen Başvurular"}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Başvuru bulunamadı.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{application.applicantName}</CardTitle>
                    <CardDescription>
                      {application.position} - {new Date(application.appliedAt).toLocaleDateString("tr-TR")}
                    </CardDescription>
                  </div>
                  {application.status && (
                    <Badge
                      variant={
                        application.status === "Accepted"
                          ? "default"
                          : application.status === "Rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {application.status}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {application.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">E-posta</p>
                    <p className="text-sm">{application.email}</p>
                  </div>
                )}
                {application.phoneNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <p className="text-sm">{application.phoneNumber}</p>
                  </div>
                )}
                {application.coverLetter && (
                  <div>
                    <p className="text-sm text-muted-foreground">Ön Yazı</p>
                    <p className="text-sm line-clamp-3">{application.coverLetter}</p>
                  </div>
                )}

                {application.status === "Pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="default" onClick={() => handleAccept(application.id)}>
                      <Check className="mr-2 h-4 w-4" />
                      Kabul Et
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(application.id)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reddet
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      Detaylar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Önceki
          </Button>
          <span className="py-2 px-4">
            Sayfa {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Sonraki
          </Button>
        </div>
      )}
    </div>
  )
}
