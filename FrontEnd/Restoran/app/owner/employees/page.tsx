"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Mail, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRestaurant } from "@/contexts/restaurant-context"
import { employeeApi } from "@/lib/api"
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
import { AppUser } from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

export default function OwnerEmployeesPage() {
  const { selectedRestaurant } = useRestaurant()
  const { toast } = useToast()
  
  const [employees, setEmployees] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<AppUser | null>(null)
  const [employeeForm, setEmployeeForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    address: "",
  })

  useEffect(() => {
    if (selectedRestaurant) {
      loadEmployees()
    }
  }, [selectedRestaurant])

  const loadEmployees = async () => {
    if (!selectedRestaurant) return
    
    setLoading(true)
    try {
      const data = await employeeApi.getByRestaurant(selectedRestaurant.id)
      setEmployees(data)
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Çalışanlar yüklenirken hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEmployee = async () => {
    if (!selectedRestaurant) return
    
    // Validasyon
    if (!employeeForm.fullName || !employeeForm.email) {
      toast({
        title: "Hata",
        description: "Lütfen zorunlu alanları doldurun",
        variant: "destructive",
      })
      return
    }

    if (!editingEmployee && !employeeForm.password) {
      toast({
        title: "Hata",
        description: "Şifre gereklidir",
        variant: "destructive",
      })
      return
    }
    
    try {
      const data = {
        ...employeeForm,
        ...(editingEmployee && !employeeForm.password && { password: undefined }),
      }
      
      if (editingEmployee) {
        await employeeApi.update(selectedRestaurant.id, editingEmployee.id, data)
        toast({
          title: "Başarılı",
          description: "Çalışan güncellendi",
        })
      } else {
        await employeeApi.create(selectedRestaurant.id, data)
        toast({
          title: "Başarılı",
          description: "Çalışan eklendi",
        })
      }
      
      setEmployeeDialogOpen(false)
      setEditingEmployee(null)
      setEmployeeForm({
        fullName: "",
        email: "",
        phoneNumber: "",
        password: "",
        address: "",
      })
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
      await employeeApi.delete(selectedRestaurant.id, employeeId)
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
      address: employee.address || "",
    })
    setEmployeeDialogOpen(true)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
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
          <h1 className="text-3xl font-bold">Çalışanlar</h1>
          <p className="text-muted-foreground">{selectedRestaurant.name}</p>
        </div>
        <Button onClick={() => {
          setEditingEmployee(null)
          setEmployeeForm({
            fullName: "",
            email: "",
            phoneNumber: "",
            password: "",
            address: "",
          })
          setEmployeeDialogOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Çalışan
        </Button>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Toplam Çalışan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{employees.length}</div>
          <p className="text-xs text-muted-foreground">
            Aktif personel sayısı
          </p>
        </CardContent>
      </Card>

      {/* Employees List */}
      <Card>
        <CardHeader>
          <CardTitle>Çalışan Listesi</CardTitle>
          <CardDescription>Restoranınızda çalışan personeli yönetin</CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Henüz çalışan bulunmuyor</p>
              <Button onClick={() => {
                setEditingEmployee(null)
                setEmployeeForm({
                  fullName: "",
                  email: "",
                  phoneNumber: "",
                  password: "",
                  address: "",
                })
                setEmployeeDialogOpen(true)
              }}>
                <Plus className="h-4 w-4 mr-2" />
                İlk Çalışanı Ekle
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Çalışan</TableHead>
                  <TableHead>İletişim</TableHead>
                  <TableHead>Adres</TableHead>
                  <TableHead>Kayıt Tarihi</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={employee.profileImageUrl} />
                          <AvatarFallback>{getInitials(employee.fullName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.fullName}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {employee.phoneNumber ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {employee.phoneNumber}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {employee.address || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      {new Date(employee.createdAt).toLocaleDateString('tr-TR')}
                    </TableCell>
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Employee Dialog */}
      <Dialog open={employeeDialogOpen} onOpenChange={setEmployeeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "Çalışanı Düzenle" : "Yeni Çalışan Ekle"}</DialogTitle>
            <DialogDescription>
              Çalışan bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Ad Soyad *</Label>
              <Input
                id="fullName"
                value={employeeForm.fullName}
                onChange={(e) => setEmployeeForm({ ...employeeForm, fullName: e.target.value })}
                placeholder="Örn: Ahmet Yılmaz"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={employeeForm.email}
                onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                placeholder="ornek@email.com"
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Telefon</Label>
              <Input
                id="phoneNumber"
                value={employeeForm.phoneNumber}
                onChange={(e) => setEmployeeForm({ ...employeeForm, phoneNumber: e.target.value })}
                placeholder="0555 123 45 67"
              />
            </div>
            <div>
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                value={employeeForm.address}
                onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })}
                placeholder="Tam adres..."
              />
            </div>
            <div>
              <Label htmlFor="password">
                Şifre {editingEmployee ? "(Değiştirmek için doldurun)" : "*"}
              </Label>
              <Input
                id="password"
                type="password"
                value={employeeForm.password}
                onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                placeholder={editingEmployee ? "Boş bırakabilirsiniz" : "Güçlü şifre"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmployeeDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveEmployee}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
