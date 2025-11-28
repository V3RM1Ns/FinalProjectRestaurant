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

interface AppliedCoupon {
  couponCode: string
  discountAmount: number
  discountPercentage: number
  rewardName: string
  restaurantId: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (menuItem: MenuItem, restaurantId: string, restaurantName: string) => boolean
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  clearCart: () => void
  total: number
  currentRestaurantId: string | null
  currentRestaurantName: string | null
  appliedCoupon: AppliedCoupon | null
  applyCoupon: (coupon: AppliedCoupon) => void
  removeCoupon: () => void
  discountAmount: number
  finalTotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [currentRestaurantId, setCurrentRestaurantId] = useState<string | null>(null)
  const [currentRestaurantName, setCurrentRestaurantName] = useState<string | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)

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

    // Load applied coupon
    const savedCoupon = localStorage.getItem("appliedCoupon")
    if (savedCoupon) {
      setAppliedCoupon(JSON.parse(savedCoupon))
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

    // Remove coupon if restaurant changed
    if (appliedCoupon && items.length > 0 && items[0].restaurantId !== appliedCoupon.restaurantId) {
      setAppliedCoupon(null)
      localStorage.removeItem("appliedCoupon")
    }
  }, [items, appliedCoupon])

  // Save applied coupon to localStorage
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem("appliedCoupon", JSON.stringify(appliedCoupon))
    } else {
      localStorage.removeItem("appliedCoupon")
    }
  }, [appliedCoupon])

  const addItem = (menuItem: MenuItem, restaurantId: string, restaurantName: string): boolean => {
    // Check if cart has items from a different restaurant
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
      const existingItem = prev.find((item) => item.menuItem.id === menuItem.id)

      if (existingItem) {
        return prev.map((item) =>
          item.menuItem.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }

      return [...prev, { menuItem, quantity: 1, restaurantId, restaurantName }]
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
    setAppliedCoupon(null)
  }

  const applyCoupon = (coupon: AppliedCoupon) => {
    setAppliedCoupon(coupon)
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
  }

  const total = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)

  const discountAmount = appliedCoupon
    ? appliedCoupon.discountPercentage > 0
      ? (total * appliedCoupon.discountPercentage) / 100
      : appliedCoupon.discountAmount
    : 0

  const finalTotal = Math.max(0, total - discountAmount)

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      total,
      currentRestaurantId,
      currentRestaurantName,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      discountAmount,
      finalTotal
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
