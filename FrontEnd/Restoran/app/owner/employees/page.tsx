"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { OwnerApi } from "@/lib/owner-api"
import { UserRole } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Plus, Mail, Phone } from "lucide-react"
import Link from "next/link"

export default function OwnerEmployeesPage() {
  const { hasRole } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const restaurantId = searchParams.get("restaurant")

  const [employees, setEmployees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!hasRole(UserRole.Owner)) {
      router.push("/unauthorized")
      return
    }

    if (restaurantId) {
      loadEmployees()
    }
  }, [hasRole, router, restaurantId, currentPage])

  const loadEmployees = async () => {
    if (!restaurantId) return

    try {
      setIsLoading(true)
      const response = await OwnerApi.getEmployees(restaurantId, currentPage, 10)
      setEmployees(response.items || [])
      setTotalPages(response.totalPages || 1)
    } catch (error) {
      console.error("Error loading employees:", error)
    } finally {
      setIsLoading(false)
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
            <Users className="mr-2" />
            Çalışanlar
          </h1>
          <p className="text-muted-foreground">Restoran çalışanlarını yönetin</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Çalışan
          </Button>
          <Link href="/owner/dashboard">
            <Button variant="outline">Dashboard'a Dön</Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      ) : employees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Henüz çalışan eklenmemiş.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {employees.map((employee) => (
            <Card key={employee.id}>
              <CardHeader>
                <CardTitle>{employee.fullName}</CardTitle>
                <CardDescription>{employee.role || "Çalışan"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {employee.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{employee.email}</span>
                  </div>
                )}
                {employee.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{employee.phoneNumber}</span>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button size="sm" variant="outline" className="flex-1">
                    Düzenle
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500">
                    Sil
                  </Button>
                </div>
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
