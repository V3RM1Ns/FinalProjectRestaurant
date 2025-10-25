"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRestaurant } from "@/contexts/restaurant-context"
import { tableApi } from "@/lib/api"
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
import { Table as TableType, TableStatus } from "@/types"
import {
  Table,
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
  
  const [tables, setTables] = useState<TableType[]>([])
  const [loading, setLoading] = useState(true)
  
  const [tableDialogOpen, setTableDialogOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<TableType | null>(null)
  const [tableForm, setTableForm] = useState({
    tableNumber: 0,
    capacity: 2,
    status: TableStatus.Available,
    location: "",
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
      const data = await tableApi.getByRestaurant(selectedRestaurant.id)
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
    
    try {
      const data = {
        ...tableForm,
        restaurantId: selectedRestaurant.id,
      }
      
      if (editingTable) {
        await tableApi.update(editingTable.id, data)
        toast({
          title: "Başarılı",
          description: "Masa güncellendi",
        })
      } else {
        await tableApi.create(data)
        toast({
          title: "Başarılı",
          description: "Masa eklendi",
        })
      }
      
      setTableDialogOpen(false)
      setEditingTable(null)
      setTableForm({
        tableNumber: 0,
        capacity: 2,
        status: TableStatus.Available,
        location: "",
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

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm("Bu masayı silmek istediğinizden emin misiniz?")) return
    
    try {
      await tableApi.delete(tableId)
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

  const handleEditTable = (table: TableType) => {
    setEditingTable(table)
    setTableForm({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      status: table.status,
      location: table.location || "",
    })
    setTableDialogOpen(true)
  }

  const getStatusBadgeVariant = (status: TableStatus) => {
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

  const getStatusText = (status: TableStatus) => {
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

  const availableCount = tables.filter(t => t.status === TableStatus.Available).length
  const occupiedCount = tables.filter(t => t.status === TableStatus.Occupied).length
  const reservedCount = tables.filter(t => t.status === TableStatus.Reserved).length

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Masalar</h1>
          <p className="text-muted-foreground">{selectedRestaurant.name}</p>
        </div>
        <Button onClick={() => {
          setEditingTable(null)
          setTableForm({
            tableNumber: tables.length + 1,
            capacity: 2,
            status: TableStatus.Available,
            location: "",
          })
          setTableDialogOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Masa
        </Button>
      </div>

      {/* Stats */}
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
            <div className="text-2xl font-bold text-green-600">{availableCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dolu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{occupiedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rezerve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{reservedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tables List */}
      <Card>
        <CardHeader>
          <CardTitle>Masa Listesi</CardTitle>
          <CardDescription>Restoranınızdaki masaları yönetin</CardDescription>
        </CardHeader>
        <CardContent>
          {tables.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Henüz masa eklenmemiş</p>
              <Button onClick={() => {
                setEditingTable(null)
                setTableForm({
                  tableNumber: 1,
                  capacity: 2,
                  status: TableStatus.Available,
                  location: "",
                })
                setTableDialogOpen(true)
              }}>
                <Plus className="h-4 w-4 mr-2" />
                İlk Masayı Ekle
              </Button>
            </div>
          ) : (
            <Table>
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
                    <TableCell className="font-medium">#{table.tableNumber}</TableCell>
                    <TableCell>{table.capacity} kişi</TableCell>
                    <TableCell>{table.location || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(table.status)}>
                        {getStatusText(table.status)}
                      </Badge>
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
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Table Dialog */}
      <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTable ? "Masayı Düzenle" : "Yeni Masa Ekle"}</DialogTitle>
            <DialogDescription>
              Masa bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tableNumber">Masa Numarası</Label>
                <Input
                  id="tableNumber"
                  type="number"
                  min="1"
                  value={tableForm.tableNumber}
                  onChange={(e) => setTableForm({ ...tableForm, tableNumber: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="capacity">Kapasite (Kişi)</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={tableForm.capacity}
                  onChange={(e) => setTableForm({ ...tableForm, capacity: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Konum (Opsiyonel)</Label>
              <Input
                id="location"
                value={tableForm.location}
                onChange={(e) => setTableForm({ ...tableForm, location: e.target.value })}
                placeholder="Örn: Pencere kenarı, Bahçe..."
              />
            </div>
            <div>
              <Label htmlFor="status">Durum</Label>
              <Select
                value={tableForm.status}
                onValueChange={(value) => setTableForm({ ...tableForm, status: value as TableStatus })}
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTableDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveTable}>
              {editingTable ? "Kaydet" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
