"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { OwnerApi } from "@/lib/owner-api"
import { UserRole } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Utensils, Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

export default function OwnerMenuPage() {
  const { hasRole } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const restaurantId = searchParams.get("restaurant")

  const [menus, setMenus] = useState<any[]>([])
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!hasRole(UserRole.Owner)) {
      router.push("/unauthorized")
      return
    }

    if (restaurantId) {
      loadMenus()
    }
  }, [hasRole, router, restaurantId])

  useEffect(() => {
    if (selectedMenu) {
      loadMenuItems()
    }
  }, [selectedMenu])

  const loadMenus = async () => {
    if (!restaurantId) return

    try {
      setIsLoading(true)
      const data = await OwnerApi.getMenus(restaurantId)
      setMenus(data || [])
      
      if (data.length > 0) {
        setSelectedMenu(data[0].id)
      }
    } catch (error) {
      console.error("Error loading menus:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMenuItems = async () => {
    if (!selectedMenu) return

    try {
      const response = await OwnerApi.getMenuItems(selectedMenu, 1, 50)
      setMenuItems(response.items || [])
    } catch (error) {
      console.error("Error loading menu items:", error)
    }
  }

  const handleToggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      await OwnerApi.updateMenuItemAvailability(itemId, !currentStatus)
      loadMenuItems()
    } catch (error) {
      console.error("Error updating availability:", error)
    }
  }

  if (!restaurantId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Restoran Seçilmedi</CardTitle>
            <CardDescription>Lütfen bir restoran seçin.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Utensils className="mr-2" />
            Menü Yönetimi
          </h1>
          <p className="text-muted-foreground">Menülerinizi ve ürünlerinizi yönetin</p>
        </div>
        <div className="flex gap-2">
          <Link href="/owner/dashboard">
            <Button variant="outline">Dashboard'a Dön</Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      ) : (
        <>
          {/* Menu Selection */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Menüler</CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Menü
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {menus.map((menu) => (
                  <Button
                    key={menu.id}
                    variant={selectedMenu === menu.id ? "default" : "outline"}
                    onClick={() => setSelectedMenu(menu.id)}
                  >
                    {menu.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Menu Items */}
          {selectedMenu && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Menü Ürünleri</CardTitle>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Ürün Ekle
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {menuItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Bu menüde henüz ürün yok.
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {menuItems.map((item) => (
                      <Card key={item.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{item.name}</CardTitle>
                              <CardDescription>₺{item.price?.toFixed(2)}</CardDescription>
                            </div>
                            <Badge variant={item.isAvailable ? "default" : "secondary"}>
                              {item.isAvailable ? "Mevcut" : "Mevcut Değil"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          )}
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                          {item.category && (
                            <Badge variant="outline">{item.category}</Badge>
                          )}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                            >
                              {item.isAvailable ? "Devre Dışı" : "Aktif Et"}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

