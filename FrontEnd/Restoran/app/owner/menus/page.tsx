"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Upload, X } from "lucide-react"
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
import Image from "next/image"

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
    imageUrl: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  useEffect(() => {
    if (selectedRestaurant) {
      loadMenus()
    }
  }, [selectedRestaurant])

  const loadMenus = async () => {
    if (!selectedRestaurant) return
    
    setLoading(true)
    try {
      const data = await ownerApi.menus.getAll(selectedRestaurant.id)
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

  // Image upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Hata",
          description: "Dosya boyutu 5MB'dan küçük olmalıdır",
          variant: "destructive",
        })
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Hata",
          description: "Lütfen geçerli bir resim dosyası seçin",
          variant: "destructive",
        })
        return
      }
      
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview("")
    setMenuItemForm({ ...menuItemForm, imageUrl: "" })
  }

  // Menu CRUD operations
  const handleSaveMenu = async () => {
    if (!selectedRestaurant) return
    
    if (!menuForm.name.trim()) {
      toast({
        title: "Hata",
        description: "Menü adı gereklidir",
        variant: "destructive",
      })
      return
    }
    
    try {
      if (editingMenu) {
        await ownerApi.menus.update(editingMenu.id, menuForm)
        toast({
          title: "Başarılı",
          description: "Menü güncellendi",
        })
      } else {
        await ownerApi.menus.create(selectedRestaurant.id, {
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
    if (!confirm("Bu menüyü ve içindeki tüm ürünleri silmek istediğinizden emin misiniz?")) return
    
    try {
      await ownerApi.menus.delete(menuId)
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
  const handleAddMenuItem = (menuId: string) => {
    setSelectedMenuId(menuId)
    setEditingMenuItem(null)
    setMenuItemForm({
      name: "",
      description: "",
      price: 0,
      category: "",
      imageUrl: "",
    })
    setImageFile(null)
    setImagePreview("")
    setMenuItemDialogOpen(true)
  }

  const handleEditMenuItem = (menuId: string, item: MenuItem) => {
    setSelectedMenuId(menuId)
    setEditingMenuItem(item)
    setMenuItemForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category || "",
      imageUrl: item.imageUrl || "",
    })
    setImageFile(null)
    setImagePreview(item.imageUrl || "")
    setMenuItemDialogOpen(true)
  }

  const handleSaveMenuItem = async () => {
    if (!selectedMenuId) return
    
    if (!menuItemForm.name.trim()) {
      toast({
        title: "Hata",
        description: "Ürün adı gereklidir",
        variant: "destructive",
      })
      return
    }
    
    if (menuItemForm.price <= 0) {
      toast({
        title: "Hata",
        description: "Fiyat 0'dan büyük olmalıdır",
        variant: "destructive",
      })
      return
    }
    
    // Yeni ürün eklerken resim zorunlu
    if (!editingMenuItem && !imageFile && !menuItemForm.imageUrl) {
      toast({
        title: "Hata",
        description: "Lütfen ürün için bir resim yükleyin",
        variant: "destructive",
      })
      return
    }
    
    try {
      // TODO: imageFile varsa önce upload et
      const finalImageUrl = imagePreview || menuItemForm.imageUrl
      
      const menuItemData = {
        ...menuItemForm,
        imageUrl: finalImageUrl,
        isAvailable: true, // Otomatik olarak müsait
        menuId: selectedMenuId,
      }
      
      if (editingMenuItem) {
        await ownerApi.menuItems.update(editingMenuItem.id, menuItemData)
        toast({
          title: "Başarılı",
          description: "Ürün güncellendi",
        })
      } else {
        await ownerApi.menuItems.create(selectedMenuId, menuItemData)
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
        imageUrl: "",
      })
      setImageFile(null)
      setImagePreview("")
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
      await ownerApi.menuItems.delete(menuItemId)
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

  const handleToggleAvailability = async (menuItemId: string, isAvailable: boolean) => {
    try {
      await ownerApi.menuItems.updateAvailability(menuItemId, isAvailable)
      toast({
        title: "Başarılı",
        description: "Ürün durumu güncellendi",
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
          <h1 className="text-3xl font-bold">Menü Yönetimi</h1>
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
                        <p className="mb-3">Bu menüde henüz ürün bulunmuyor</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddMenuItem(menu.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          İlk Ürünü Ekle
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Resim</TableHead>
                            <TableHead>Ürün Adı</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Fiyat</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {menu.menuItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                {item.imageUrl ? (
                                  <div className="w-16 h-16 relative rounded-md overflow-hidden">
                                    <Image
                                      src={item.imageUrl}
                                      alt={item.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs">
                                    Resim Yok
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {item.description}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>{item.category || "-"}</TableCell>
                              <TableCell className="font-medium">
                                ₺{item.price.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={item.isAvailable}
                                    onCheckedChange={(checked) => handleToggleAvailability(item.id, checked)}
                                  />
                                  <Badge variant={item.isAvailable ? "default" : "secondary"}>
                                    {item.isAvailable ? "Mevcut" : "Mevcut Değil"}
                                  </Badge>
                                </div>
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
              {editingMenu ? "Menü bilgilerini güncelleyin" : "Yeni menü oluşturmak için bilgileri girin"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="menuName">Menü Adı *</Label>
              <Input
                id="menuName"
                value={menuForm.name}
                onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                placeholder="Örn: Ana Yemekler, Tatlılar, İçecekler..."
              />
            </div>
            <div>
              <Label htmlFor="menuDescription">Açıklama *</Label>
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
            <Button onClick={handleSaveMenu}>
              {editingMenu ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menu Item Dialog */}
      <Dialog open={menuItemDialogOpen} onOpenChange={setMenuItemDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMenuItem ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</DialogTitle>
            <DialogDescription>
              {editingMenuItem ? "Ürün bilgilerini güncelleyin" : "Menüye yeni ürün eklemek için bilgileri girin"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <Label>Ürün Resmi *</Label>
              {imagePreview || menuItemForm.imageUrl ? (
                <div className="mt-2 space-y-2">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                    <Image
                      src={imagePreview || menuItemForm.imageUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeImage}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Resmi Kaldır
                  </Button>
                </div>
              ) : (
                <div className="mt-2">
                  <label
                    htmlFor="imageUpload"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Resim yüklemek için tıklayın</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG veya JPEG (MAX. 5MB)
                      </p>
                    </div>
                    <Input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              )}
              <p className="text-xs text-destructive mt-1">
                * Ürün resmi zorunludur. Lütfen bir resim yükleyin.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemName">Ürün Adı *</Label>
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
                  placeholder="Örn: Kebaplar, Çorbalar..."
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="itemDescription">Açıklama *</Label>
              <Textarea
                id="itemDescription"
                value={menuItemForm.description}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, description: e.target.value })}
                placeholder="Ürün hakkında detaylı açıklama, malzemeler..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemPrice">Fiyat (₺) *</Label>
                <Input
                  id="itemPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={menuItemForm.price}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="itemImageUrl">Resim URL (Alternatif)</Label>
                <Input
                  id="itemImageUrl"
                  value={menuItemForm.imageUrl}
                  onChange={(e) => {
                    setMenuItemForm({ ...menuItemForm, imageUrl: e.target.value })
                    if (e.target.value) {
                      setImagePreview(e.target.value)
                    }
                  }}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMenuItemDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveMenuItem}>
              {editingMenuItem ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
