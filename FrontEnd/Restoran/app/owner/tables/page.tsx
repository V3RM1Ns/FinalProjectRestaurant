"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRestaurant } from "@/contexts/restaurant-context"
import { ownerApi } from "@/lib/owner-api"
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
import { Table, TableStatus, TableLocation, TableLocationLabels } from "@/types"
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function OwnerTablesPage() {
  const { selectedRestaurant } = useRestaurant()
  const { toast } = useToast()
  
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [tableForm, setTableForm] = useState({
    tableNumber: 0,
    capacity: 2,
    status: "Available" as string,
    location: TableLocation.IcMekan as string,
  })

  useEffect(() => {
    if (selectedRestaurant) {
      loadTables()
    }
  }, [selectedRestaurant])

  const loadTables = async () => {
    if (!selectedRestaurant) return
    
    setLoading(true)
    try {
      const data = await ownerApi.tables.getAll(selectedRestaurant.id)
      setTables(data)
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Masalar yüklenirken hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTable = async () => {
    if (!selectedRestaurant) return
    
    if (tableForm.tableNumber <= 0) {
      toast({
        title: "Hata",
        description: "Masa numarası 0'dan büyük olmalıdır",
        variant: "destructive",
      })
      return
    }
    
    if (tableForm.capacity <= 0) {
      toast({
        title: "Hata",
        description: "Kapasite 0'dan büyük olmalıdır",
        variant: "destructive",
      })
      return
    }
    
    if (!tableForm.location) {
      toast({
        title: "Hata",
        description: "Lütfen bir konum seçin",
        variant: "destructive",
      })
      return
    }
    
    try {
      if (editingTable) {
        // Güncelleme - tüm alanları gönder
        await ownerApi.tables.update(editingTable.id, tableForm)
        toast({
          title: "Başarılı",
          description: "Masa güncellendi",
        })
      } else {
        // Yeni ekleme - status göndermiyoruz, backend otomatik Available yapacak
        const { status, ...createData } = tableForm
        await ownerApi.tables.create(selectedRestaurant.id, createData)
        toast({
          title: "Başarılı",
          description: "Masa eklendi (Durum: Müsait)",
        })
      }
      
      setDialogOpen(false)
      setEditingTable(null)
      setTableForm({ tableNumber: 0, capacity: 2, status: "Available", location: TableLocation.IcMekan })
      await loadTables()
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
      await ownerApi.tables.delete(tableId)
      toast({
        title: "Başarılı",
        description: "Masa silindi",
      })
      await loadTables()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Silme işlemi başarısız",
        variant: "destructive",
      })
    }
  }

  const handleEditTable = (table: Table) => {
    setEditingTable(table)
    setTableForm({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      status: table.status,
      location: table.location || TableLocation.IcMekan,
    })
    setDialogOpen(true)
  }

  const handleUpdateStatus = async (tableId: string, newStatus: string) => {
    try {
      await ownerApi.tables.updateStatus(tableId, newStatus)
      toast({
        title: "Başarılı",
        description: "Masa durumu güncellendi",
      })
      await loadTables()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İşlem başarısız",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case TableStatus.Available:
        return "default"
      case TableStatus.Occupied:
        return "destructive"
      case TableStatus.Reserved:
        return "secondary"
      case TableStatus.OutOfService:
        return "outline"
      default:
        return "default"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case TableStatus.Available:
        return "Müsait"
      case TableStatus.Occupied:
        return "Dolu"
      case TableStatus.Reserved:
        return "Rezerve"
      case TableStatus.OutOfService:
        return "Hizmet Dışı"
      default:
        return status
    }
  }

  const getLocationLabel = (location?: string) => {
    if (!location) return "-"
    // Backend'den enum değeri gelirse label'a çevir
    if (location in TableLocationLabels) {
      return TableLocationLabels[location as TableLocation]
    }
    return location
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

  const availableTables = tables.filter(t => t.status === TableStatus.Available).length
  const occupiedTables = tables.filter(t => t.status === TableStatus.Occupied).length
  const reservedTables = tables.filter(t => t.status === TableStatus.Reserved).length

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Masa Yönetimi</h1>
          <p className="text-muted-foreground">{selectedRestaurant.name}</p>
        </div>
        <Button onClick={() => {
          setEditingTable(null)
          setTableForm({ tableNumber: 0, capacity: 2, status: "Available", location: TableLocation.IcMekan })
          setDialogOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Masa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Masa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tables.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Müsait</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableTables}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dolu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{occupiedTables}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rezerve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{reservedTables}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tables List */}
      <Card>
        <CardHeader>
          <CardTitle>Masalar</CardTitle>
          <CardDescription>Restoranınızdaki masaları yönetin</CardDescription>
        </CardHeader>
        <CardContent>
          {tables.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Henüz masa eklenmemiş</p>
              <Button onClick={() => {
                setEditingTable(null)
                setTableForm({ tableNumber: 0, capacity: 2, status: "Available", location: TableLocation.IcMekan })
                setDialogOpen(true)
              }}>
                <Plus className="h-4 w-4 mr-2" />
                İlk Masayı Ekle
              </Button>
            </div>
          ) : (
            <UITable>
              <TableHeader>
                <TableRow>
                  <TableHead>Masa No</TableHead>
                  <TableHead>Kapasite</TableHead>
                  <TableHead>Konum</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((table) => (
                  <TableRow key={table.id}>
                    <TableCell className="font-medium">Masa {table.tableNumber}</TableCell>
                    <TableCell>{table.capacity} kişi</TableCell>
                    <TableCell>{getLocationLabel(table.location)}</TableCell>
                    <TableCell>
                      <Select
                        value={table.status}
                        onValueChange={(value) => handleUpdateStatus(table.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue>
                            <Badge variant={getStatusBadgeVariant(table.status)}>
                              {getStatusLabel(table.status)}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TableStatus.Available}>Müsait</SelectItem>
                          <SelectItem value={TableStatus.Occupied}>Dolu</SelectItem>
                          <SelectItem value={TableStatus.Reserved}>Rezerve</SelectItem>
                          <SelectItem value={TableStatus.OutOfService}>Hizmet Dışı</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTable(table)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTable(table.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </UITable>
          )}
        </CardContent>
      </Card>

      {/* Table Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTable ? "Masayı Düzenle" : "Yeni Masa Ekle"}</DialogTitle>
            <DialogDescription>
              {editingTable ? "Masa bilgilerini güncelleyin" : "Yeni masa eklemek için bilgileri girin"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tableNumber">Masa Numarası *</Label>
                <Input
                  id="tableNumber"
                  type="number"
                  min="1"
                  value={tableForm.tableNumber}
                  onChange={(e) => setTableForm({ ...tableForm, tableNumber: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="capacity">Kapasite *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={tableForm.capacity}
                  onChange={(e) => setTableForm({ ...tableForm, capacity: parseInt(e.target.value) || 2 })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="location">Konum *</Label>
              <Select
                value={tableForm.location}
                onValueChange={(value) => setTableForm({ ...tableForm, location: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Konum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TableLocation.IcMekan}>{TableLocationLabels[TableLocation.IcMekan]}</SelectItem>
                  <SelectItem value={TableLocation.PencereKenari}>{TableLocationLabels[TableLocation.PencereKenari]}</SelectItem>
                  <SelectItem value={TableLocation.Disari}>{TableLocationLabels[TableLocation.Disari]}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Masanın bulunduğu konumu seçin
              </p>
            </div>

            {/* Durum alanı SADECE düzenleme modunda gösterilir */}
            {editingTable && (
              <div>
                <Label htmlFor="status">Durum</Label>
                <Select
                  value={tableForm.status}
                  onValueChange={(value) => setTableForm({ ...tableForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TableStatus.Available}>Müsait</SelectItem>
                    <SelectItem value={TableStatus.Occupied}>Dolu</SelectItem>
                    <SelectItem value={TableStatus.Reserved}>Rezerve</SelectItem>
                    <SelectItem value={TableStatus.OutOfService}>Hizmet Dışı</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Masanın mevcut durumunu değiştirebilirsiniz
                </p>
              </div>
            )}
            
            {/* Yeni masa eklenirken bilgilendirme mesajı göster */}
            {!editingTable && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  ℹ️ Yeni masa eklendiğinde durum otomatik olarak <strong>Müsait</strong> olarak ayarlanır.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveTable}>
              {editingTable ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
