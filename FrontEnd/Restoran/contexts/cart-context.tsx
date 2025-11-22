"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import type { MenuItem } from "@/types"

interface CartItem {
  menuItem: MenuItem
  quantity: number
  restaurantId: string
  restaurantName: string
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, restaurantId: string, restaurantName: string, quantityToAdd?: number) => Promise<boolean>
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  clearCart: () => void
  total: number
  currentRestaurantId: string | null
  currentRestaurantName: string | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [currentRestaurantId, setCurrentRestaurantId] = useState<string | null>(null)
  const [currentRestaurantName, setCurrentRestaurantName] = useState<string | null>(null)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      const parsed = JSON.parse(savedCart)
      setItems(parsed)
      
      // Set current restaurant from first item
      if (parsed.length > 0) {
        setCurrentRestaurantId(parsed[0].restaurantId)
        setCurrentRestaurantName(parsed[0].restaurantName)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
    
    // Update current restaurant
    if (items.length > 0) {
      setCurrentRestaurantId(items[0].restaurantId)
      setCurrentRestaurantName(items[0].restaurantName)
    } else {
      setCurrentRestaurantId(null)
      setCurrentRestaurantName(null)
    }
  }, [items])

  const addItem = async (menuItem: MenuItem, restaurantId: string, restaurantName: string, quantityToAdd: number = 1): Promise<boolean> => {
    // Check if trying to add from a different restaurant
    if (currentRestaurantId && currentRestaurantId !== restaurantId) {
      const confirmed = window.confirm(
        `Sepetinizde "${currentRestaurantName}" restoranından ürünler var.\n\n` +
        `"${restaurantName}" restoranından ürün eklemek için önce mevcut sepeti temizlemeniz gerekiyor.\n\n` +
        `Sepeti temizleyip bu ürünü eklemek istiyor musunuz?`
      )
      
      if (!confirmed) {
        return false
      }
      
      // Clear cart and continue with adding the new item
      setItems([])
    }

    setItems((prev) => {
      // Check if item already exists
      const existingIndex = prev.findIndex((item) => item.menuItem.id === menuItem.id)

      if (existingIndex > -1) {
        // Update quantity
        const updated = [...prev]
        updated[existingIndex].quantity += quantityToAdd
        return updated
      }

      // Add new item
      return [...prev, { menuItem, quantity: quantityToAdd, restaurantId, restaurantName }]
    })
    
    return true
  }

  const removeItem = (menuItemId: string) => {
    setItems((prev) => prev.filter((item) => item.menuItem.id !== menuItemId))
  }

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId)
      return
    }

    setItems((prev) => prev.map((item) => (item.menuItem.id === menuItemId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      updateQuantity, 
      clearCart, 
      total,
      currentRestaurantId,
      currentRestaurantName
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
