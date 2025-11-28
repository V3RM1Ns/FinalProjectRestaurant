"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { OwnerApi } from "@/lib/owner-api"
import { useAuth } from "@/contexts/auth-context"
import { UserRole } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  UtensilsCrossed,
  Plus,
  Edit,
  Trash2,
  Search,
  DollarSign,
  Image as ImageIcon,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  isAvailable: boolean
  imageUrl?: string
  category: string
  menuId: string
  menuName: string
  createdAt: string
}

interface Menu {
  id: string
  name: string
  description: string
  restaurantId: string
  restaurantName: string
  menuItems: MenuItem[]
}

export default function MenuManagementPage() {
  const params = useParams()
  const router = useRouter()
  const { hasRole } = useAuth()
  const { toast } = useToast()
  const restaurantId = params.id as string // params.restaurantId yerine params.id
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  
  // Dialogs
  const [isAddMenuItemOpen, setIsAddMenuItemOpen] = useState(false)
  const [isEditMenuItemOpen, setIsEditMenuItemOpen] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null)
  
  // Form states
  const [menuItemForm, setMenuItemForm] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    imageUrl: "",
    isAvailable: true,
  })

  useEffect(() => {
    if (!hasRole(UserRole.Owner)) {
      router.push("/unauthorized")
      return
    }
    loadMenus()
  }, [restaurantId, hasRole])

  const loadMenus = async () => {
    try {
      setLoading(true)
      const response = await OwnerApi.getMenus(restaurantId)
      setMenus(response)
      if (response.length > 0) {
        setSelectedMenu(response[0])
      }
    } catch (error) {
      console.error("Error loading menus:", error)
      toast({
        title: "Error",
        description: "Failed to load menus",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddMenuItem = async () => {
    if (!selectedMenu) return

    try {
      await OwnerApi.createMenuItem(selectedMenu.id, {
        ...menuItemForm,
        menuId: selectedMenu.id,
      })
      toast({
        title: "Success",
        description: "Menu item added successfully",
      })
      setIsAddMenuItemOpen(false)
      resetForm()
      loadMenus()
    } catch (error) {
      console.error("Error adding menu item:", error)
      toast({
        title: "Error",
        description: "Failed to add menu item",
        variant: "destructive",
      })
    }
  }

  const handleEditMenuItem = async () => {
    if (!editingMenuItem) return

    try {
      await OwnerApi.updateMenuItem(editingMenuItem.id, menuItemForm)
      toast({
        title: "Success",
        description: "Menu item updated successfully",
      })
      setIsEditMenuItemOpen(false)
      setEditingMenuItem(null)
      resetForm()
      loadMenus()
    } catch (error) {
      console.error("Error updating menu item:", error)
      toast({
        title: "Error",
        description: "Failed to update menu item",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMenuItem = async (menuItemId: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return

    try {
      await OwnerApi.deleteMenuItem(menuItemId)
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      })
      loadMenus()
    } catch (error) {
      console.error("Error deleting menu item:", error)
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      })
    }
  }

  const handleToggleAvailability = async (menuItemId: string, isAvailable: boolean) => {
    try {
      await OwnerApi.updateMenuItemAvailability(menuItemId, !isAvailable)
      toast({
        title: "Success",
        description: `Menu item ${!isAvailable ? "enabled" : "disabled"}`,
      })
      loadMenus()
    } catch (error) {
      console.error("Error toggling availability:", error)
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (item: MenuItem) => {
    setEditingMenuItem(item)
    setMenuItemForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl || "",
      isAvailable: item.isAvailable,
    })
    setIsEditMenuItemOpen(true)
  }

  const resetForm = () => {
    setMenuItemForm({
      name: "",
      description: "",
      price: 0,
      category: "",
      imageUrl: "",
      isAvailable: true,
    })
  }

  const getFilteredMenuItems = () => {
    if (!selectedMenu) return []

    let filtered = selectedMenu.menuItems

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    return filtered
  }

  const getCategories = () => {
    if (!selectedMenu) return []
    const categories = new Set(selectedMenu.menuItems.map((item) => item.category))
    return Array.from(categories)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  const filteredItems = getFilteredMenuItems()
  const categories = getCategories()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/owner/dashboard`)}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UtensilsCrossed className="w-8 h-8" />
            Menu Management
          </h1>
          {selectedMenu && (
            <p className="text-muted-foreground">
              {selectedMenu.name} - {selectedMenu.menuItems.length} items
            </p>
          )}
        </div>
        <Button onClick={() => setIsAddMenuItemOpen(true)} disabled={!selectedMenu}>
          <Plus className="mr-2 h-4 w-4" />
          Add Menu Item
        </Button>
      </div>

      {menus.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UtensilsCrossed className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No menus found</h3>
            <p className="text-muted-foreground">Create a menu to start adding items</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Menu Items Grid */}
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {item.description}
                        </CardDescription>
                      </div>
                      {item.imageUrl && (
                        <div className="ml-2">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-lg font-bold">
                        <DollarSign className="h-4 w-4" />₺
                        {item.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </div>
                      <Badge variant={item.isAvailable ? "default" : "secondary"}>
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{item.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => openEditDialog(item)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant={item.isAvailable ? "secondary" : "default"}
                        onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                      >
                        {item.isAvailable ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteMenuItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Menu Item Dialog */}
      <Dialog open={isAddMenuItemOpen} onOpenChange={setIsAddMenuItemOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Menu Item</DialogTitle>
            <DialogDescription>Add a new item to your menu</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={menuItemForm.name}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, name: e.target.value })}
                placeholder="e.g., Adana Kebap"
              />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={menuItemForm.description}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, description: e.target.value })}
                placeholder="Describe your menu item"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₺) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={menuItemForm.price}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, price: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={menuItemForm.category}
                  onValueChange={(value) => setMenuItemForm({ ...menuItemForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="Ana Yemek">Ana Yemek</SelectItem>
                    <SelectItem value="Çorba">Çorba</SelectItem>
                    <SelectItem value="Meze">Meze</SelectItem>
                    <SelectItem value="Salata">Salata</SelectItem>
                    <SelectItem value="Tatlı">Tatlı</SelectItem>
                    <SelectItem value="İçecek">İçecek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={menuItemForm.imageUrl}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, imageUrl: e.target.value })}
                placeholder="/adana-kebab.jpg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAvailable"
                checked={menuItemForm.isAvailable}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, isAvailable: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="isAvailable">Available for order</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddMenuItemOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleAddMenuItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Menu Item Dialog */}
      <Dialog open={isEditMenuItemOpen} onOpenChange={setIsEditMenuItemOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>Update menu item details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={menuItemForm.name}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={menuItemForm.description}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Price (₺) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={menuItemForm.price}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, price: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={menuItemForm.category}
                  onValueChange={(value) => setMenuItemForm({ ...menuItemForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="Ana Yemek">Ana Yemek</SelectItem>
                    <SelectItem value="Çorba">Çorba</SelectItem>
                    <SelectItem value="Meze">Meze</SelectItem>
                    <SelectItem value="Salata">Salata</SelectItem>
                    <SelectItem value="Tatlı">Tatlı</SelectItem>
                    <SelectItem value="İçecek">İçecek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-imageUrl">Image URL</Label>
              <Input
                id="edit-imageUrl"
                value={menuItemForm.imageUrl}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, imageUrl: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isAvailable"
                checked={menuItemForm.isAvailable}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, isAvailable: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="edit-isAvailable">Available for order</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditMenuItemOpen(false); setEditingMenuItem(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleEditMenuItem}>Update Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
