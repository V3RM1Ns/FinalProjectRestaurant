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
  items: CartItem[]
  addItem: (item: MenuItem, restaurantId: string, restaurantName: string) => void
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])

  const addItem = (menuItem: MenuItem, restaurantId: string, restaurantName: string) => {
    setItems((prev) => {
      // Check if item already exists
      const existingIndex = prev.findIndex((item) => item.menuItem.id === menuItem.id)

      if (existingIndex > -1) {
        // Update quantity
        const updated = [...prev]
        updated[existingIndex].quantity += 1
        return updated
      }

      // Add new item
      return [...prev, { menuItem, quantity: 1, restaurantId, restaurantName }]
    })
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
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}>
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
