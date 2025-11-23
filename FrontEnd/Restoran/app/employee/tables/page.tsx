"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { employeeApi, type Table } from "@/lib/employee-api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Plus, Edit, Trash2, Armchair, Users } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function EmployeeTablesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [availableCount, setAvailableCount] = useState(0)
  const [showTableDialog, setShowTableDialog] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const restaurantId = user?.restaurantId || ""

  const [tableForm, setTableForm] = useState({
    tableNumber: 0,
    capacity: 2,
    location: "",
    status: "Available" as "Available" | "Occupied" | "Reserved" | "OutOfService",
  })

  useEffect(() => {
    if (restaurantId) {
      loadTables()
      loadAvailableCount()
    }
  }, [restaurantId])

  const loadTables = async () => {
    try {
      setLoading(true)
      const result = await employeeApi.tables.getAll(restaurantId)
      setTables(result)
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Masalar yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableCount = async () => {
    try {
      const result = await employeeApi.tables.getAvailableCount(restaurantId)
      setAvailableCount(result.count)
    } catch (error: any) {
      console.error("Available count error:", error)
    }
  }

  const handleCreateTable = async () => {
    try {
      if (editingTable) {
        await employeeApi.tables.update(editingTable.id, tableForm)
        toast({
          title: "Başarılı",
          description: "Masa güncellendi",
        })
      } else {
        await employeeApi.tables.create(restaurantId, tableForm)
        toast({
          title: "Başarılı",
          description: "Masa oluşturuldu",
        })
      }
      setShowTableDialog(false)
      setTableForm({
        tableNumber: 0,
        capacity: 2,
        location: "",
        status: "Available",
      })
      setEditingTable(null)
      loadTables()
      loadAvailableCount()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İşlem başarısız",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm("Bu masayı silmek istediğinizden emin misiniz?")) return

    try {
      await employeeApi.tables.delete(tableId)
      toast({
        title: "Başarılı",
        description: "Masa silindi",
      })
      loadTables()
      loadAvailableCount()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Masa silinirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTableStatus = async (tableId: string, newStatus: string) => {
    try {
      await employeeApi.tables.updateStatus(tableId, newStatus)
      toast({
        title: "Başarılı",
        description: "Masa durumu güncellendi",
      })
      loadTables()
      loadAvailableCount()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Durum güncellenirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const openEditTable = (table: Table) => {
    setEditingTable(table)
    setTableForm({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      location: table.location || "",
      status: table.status,
    })
    setShowTableDialog(true)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      Available: "default",
      Occupied: "destructive",
      Reserved: "secondary",
      OutOfService: "outline",
    }

    const labels: Record<string, string> = {
      Available: "Müsait",
      Occupied: "Dolu",
      Reserved: "Rezerve",
      OutOfService: "Hizmet Dışı",
    }

    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Available: "bg-green-100 border-green-300 hover:bg-green-200",
      Occupied: "bg-red-100 border-red-300 hover:bg-red-200",
      Reserved: "bg-yellow-100 border-yellow-300 hover:bg-yellow-200",
      OutOfService: "bg-gray-100 border-gray-300 hover:bg-gray-200",
    }
    return colors[status] || "bg-white"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Masa Yönetimi</h1>
          <p className="text-muted-foreground">Masaları görüntüleyin ve yönetin</p>
        </div>
        <Button onClick={() => setShowTableDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Masa
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Masa</CardTitle>
            <Armchair className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tables.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Müsait Masalar</CardTitle>
            <Armchair className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dolu Masalar</CardTitle>
            <Armchair className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tables.filter((t) => t.status === "Occupied").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kapasite</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tables.reduce((sum, t) => sum + t.capacity, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Masalar</CardTitle>
          <CardDescription>Tüm masaların durumunu görüntüleyin ve yönetin</CardDescription>
        </CardHeader>
        <CardContent>
          {tables.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Masa bulunamadı</p>
          ) : (
            <div className="grid md:grid-cols-4 gap-4">
              {tables.map((table) => (
                <Card key={table.id} className={`${getStatusColor(table.status)} transition-colors`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Masa {table.tableNumber}</CardTitle>
                        {table.location && (
                          <CardDescription className="text-xs mt-1">{table.location}</CardDescription>
                        )}
                      </div>
                      {getStatusBadge(table.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      <span>{table.capacity} Kişi</span>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Durum Değiştir</Label>
                      <Select
                        value={table.status}
                        onValueChange={(value) => handleUpdateTableStatus(table.id, value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Available">Müsait</SelectItem>
                          <SelectItem value="Occupied">Dolu</SelectItem>
                          <SelectItem value="Reserved">Rezerve</SelectItem>
                          <SelectItem value="OutOfService">Hizmet Dışı</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditTable(table)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Düzenle
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTable(table.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table Dialog */}
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTable ? "Masayı Düzenle" : "Yeni Masa Oluştur"}</DialogTitle>
            <DialogDescription>Masa bilgilerini girin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tableNumber">Masa Numarası</Label>
                <Input
                  id="tableNumber"
                  type="number"
                  value={tableForm.tableNumber}
                  onChange={(e) => setTableForm({ ...tableForm, tableNumber: parseInt(e.target.value) })}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="capacity">Kapasite</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={tableForm.capacity}
                  onChange={(e) => setTableForm({ ...tableForm, capacity: parseInt(e.target.value) })}
                  placeholder="2"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Konum</Label>
              <Input
                id="location"
                value={tableForm.location}
                onChange={(e) => setTableForm({ ...tableForm, location: e.target.value })}
                placeholder="Örn: Pencere Kenarı, Balkon, İç Mekan"
              />
            </div>
            <div>
              <Label htmlFor="status">Durum</Label>
              <Select
                value={tableForm.status}
                onValueChange={(value: any) => setTableForm({ ...tableForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Müsait</SelectItem>
                  <SelectItem value="Occupied">Dolu</SelectItem>
                  <SelectItem value="Reserved">Rezerve</SelectItem>
                  <SelectItem value="OutOfService">Hizmet Dışı</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTableDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleCreateTable}>{editingTable ? "Güncelle" : "Oluştur"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

