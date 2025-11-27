"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Gift, Trash2, Search, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface LoyaltyCode {
  id: string
  code: string
  pointValue: number
  description: string
  isActive: boolean
  maxUses: number
  currentUses: number
  createdAt: string
  expiryDate: string
  isUsed: boolean
  restaurantId: string
}

interface Restaurant {
  id: string
  name: string
}

export default function AdminLoyaltyCodesPage() {
  const [codes, setCodes] = useState<LoyaltyCode[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const [newCode, setNewCode] = useState({
    pointValue: 0,
    description: "",
    maxUses: 1,
    expiryDate: "",
    restaurantId: "",
  })

  useEffect(() => {
    fetchCodes()
    fetchRestaurants()
  }, [])

  const fetchCodes = async () => {
    try {
      setLoading(true)
      const data = await api.get<LoyaltyCode[]>("/Loyalty/admin/codes")
      setCodes(data)
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Kodlar yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRestaurants = async () => {
    try {
      const data = await api.get<Restaurant[]>("/Admin/restaurants")
      setRestaurants(data)
    } catch (error: any) {
      console.error("Restoranlar yüklenemedi:", error)
    }
  }

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newCode.restaurantId) {
      toast({
        title: "Hata",
        description: "Lütfen bir restoran seçin",
        variant: "destructive",
      })
      return
    }

    try {
      await api.post("/Loyalty/admin/codes", newCode)
      toast({
        title: "Başarılı",
        description: "Loyalty kodu oluşturuldu",
      })
      setDialogOpen(false)
      setNewCode({
        pointValue: 0,
        description: "",
        maxUses: 1,
        expiryDate: "",
        restaurantId: "",
      })
      fetchCodes()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.response?.data?.message || "Kod oluşturulurken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleDeactivateCode = async (codeId: string) => {
    try {
      await api.patch(`/Loyalty/admin/codes/${codeId}/deactivate`)
      toast({
        title: "Başarılı",
        description: "Kod deaktif edildi",
      })
      fetchCodes()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Kod deaktif edilirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const filteredCodes = codes.filter((code) =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Gift className="w-8 h-8" />
            Loyalty Kodları Yönetimi
          </h1>
          <p className="text-muted-foreground">Puan kodlarını oluşturun ve yönetin</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Kod Oluştur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Loyalty Kodu Oluştur</DialogTitle>
              <DialogDescription>
                Müşterilere puan kazandırmak için yeni bir kod oluşturun
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCode} className="space-y-4">
              <div>
                <Label htmlFor="pointValue">Puan Değeri</Label>
                <Input
                  id="pointValue"
                  type="number"
                  value={newCode.pointValue}
                  onChange={(e) => setNewCode({ ...newCode, pointValue: Number(e.target.value) })}
                  required
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={newCode.description}
                  onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="maxUses">Maksimum Kullanım</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={newCode.maxUses}
                  onChange={(e) => setNewCode({ ...newCode, maxUses: Number(e.target.value) })}
                  required
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Son Kullanma Tarihi</Label>
                <Input
                  id="expiryDate"
                  type="datetime-local"
                  value={newCode.expiryDate}
                  onChange={(e) => setNewCode({ ...newCode, expiryDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="restaurant">Restoran</Label>
                <Select value={newCode.restaurantId} onValueChange={(value) => setNewCode({ ...newCode, restaurantId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Restoran seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Oluştur</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Kod veya açıklama ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredCodes.map((code) => (
          <Card key={code.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <span className="font-mono text-lg">{code.code}</span>
                    {code.isActive ? (
                      <Badge variant="default">Aktif</Badge>
                    ) : (
                      <Badge variant="secondary">Deaktif</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{code.description}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeactivateCode(code.id)}
                  disabled={!code.isActive}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Puan Değeri</p>
                  <p className="font-semibold">{code.pointValue}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kullanım</p>
                  <p className="font-semibold">{code.currentUses} / {code.maxUses}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Oluşturulma</p>
                  <p className="font-semibold">{new Date(code.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Son Kullanma</p>
                  <p className="font-semibold">{new Date(code.expiryDate).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredCodes.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Henüz kod bulunamadı
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

