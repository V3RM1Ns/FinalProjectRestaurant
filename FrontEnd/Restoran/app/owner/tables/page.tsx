"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, Edit, Trash2, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Table {
  id: string
  number: string
  capacity: number
  isAvailable: boolean
  restaurantId: string
}

const mockTables: Table[] = [
  { id: "1", number: "1", capacity: 2, isAvailable: true, restaurantId: "1" },
  { id: "2", number: "2", capacity: 2, isAvailable: false, restaurantId: "1" },
  { id: "3", number: "3", capacity: 4, isAvailable: true, restaurantId: "1" },
  { id: "4", number: "4", capacity: 4, isAvailable: true, restaurantId: "1" },
  { id: "5", number: "5", capacity: 6, isAvailable: true, restaurantId: "1" },
  { id: "6", number: "6", capacity: 8, isAvailable: false, restaurantId: "1" },
]

export default function TableManagementPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      setTables(mockTables)
      setLoading(false)
    }

    fetchTables()
  }, [])

  const handleSaveTable = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const tableData = {
      number: formData.get("number") as string,
      capacity: Number.parseInt(formData.get("capacity") as string),
      isAvailable: true,
      restaurantId: "1",
    }

    await new Promise((resolve) => setTimeout(resolve, 500))

    if (editingTable) {
      setTables(tables.map((t) => (t.id === editingTable.id ? { ...t, ...tableData } : t)))
      toast({ title: "Masa güncellendi" })
    } else {
      const newTable: Table = {
        id: Date.now().toString(),
        ...tableData,
      }
      setTables([...tables, newTable])
      toast({ title: "Masa eklendi" })
    }

    setIsDialogOpen(false)
    setEditingTable(null)
  }

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm("Bu masayı silmek istediğinizden emin misiniz?")) return

    await new Promise((resolve) => setTimeout(resolve, 500))
    setTables(tables.filter((t) => t.id !== tableId))
    toast({ title: "Masa silindi" })
  }

  const handleToggleAvailability = async (tableId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    setTables(tables.map((t) => (t.id === tableId ? { ...t, isAvailable: !t.isAvailable } : t)))
    toast({ title: "Masa durumu güncellendi" })
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-32 bg-muted rounded" />
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
          <h1 className="text-4xl font-bold mb-2">Masa Yönetimi</h1>
          <p className="text-muted-foreground">Restoranınızdaki masaları yönetin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTable(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Masa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTable ? "Masa Düzenle" : "Yeni Masa Ekle"}</DialogTitle>
              <DialogDescription>Masa bilgilerini girin</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveTable} className="space-y-4">
              <div>
                <Label htmlFor="number">Masa Numarası</Label>
                <Input id="number" name="number" defaultValue={editingTable?.number} required />
              </div>
              <div>
                <Label htmlFor="capacity">Kapasite (Kişi)</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  defaultValue={editingTable?.capacity}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingTable ? "Güncelle" : "Ekle"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => (
          <Card key={table.id} className={!table.isAvailable ? "opacity-60" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">Masa {table.number}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Users className="h-3 w-3" />
                    {table.capacity} Kişilik
                  </CardDescription>
                </div>
                <Badge variant={table.isAvailable ? "default" : "secondary"}>
                  {table.isAvailable ? "Müsait" : "Dolu"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={() => handleToggleAvailability(table.id)}
              >
                {table.isAvailable ? "Dolu Olarak İşaretle" : "Müsait Olarak İşaretle"}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setEditingTable(table)
                    setIsDialogOpen(true)
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Düzenle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => handleDeleteTable(table.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Sil
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
