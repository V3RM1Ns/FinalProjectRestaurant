"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { employeeApi, type Menu, type MenuItem } from "@/lib/employee-api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, UtensilsCrossed } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export default function EmployeeMenusPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [menuItemsCount, setMenuItemsCount] = useState(0)
  const [showMenuDialog, setShowMenuDialog] = useState(false)
  const [showMenuItemDialog, setShowMenuItemDialog] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const restaurantId = user?.restaurantId || ""

  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
    isActive: true,
  })

  const [menuItemForm, setMenuItemForm] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    imageUrl: "",
    isAvailable: true,
    preparationTime: 0,
  })

  useEffect(() => {
    if (restaurantId) {
      loadMenus()
      loadMenuItemsCount()
    }
  }, [restaurantId])

  const loadMenus = async () => {
    try {
      setLoading(true)
      const result = await employeeApi.menus.getAll(restaurantId)
      setMenus(result)
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Menüler yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMenuItems = async (menuId: string) => {
    try {
      const result = await employeeApi.menuItems.getAll(menuId, 1, 100)
      setMenuItems(result.items || [])
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Menü öğeleri yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const loadMenuItemsCount = async () => {
    try {
      const result = await employeeApi.menuItems.getCount(restaurantId)
      setMenuItemsCount(result.count)
    } catch (error: any) {
      console.error("Menu items count error:", error)
    }
  }

  const handleCreateMenu = async () => {
    try {
      if (editingMenu) {
        await employeeApi.menus.update(editingMenu.id, menuForm)
        toast({
          title: "Başarılı",
          description: "Menü güncellendi",
        })
      } else {
        await employeeApi.menus.create(restaurantId, menuForm)
        toast({
          title: "Başarılı",
          description: "Menü oluşturuldu",
        })
      }
      setShowMenuDialog(false)
      setMenuForm({ name: "", description: "", isActive: true })
      setEditingMenu(null)
      loadMenus()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İşlem başarısız",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm("Bu menüyü silmek istediğinizden emin misiniz?")) return

    try {
      await employeeApi.menus.delete(menuId)
      toast({
        title: "Başarılı",
        description: "Menü silindi",
      })
      loadMenus()
      if (selectedMenu?.id === menuId) {
        setSelectedMenu(null)
        setMenuItems([])
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Menü silinirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleCreateMenuItem = async () => {
    if (!selectedMenu) return

    try {
      if (editingMenuItem) {
        await employeeApi.menuItems.update(editingMenuItem.id, menuItemForm)
        toast({
          title: "Başarılı",
          description: "Menü öğesi güncellendi",
        })
      } else {
        await employeeApi.menuItems.create(selectedMenu.id, menuItemForm)
        toast({
          title: "Başarılı",
          description: "Menü öğesi oluşturuldu",
        })
      }
      setShowMenuItemDialog(false)
      setMenuItemForm({
        name: "",
        description: "",
        price: 0,
        category: "",
        imageUrl: "",
        isAvailable: true,
        preparationTime: 0,
      })
      setEditingMenuItem(null)
      loadMenuItems(selectedMenu.id)
      loadMenuItemsCount()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İşlem başarısız",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMenuItem = async (menuItemId: string) => {
    if (!confirm("Bu menü öğesini silmek istediğinizden emin misiniz?")) return

    try {
      await employeeApi.menuItems.delete(menuItemId)
      toast({
        title: "Başarılı",
        description: "Menü öğesi silindi",
      })
      if (selectedMenu) {
        loadMenuItems(selectedMenu.id)
      }
      loadMenuItemsCount()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Menü öğesi silinirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleToggleMenuItemAvailability = async (menuItemId: string, isAvailable: boolean) => {
    try {
      await employeeApi.menuItems.updateAvailability(menuItemId, !isAvailable)
      toast({
        title: "Başarılı",
        description: "Menü öğesi durumu güncellendi",
      })
      if (selectedMenu) {
        loadMenuItems(selectedMenu.id)
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Durum güncellenirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const openEditMenu = (menu: Menu) => {
    setEditingMenu(menu)
    setMenuForm({
      name: menu.name,
      description: menu.description || "",
      isActive: menu.isActive,
    })
    setShowMenuDialog(true)
  }

  const openEditMenuItem = (menuItem: MenuItem) => {
    setEditingMenuItem(menuItem)
    setMenuItemForm({
      name: menuItem.name,
      description: menuItem.description || "",
      price: menuItem.price,
      category: menuItem.category || "",
      imageUrl: menuItem.imageUrl || "",
      isAvailable: menuItem.isAvailable,
      preparationTime: menuItem.preparationTime || 0,
    })
    setShowMenuItemDialog(true)
  }

  const selectMenu = (menu: Menu) => {
    setSelectedMenu(menu)
    loadMenuItems(menu.id)
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
          <h1 className="text-3xl font-bold">Menü Yönetimi</h1>
          <p className="text-muted-foreground">Menüleri ve menü öğelerini yönetin</p>
        </div>
        <Button onClick={() => setShowMenuDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Menü
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Menü</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menus.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Menüler</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menus.filter((m) => m.isActive).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Menü Öğesi</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menuItemsCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Menus List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Menüler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {menus.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Menü bulunamadı</p>
            ) : (
              menus.map((menu) => (
                <div
                  key={menu.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMenu?.id === menu.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
                  }`}
                  onClick={() => selectMenu(menu)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{menu.name}</h3>
                    <Badge variant={menu.isActive ? "default" : "secondary"}>
                      {menu.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                  {menu.description && (
                    <p className="text-sm text-muted-foreground mb-3">{menu.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditMenu(menu)
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteMenu(menu.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{selectedMenu ? selectedMenu.name : "Menü Öğeleri"}</CardTitle>
                <CardDescription>
                  {selectedMenu ? "Menü öğelerini görüntüleyin ve yönetin" : "Bir menü seçin"}
                </CardDescription>
              </div>
              {selectedMenu && (
                <Button onClick={() => setShowMenuItemDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Öğe Ekle
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedMenu ? (
              <p className="text-center text-muted-foreground py-8">Lütfen bir menü seçin</p>
            ) : menuItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Bu menüde öğe bulunmuyor</p>
            ) : (
              <div className="space-y-4">
                {menuItems.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{item.name}</h4>
                          <Badge variant={item.isAvailable ? "default" : "secondary"}>
                            {item.isAvailable ? "Mevcut" : "Mevcut Değil"}
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        )}
                        <div className="flex gap-4 text-sm">
                          <span className="font-semibold text-primary">₺{item.price.toFixed(2)}</span>
                          {item.category && <span className="text-muted-foreground">{item.category}</span>}
                          {item.preparationTime && (
                            <span className="text-muted-foreground">{item.preparationTime} dk</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleMenuItemAvailability(item.id, item.isAvailable)}
                        >
                          {item.isAvailable ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEditMenuItem(item)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteMenuItem(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Menu Dialog */}
      <Dialog open={showMenuDialog} onOpenChange={setShowMenuDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMenu ? "Menüyü Düzenle" : "Yeni Menü Oluştur"}</DialogTitle>
            <DialogDescription>Menü bilgilerini girin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Menü Adı</Label>
              <Input
                id="name"
                value={menuForm.name}
                onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                placeholder="Örn: Ana Yemekler"
              />
            </div>
            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={menuForm.description}
                onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                placeholder="Menü açıklaması (opsiyonel)"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={menuForm.isActive}
                onCheckedChange={(checked) => setMenuForm({ ...menuForm, isActive: checked })}
              />
              <Label htmlFor="isActive">Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMenuDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleCreateMenu}>{editingMenu ? "Güncelle" : "Oluştur"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menu Item Dialog */}
      <Dialog open={showMenuItemDialog} onOpenChange={setShowMenuItemDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMenuItem ? "Menü Öğesini Düzenle" : "Yeni Menü Öğesi Ekle"}</DialogTitle>
            <DialogDescription>Menü öğesi bilgilerini girin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemName">Öğe Adı</Label>
                <Input
                  id="itemName"
                  value={menuItemForm.name}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, name: e.target.value })}
                  placeholder="Örn: İskender Kebap"
                />
              </div>
              <div>
                <Label htmlFor="price">Fiyat (₺)</Label>
                <Input
                  id="price"
                  type="number"
                  value={menuItemForm.price}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, price: parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="itemDescription">Açıklama</Label>
              <Textarea
                id="itemDescription"
                value={menuItemForm.description}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, description: e.target.value })}
                placeholder="Öğe açıklaması (opsiyonel)"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  value={menuItemForm.category}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, category: e.target.value })}
                  placeholder="Örn: Kebaplar"
                />
              </div>
              <div>
                <Label htmlFor="preparationTime">Hazırlık Süresi (dk)</Label>
                <Input
                  id="preparationTime"
                  type="number"
                  value={menuItemForm.preparationTime}
                  onChange={(e) =>
                    setMenuItemForm({ ...menuItemForm, preparationTime: parseInt(e.target.value) })
                  }
                  placeholder="20"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="imageUrl">Görsel URL</Label>
              <Input
                id="imageUrl"
                value={menuItemForm.imageUrl}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isAvailable"
                checked={menuItemForm.isAvailable}
                onCheckedChange={(checked) => setMenuItemForm({ ...menuItemForm, isAvailable: checked })}
              />
              <Label htmlFor="isAvailable">Mevcut</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMenuItemDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleCreateMenuItem}>{editingMenuItem ? "Güncelle" : "Ekle"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

