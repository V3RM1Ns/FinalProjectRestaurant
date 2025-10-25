"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRestaurant } from "@/contexts/restaurant-context"
import { menuApi } from "@/lib/api"
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
import { Menu, MenuItem } from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function OwnerMenusPage() {
  const { selectedRestaurant } = useRestaurant()
  const { toast } = useToast()
  
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  
  // Menu Dialog
  const [menuDialogOpen, setMenuDialogOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
  })
  
  // Menu Item Dialog
  const [menuItemDialogOpen, setMenuItemDialogOpen] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null)
  const [selectedMenuId, setSelectedMenuId] = useState<string>("")
  const [menuItemForm, setMenuItemForm] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    isAvailable: true,
    imageUrl: "",
  })

  useEffect(() => {
    if (selectedRestaurant) {
      loadMenus()
    }
  }, [selectedRestaurant])

  const loadMenus = async () => {
    if (!selectedRestaurant) return
    
    setLoading(true)
    try {
      const data = await menuApi.getByRestaurant(selectedRestaurant.id)
      setMenus(data)
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Menüler yüklenirken hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Menu CRUD operations
  const handleSaveMenu = async () => {
    if (!selectedRestaurant) return
    
    try {
      if (editingMenu) {
        await menuApi.update(editingMenu.id, {
          ...menuForm,
          restaurantId: selectedRestaurant.id,
        })
        toast({
          title: "Başarılı",
          description: "Menü güncellendi",
        })
      } else {
        await menuApi.create({
          ...menuForm,
          restaurantId: selectedRestaurant.id,
        })
        toast({
          title: "Başarılı",
          description: "Menü oluşturuldu",
        })
      }
      
      setMenuDialogOpen(false)
      setEditingMenu(null)
      setMenuForm({ name: "", description: "" })
      await loadMenus()
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
      await menuApi.delete(menuId)
      toast({
        title: "Başarılı",
        description: "Menü silindi",
      })
      await loadMenus()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Silme işlemi başarısız",
        variant: "destructive",
      })
    }
  }

  const handleEditMenu = (menu: Menu) => {
    setEditingMenu(menu)
    setMenuForm({
      name: menu.name,
      description: menu.description,
    })
    setMenuDialogOpen(true)
  }

  // Menu Item CRUD operations
  const handleSaveMenuItem = async () => {
    if (!selectedMenuId) return
    
    try {
      const data = {
        ...menuItemForm,
        menuId: selectedMenuId,
      }
      
      if (editingMenuItem) {
        await menuApi.update(editingMenuItem.id, data)
        toast({
          title: "Başarılı",
          description: "Ürün güncellendi",
        })
      } else {
        await menuApi.create(data)
        toast({
          title: "Başarılı",
          description: "Ürün eklendi",
        })
      }
      
      setMenuItemDialogOpen(false)
      setEditingMenuItem(null)
      setMenuItemForm({
        name: "",
        description: "",
        price: 0,
        category: "",
        isAvailable: true,
        imageUrl: "",
      })
      await loadMenus()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İşlem başarısız",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMenuItem = async (menuItemId: string) => {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return
    
    try {
      await menuApi.delete(menuItemId)
      toast({
        title: "Başarılı",
        description: "Ürün silindi",
      })
      await loadMenus()
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Silme işlemi başarısız",
        variant: "destructive",
      })
    }
  }

  const handleEditMenuItem = (menuId: string, menuItem: MenuItem) => {
    setSelectedMenuId(menuId)
    setEditingMenuItem(menuItem)
    setMenuItemForm({
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price,
      category: menuItem.category || "",
      isAvailable: menuItem.isAvailable,
      imageUrl: menuItem.imageUrl || "",
    })
    setMenuItemDialogOpen(true)
  }

  const handleAddMenuItem = (menuId: string) => {
    setSelectedMenuId(menuId)
    setEditingMenuItem(null)
    setMenuItemForm({
      name: "",
      description: "",
      price: 0,
      category: "",
      isAvailable: true,
      imageUrl: "",
    })
    setMenuItemDialogOpen(true)
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
          <h1 className="text-3xl font-bold">Menüler</h1>
          <p className="text-muted-foreground">{selectedRestaurant.name}</p>
        </div>
        <Button onClick={() => {
          setEditingMenu(null)
          setMenuForm({ name: "", description: "" })
          setMenuDialogOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Menü
        </Button>
      </div>

      {menus.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Henüz menü oluşturulmamış</p>
            <Button onClick={() => {
              setEditingMenu(null)
              setMenuForm({ name: "", description: "" })
              setMenuDialogOpen(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              İlk Menüyü Oluştur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {menus.map((menu) => (
            <AccordionItem key={menu.id} value={menu.id}>
              <Card>
                <AccordionTrigger className="px-6 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="text-left">
                      <h3 className="text-lg font-semibold">{menu.name}</h3>
                      <p className="text-sm text-muted-foreground">{menu.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {menu.menuItems?.length || 0} ürün
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditMenu(menu)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteMenu(menu.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Menü Ürünleri</h4>
                      <Button
                        size="sm"
                        onClick={() => handleAddMenuItem(menu.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ürün Ekle
                      </Button>
                    </div>
                    
                    {(!menu.menuItems || menu.menuItems.length === 0) ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Bu menüde henüz ürün bulunmuyor</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ürün Adı</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Fiyat</TableHead>
                            <TableHead>Durumu</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {menu.menuItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.description}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>{item.category || "-"}</TableCell>
                              <TableCell className="font-medium">
                                ₺{item.price.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Badge variant={item.isAvailable ? "default" : "secondary"}>
                                  {item.isAvailable ? "Mevcut" : "Mevcut Değil"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditMenuItem(menu.id, item)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteMenuItem(item.id)}
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
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Menu Dialog */}
      <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMenu ? "Menüyü Düzenle" : "Yeni Menü Oluştur"}</DialogTitle>
            <DialogDescription>
              Menü bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="menuName">Menü Adı</Label>
              <Input
                id="menuName"
                value={menuForm.name}
                onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                placeholder="Örn: Ana Yemekler, Tatlılar..."
              />
            </div>
            <div>
              <Label htmlFor="menuDescription">Açıklama</Label>
              <Textarea
                id="menuDescription"
                value={menuForm.description}
                onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                placeholder="Menü hakkında kısa açıklama..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMenuDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveMenu}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menu Item Dialog */}
      <Dialog open={menuItemDialogOpen} onOpenChange={setMenuItemDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMenuItem ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</DialogTitle>
            <DialogDescription>
              Ürün bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemName">Ürün Adı</Label>
                <Input
                  id="itemName"
                  value={menuItemForm.name}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, name: e.target.value })}
                  placeholder="Örn: İskender Kebap"
                />
              </div>
              <div>
                <Label htmlFor="itemCategory">Kategori</Label>
                <Input
                  id="itemCategory"
                  value={menuItemForm.category}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, category: e.target.value })}
                  placeholder="Örn: Kebaplar"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="itemDescription">Açıklama</Label>
              <Textarea
                id="itemDescription"
                value={menuItemForm.description}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, description: e.target.value })}
                placeholder="Ürün hakkında detaylı açıklama..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemPrice">Fiyat (₺)</Label>
                <Input
                  id="itemPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={menuItemForm.price}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, price: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="itemImageUrl">Resim URL (Opsiyonel)</Label>
                <Input
                  id="itemImageUrl"
                  value={menuItemForm.imageUrl}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="itemAvailable"
                checked={menuItemForm.isAvailable}
                onCheckedChange={(checked) => setMenuItemForm({ ...menuItemForm, isAvailable: checked })}
              />
              <Label htmlFor="itemAvailable">Ürün mevcut</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMenuItemDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveMenuItem}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
