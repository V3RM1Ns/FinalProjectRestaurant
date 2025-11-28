"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, UserX, UserCheck } from 'lucide-react'
import { OwnerApi } from '@/lib/owner-api'
import { useAuth } from '@/contexts/auth-context'
import { UserRole } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface Employee {
  id: string
  fullName: string
  email: string
  phone: string
  address?: string
  profileImageUrl?: string
  employerRestaurantId: string
  restaurantName: string
  createdAt: string
  isActive: boolean
}

export default function EmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { hasRole } = useAuth()
  const { toast } = useToast()
  const restaurantId = params.id as string // params.restaurantId yerine params.id
  const employeeId = params.employeeId as string
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!hasRole(UserRole.Owner)) {
      router.push('/unauthorized')
      return
    }
    fetchEmployee()
  }, [restaurantId, employeeId, hasRole])

  const fetchEmployee = async () => {
    try {
      setLoading(true)
      const data = await OwnerApi.getEmployeeById(restaurantId, employeeId)
      setEmployee(data)
    } catch (error) {
      console.error('Error fetching employee:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!employee) return

    try {
      setActionLoading(true)
      // Update employee with toggled isActive status
      await OwnerApi.updateEmployee(restaurantId, employeeId, {
        fullName: employee.fullName,
        email: employee.email,
        phoneNumber: employee.phone,
        address: employee.address,
        profileImageUrl: employee.profileImageUrl,
        isActive: !employee.isActive,
      })

      toast({
        title: "Başarılı",
        description: `Çalışan başarıyla ${!employee.isActive ? 'aktifleştirildi' : 'deaktifleştirildi'}`,
      })

      // Refresh employee data
      fetchEmployee()
    } catch (error: any) {
      console.error('Error updating employee status:', error)
      toast({
        title: "Hata",
        description: error?.message || "Çalışan durumu güncellenirken hata oluştu",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/owner/restaurants/${restaurantId}/employees`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Çalışanlara Geri Dön
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Çalışan bulunamadı</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => router.push(`/owner/restaurants/${restaurantId}/employees`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Çalışanlara Geri Dön
      </Button>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Çalışan Detayları</h1>
            <p className="text-muted-foreground">{employee.restaurantName}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={employee.isActive ? 'default' : 'secondary'} className="text-lg px-4 py-2">
              {employee.isActive ? 'Aktif' : 'Deaktif'}
            </Badge>
            <Button
              variant={employee.isActive ? 'destructive' : 'default'}
              onClick={handleToggleStatus}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : employee.isActive ? (
                <UserX className="w-4 h-4 mr-2" />
              ) : (
                <UserCheck className="w-4 h-4 mr-2" />
              )}
              {employee.isActive ? 'Deaktif Et' : 'Aktif Et'}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                {employee.profileImageUrl ? (
                  <img
                    src={employee.profileImageUrl}
                    alt={employee.fullName}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-primary" />
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">{employee.fullName}</CardTitle>
                <CardDescription>Çalışan ID: {employee.id.slice(0, 8)}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>İletişim Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">E-posta</p>
                <p className="text-base">{employee.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Telefon</p>
                <p className="text-base">{employee.phone}</p>
              </div>
            </div>

            {employee.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Adres</p>
                  <p className="text-base">{employee.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>İstihdam Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Katılım Tarihi</p>
                <p className="text-base">
                  {new Date(employee.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Durum</p>
                <p className="text-base">{employee.isActive ? 'Aktif Çalışan' : 'Deaktif'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
