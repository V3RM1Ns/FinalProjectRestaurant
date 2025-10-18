"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Mail, Phone, Trash2, UserCog } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Employee {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  role: string
  restaurantId: string
}

const mockEmployees: Employee[] = [
  {
    id: "1",
    fullName: "Ahmet Yılmaz",
    email: "ahmet@lezzetduragi.com",
    phoneNumber: "+90 555 111 2233",
    role: "Employee",
    restaurantId: "1",
  },
  {
    id: "2",
    fullName: "Ayşe Demir",
    email: "ayse@lezzetduragi.com",
    phoneNumber: "+90 555 222 3344",
    role: "Employee",
    restaurantId: "1",
  },
  {
    id: "3",
    fullName: "Mehmet Kaya",
    email: "mehmet@lezzetduragi.com",
    phoneNumber: "+90 555 333 4455",
    role: "Employee",
    restaurantId: "1",
  },
]

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      setEmployees(mockEmployees)
      setLoading(false)
    }

    fetchEmployees()
  }, [])

  const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const employeeData = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      role: "Employee",
      restaurantId: "1",
    }

    await new Promise((resolve) => setTimeout(resolve, 500))

    const newEmployee: Employee = {
      id: Date.now().toString(),
      ...employeeData,
    }
    setEmployees([...employees, newEmployee])
    toast({ title: "Çalışan eklendi", description: "Giriş bilgileri e-posta ile gönderildi." })

    setIsDialogOpen(false)
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm("Bu çalışanı silmek istediğinizden emin misiniz?")) return

    await new Promise((resolve) => setTimeout(resolve, 500))
    setEmployees(employees.filter((e) => e.id !== employeeId))
    toast({ title: "Çalışan silindi" })
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Çalışan Yönetimi</h1>
          <p className="text-muted-foreground">Restoranınızdaki çalışanları yönetin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Çalışan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Çalışan Ekle</DialogTitle>
              <DialogDescription>
                Çalışan bilgilerini girin. Giriş bilgileri otomatik olarak e-posta ile gönderilecektir.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Ad Soyad</Label>
                <Input id="fullName" name="fullName" required />
              </div>
              <div>
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Telefon</Label>
                <Input id="phoneNumber" name="phoneNumber" type="tel" placeholder="+90 555 123 4567" required />
              </div>
              <Button type="submit" className="w-full">
                Çalışan Ekle
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {employees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserCog className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Henüz çalışan yok</h3>
            <p className="text-muted-foreground mb-4">İlk çalışanınızı ekleyin</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <Card key={employee.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{employee.fullName}</CardTitle>
                    <Badge variant="secondary" className="mt-2">
                      {employee.role}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{employee.phoneNumber}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 bg-transparent"
                  onClick={() => handleDeleteEmployee(employee.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Çalışanı Çıkar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
