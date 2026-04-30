'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export interface CartItem {
  id: string
  slug: string
  name: string
  price: number
  image?: string
  color?: string
  maxQuantity?: number
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  totalItems: number
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (itemId: string, color?: string) => void
  updateItemQuantity: (itemId: string, color: string | undefined, quantity: number) => void
  clearCart: () => void
  /** Sepet yan paneli açık mı (mobil sticky bar vb. ile çakışmayı önlemek için). */
  isDrawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)
const CART_STORAGE_KEY = 'eftelia_cart_items'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as CartItem[]
      if (Array.isArray(parsed)) {
        setItems(parsed)
      }
    } catch {
      setItems([])
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (entry) => entry.id === item.id && entry.color === item.color
      )

      if (existingIndex > -1) {
        const updated = [...prev]
        const requested = updated[existingIndex].quantity + quantity
        const maxAllowed =
          typeof item.maxQuantity === 'number' && item.maxQuantity > 0
            ? item.maxQuantity
            : updated[existingIndex].maxQuantity
        updated[existingIndex] = {
          ...updated[existingIndex],
          maxQuantity: maxAllowed,
          quantity:
            typeof maxAllowed === 'number' && maxAllowed > 0
              ? Math.min(requested, maxAllowed)
              : requested,
        }
        return updated
      }

      const safeQuantity =
        typeof item.maxQuantity === 'number' && item.maxQuantity > 0
          ? Math.min(quantity, item.maxQuantity)
          : quantity
      return [...prev, { ...item, quantity: safeQuantity }]
    })
  }

  const removeItem = (itemId: string, color?: string) => {
    setItems((prev) =>
      prev.filter(
        (entry) => !(entry.id === itemId && entry.color === color)
      )
    )
  }

  const updateItemQuantity = (itemId: string, color: string | undefined, quantity: number) => {
    setItems((prev) =>
      prev
        .map((entry) => {
          if (!(entry.id === itemId && entry.color === color)) return entry
          const maxAllowed =
            typeof entry.maxQuantity === 'number' && entry.maxQuantity > 0
              ? entry.maxQuantity
              : undefined
          return {
            ...entry,
            quantity:
              typeof maxAllowed === 'number'
                ? Math.min(quantity, maxAllowed)
                : quantity,
          }
        })
        .filter((entry) => entry.quantity > 0)
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  )

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        isDrawerOpen,
        setDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
