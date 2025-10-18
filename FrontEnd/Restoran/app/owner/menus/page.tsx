"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, UtensilsCrossed } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Menu, MenuItem } from "@/types"

const mockMenus: Menu[] = [
  {
    id: "1",
    name: "Ana Yemekler",
    description: "Geleneksel Türk ana yemekleri",
    restaurantId: "1",
    menuItems: [
      {
        id: "1",
        name: "İskender Kebap",
        description: "Yoğurt ve tereyağlı pide üzerinde döner",
        price: 180,
        category: "Ana Yemek",
        isAvailable: true,
        menuId: "1",
        imageUrl: "/iskender-kebab.jpg",
      },
      {
        id: "2",
        name: "Adana Kebap",
        description: "Acılı kıyma kebap, pilav ve salata ile",
        price: 160,
        category: "Ana Yemek",
        isAvailable: true,
        menuId: "1",
        imageUrl: "/adana-kebab.jpg",
      },
    ],
  },
  {
    id: "2",
    name: "Başlangıçlar",
    description: "Mezeler ve çorbalar",
    restaurantId: "1",
    menuItems: [
      {
        id: "4",
        name: "Mercimek Çorbası",
        description: "Geleneksel mercimek çorbası",
        price: 35,
        category: "Çorba",
        isAvailable: true,
        menuId: "2",
        imageUrl: "/hearty-lentil-soup.png",
      },
    ],
  },
]

export default function MenuManagementPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false)
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchMenus = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      setMenus(mockMenus)
      setLoading(false)
    }

    fetchMenus()
  }, [])

  const handleSaveMenu = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const menuData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (editingMenu) {
      setMenus(menus.map((m) => (m.id === editingMenu.id ? { ...m, ...menuData } : m)))
      toast({ title: "Menü güncellendi" })
    } else {
      const newMenu: Menu = {
        id: Date.now().toString(),
        ...menuData,
        restaurantId: "1",
        menuItems: [],
      }
      setMenus([...menus, newMenu])
      toast({ title: "Menü oluşturuldu" })
    }

    setIsMenuDialogOpen(false)
    setEditingMenu(null)
  }

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm("Bu menüyü silmek istediğinizden emin misiniz?")) return

    await new Promise((resolve) => setTimeout(resolve, 500))
    setMenus(menus.filter((m) => m.id !== menuId))
    toast({ title: "Menü silindi" })
  }

  const handleSaveMenuItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const itemData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: Number.parseFloat(formData.get("price") as string),
      category: formData.get("category") as string,
      isAvailable: true,
      menuId: formData.get("menuId") as string,
      imageUrl: formData.get("imageUrl") as string,
    }

    await new Promise((resolve) => setTimeout(resolve, 500))

    if (editingItem) {
      setMenus(
        menus.map((menu) => ({
          ...menu,
          menuItems: menu.menuItems.map((item) => (item.id === editingItem.id ? { ...item, ...itemData } : item)),
        })),
      )
      toast({ title: "Ürün güncellendi" })
    } else {
      const newItem: MenuItem = {
        id: Date.now().toString(),
        ...itemData,
      }
      setMenus(
        menus.map((menu) =>
          menu.id === itemData.menuId ? { ...menu, menuItems: [...menu.menuItems, newItem] } : menu,
        ),
      )
      toast({ title: "Ürün eklendi" })
    }

    setIsItemDialogOpen(false)
    setEditingItem(null)
  }

  const handleDeleteMenuItem = async (menuId: string, itemId: string) => {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return

    await new Promise((resolve) => setTimeout(resolve, 500))
    setMenus(
      menus.map((menu) =>
        menu.id === menuId ? { ...menu, menuItems: menu.menuItems.filter((item) => item.id !== itemId) } : menu,
      ),
    )
    toast({ title: "Ürün silindi" })
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded" />
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
          <h1 className="text-4xl font-bold mb-2">Menü Yönetimi</h1>
          <p className="text-muted-foreground">Menülerinizi ve ürünlerinizi yönetin</p>
        </div>
        <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMenu(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Menü
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMenu ? "Menü Düzenle" : "Yeni Menü Oluştur"}</DialogTitle>
              <DialogDescription>Menü bilgilerini girin</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveMenu} className="space-y-4">
              <div>
                <Label htmlFor="name">Menü Adı</Label>
                <Input id="name" name="name" defaultValue={editingMenu?.name} required />
              </div>
              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea id="description" name="description" defaultValue={editingMenu?.description} required />
              </div>
              <Button type="submit" className="w-full">
                {editingMenu ? "Güncelle" : "Oluştur"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {menus.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Henüz menü yok</h3>
            <p className="text-muted-foreground mb-4">İlk menünüzü oluşturun</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {menus.map((menu) => (
            <Card key={menu.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{menu.name}</CardTitle>
                    <CardDescription>{menu.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingMenu(menu)
                        setIsMenuDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteMenu(menu.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Ürünler ({menu.menuItems.length})</h3>
                  <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingItem({ menuId: menu.id } as MenuItem)
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Ürün Ekle
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingItem?.id ? "Ürün Düzenle" : "Yeni Ürün Ekle"}</DialogTitle>
                        <DialogDescription>Ürün bilgilerini girin</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSaveMenuItem} className="space-y-4">
                        <input type="hidden" name="menuId" value={editingItem?.menuId || menu.id} />
                        <div>
                          <Label htmlFor="itemName">Ürün Adı</Label>
                          <Input id="itemName" name="name" defaultValue={editingItem?.name} required />
                        </div>
                        <div>
                          <Label htmlFor="itemDescription">Açıklama</Label>
                          <Textarea
                            id="itemDescription"
                            name="description"
                            defaultValue={editingItem?.description}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="price">Fiyat (₺)</Label>
                            <Input
                              id="price"
                              name="price"
                              type="number"
                              step="0.01"
                              defaultValue={editingItem?.price}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="category">Kategori</Label>
                            <Input id="category" name="category" defaultValue={editingItem?.category} required />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="imageUrl">Görsel URL</Label>
                          <Input id="imageUrl" name="imageUrl" defaultValue={editingItem?.imageUrl} />
                        </div>
                        <Button type="submit" className="w-full">
                          {editingItem?.id ? "Güncelle" : "Ekle"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {menu.menuItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Bu menüde henüz ürün yok</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menu.menuItems.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <img
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                                <Badge variant={item.isAvailable ? "default" : "secondary"} className="shrink-0">
                                  {item.isAvailable ? "Aktif" : "Pasif"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-primary">₺{item.price}</span>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => {
                                      setEditingItem(item)
                                      setIsItemDialogOpen(true)
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleDeleteMenuItem(menu.id, item.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
