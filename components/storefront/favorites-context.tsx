'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type FavoriteItem = {
  id: string
  slug: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  inStock?: boolean
  addedAt: number
}

type FavoriteProductInput = Omit<FavoriteItem, 'addedAt'>

type FavoritesContextValue = {
  favorites: FavoriteItem[]
  isAuthenticated: boolean
  isFavorite: (productId: string) => boolean
  toggleFavorite: (product: FavoriteProductInput) => { ok: boolean; added: boolean; reason?: 'auth_required' }
  removeFavorite: (productId: string) => void
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

const FAVORITES_STORAGE_PREFIX = 'eftalia_favorites'

function getStorageKey(customerId: string) {
  return `${FAVORITES_STORAGE_PREFIX}_${customerId}`
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed right-4 top-24 z-[90] rounded-lg border border-rose/30 bg-white px-4 py-3 text-sm text-bronze shadow-lg">
      {message}
    </div>
  )
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const loadSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', { cache: 'no-store' })
      const data = (await response.json()) as {
        authenticated?: boolean
        customer?: { id?: string } | null
      }
      const authenticated = Boolean(data?.authenticated)
      const currentCustomerId = data?.customer?.id || ''
      setIsAuthenticated(authenticated)
      setCustomerId(currentCustomerId)

      if (!authenticated || !currentCustomerId) {
        setFavorites([])
        return
      }

      const localRaw = localStorage.getItem(getStorageKey(currentCustomerId))
      const localFavorites = localRaw ? ((JSON.parse(localRaw) as FavoriteItem[]) || []) : []

      try {
        const remoteResponse = await fetch('/api/account/favorites', { cache: 'no-store' })
        const remoteData = (await remoteResponse.json()) as { favorites?: FavoriteItem[] }
        const remoteFavorites = Array.isArray(remoteData?.favorites) ? remoteData.favorites : []

        if (remoteFavorites.length > 0) {
          setFavorites(remoteFavorites)
          localStorage.setItem(getStorageKey(currentCustomerId), JSON.stringify(remoteFavorites))
          return
        }

        if (localFavorites.length > 0) {
          setFavorites(localFavorites)
          await fetch('/api/account/favorites', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favorites: localFavorites }),
          })
          return
        }
      } catch {
        // Shopify sync fails, keep local favorites instead of breaking session UX.
        if (localFavorites.length > 0) {
          setFavorites(localFavorites)
          return
        }
      }

      setFavorites([])
    } catch {
      setIsAuthenticated(false)
      setFavorites([])
    }
  }, [])

  useEffect(() => {
    void loadSession()
  }, [loadSession])

  useEffect(() => {
    const handleFocus = () => {
      void loadSession()
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void loadSession()
      }
    }
    const handleAuthChanged = () => {
      void loadSession()
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('auth:changed', handleAuthChanged)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('auth:changed', handleAuthChanged)
    }
  }, [loadSession])

  useEffect(() => {
    if (!isAuthenticated || !customerId) return
    localStorage.setItem(getStorageKey(customerId), JSON.stringify(favorites))
  }, [favorites, isAuthenticated, customerId])

  useEffect(() => {
    if (!toastMessage) return
    const timeout = window.setTimeout(() => setToastMessage(''), 2400)
    return () => window.clearTimeout(timeout)
  }, [toastMessage])

  const isFavorite = useCallback(
    (productId: string) => favorites.some((item) => item.id === productId),
    [favorites]
  )

  const removeFavorite = useCallback((productId: string) => {
    setFavorites((prev) => {
      const next = prev.filter((item) => item.id !== productId)
      if (isAuthenticated && customerId) {
        void fetch('/api/account/favorites', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ favorites: next }),
        })
      }
      return next
    })
  }, [])

  const toggleFavorite = useCallback(
    (product: FavoriteProductInput) => {
      if (!isAuthenticated || !customerId) {
        setToastMessage('Favorilere eklemek için üye girişi yapmalısınız.')
        return { ok: false, added: false, reason: 'auth_required' as const }
      }

      const exists = favorites.some((item) => item.id === product.id)
      if (exists) {
        const next = favorites.filter((item) => item.id !== product.id)
        setFavorites(next)
        void fetch('/api/account/favorites', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ favorites: next }),
        })
        setToastMessage('Ürün favorilerden çıkarıldı.')
        return { ok: true, added: false }
      }

      const next = [{ ...product, addedAt: Date.now() }, ...favorites]
      setFavorites(next)
      void fetch('/api/account/favorites', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorites: next }),
      })
      setToastMessage('Ürün favorilere eklendi.')
      return { ok: true, added: true }
    },
    [favorites, isAuthenticated, customerId]
  )

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      isAuthenticated,
      isFavorite,
      toggleFavorite,
      removeFavorite,
    }),
    [favorites, isAuthenticated, isFavorite, toggleFavorite, removeFavorite]
  )

  return (
    <FavoritesContext.Provider value={value}>
      {children}
      {toastMessage ? <Toast message={toastMessage} /> : null}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider')
  }
  return context
}
