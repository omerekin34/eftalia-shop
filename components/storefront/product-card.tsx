'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Heart, ShoppingBag } from 'lucide-react'
import { useFavorites } from '@/components/storefront/favorites-context'
import { useCart } from '@/components/storefront/cart-context'

interface ProductColor {
  name: string
  hex: string
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  discount?: number
  images: string[]
  category: string
  subcategory: string
  colors: ProductColor[]
  isNew?: boolean
  isBestseller?: boolean
  inStock?: boolean
  stockQuantity?: number
  colorStockByName?: Record<string, number>
  variantIdByColor?: Record<string, string>
  variantPriceByColor?: Record<string, number>
  variantMaxQtyByColor?: Record<string, number>
  variantId?: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const { isFavorite, toggleFavorite } = useFavorites()
  const { addItem, setDrawerOpen } = useCart()
  const favorite = isFavorite(product.id)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(price).replace('₺', '₺')
  }

  const extraColors = product.colors.length > 3 ? product.colors.length - 3 : 0
  const hasDiscount =
    typeof product.originalPrice === 'number' &&
    product.originalPrice > 0 &&
    product.originalPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0
  const lowStockCount =
    product.inStock === false ? 0 : Math.max(0, Number(product.stockQuantity || 0))
  const isLowStock = lowStockCount > 0 && lowStockCount <= 10
  const selectedColorStock = Math.max(
    0,
    Number(product.colorStockByName?.[selectedColor?.name || ''] || 0)
  )
  const lowStockColors = Object.entries(product.colorStockByName || {})
    .filter(([, qty]) => Number(qty) > 0 && Number(qty) <= 10)
    .sort((a, b) => Number(a[1]) - Number(b[1]))

  const imageCount = Math.max(1, product.images.filter(Boolean).length)
  const activeImage = product.images[imageIndex] || product.images[0]
  const nextPreviewIndex =
    imageCount > 1 ? (imageIndex + 1) % Math.max(1, product.images.length) : -1

  const displayPrice =
    product.variantPriceByColor?.[selectedColor.name] ?? product.price

  const resolvedVariantId = (() => {
    const map = product.variantIdByColor
    if (map && map[selectedColor.name]) return map[selectedColor.name]
    const keys = map ? Object.keys(map) : []
    if (keys.length === 0 && product.variantId) return product.variantId
    return undefined
  })()

  const stockForSelected =
    product.colorStockByName && selectedColor.name in product.colorStockByName
      ? Number(product.colorStockByName[selectedColor.name] || 0)
      : undefined
  const stockOk =
    product.inStock !== false &&
    (stockForSelected === undefined || stockForSelected > 0)

  const canQuickAdd = stockOk && Boolean(resolvedVariantId)

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (resolvedVariantId && canQuickAdd) {
      const maxQ = product.variantMaxQtyByColor?.[selectedColor.name]
      addItem(
        {
          id: resolvedVariantId,
          slug: product.slug,
          name: product.name,
          price: displayPrice,
          image: activeImage,
          color: product.colors.length > 1 ? selectedColor.name : undefined,
          maxQuantity: typeof maxQ === 'number' && maxQ > 0 ? maxQ : undefined,
        },
        1,
        true
      )
      return
    }
    setDrawerOpen(true)
  }

  const overlayBottomClass = isLowStock ? 'bottom-14 sm:bottom-[3.25rem]' : 'bottom-2 sm:bottom-3'

  return (
    <motion.article
      className="group relative flex h-full flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container — daha uzun portre oranı (mobil ve masaüstü) */}
      <div className="relative aspect-[3/5] w-full shrink-0 overflow-hidden bg-white">
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 z-0 block"
          aria-label={`${product.name} ürün sayfası`}
        >
          {activeImage ? (
            <Image
              src={activeImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-ivory">
              <svg className="h-16 w-16 text-bronze/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </Link>

        {nextPreviewIndex >= 0 && product.images[nextPreviewIndex] && (
          <div
            className={`pointer-events-none absolute inset-0 z-[1] transition-opacity duration-500 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={product.images[nextPreviewIndex]}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        )}

        {imageCount > 1 ? (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setImageIndex((i) => (i - 1 + imageCount) % imageCount)
              }}
              className="absolute left-1.5 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-bronze shadow-md transition hover:bg-white sm:left-2 sm:h-9 sm:w-9"
              aria-label="Önceki görsel"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setImageIndex((i) => (i + 1) % imageCount)
              }}
              className="absolute right-1.5 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-bronze shadow-md transition hover:bg-white sm:right-2 sm:h-9 sm:w-9"
              aria-label="Sonraki görsel"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
            </button>
          </>
        ) : null}

        {/* Badges */}
        <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-col gap-1 sm:left-3 sm:top-3">
          {hasDiscount ? (
            <span className="w-fit rounded-md bg-[#7B1E2B] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white shadow-md sm:text-xs">
              %{discountPercent} İndirim
            </span>
          ) : null}
          {product.isNew ? (
            <span className="w-fit rounded-md border border-black/80 bg-black/85 px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-[#E9D5A1] shadow-md sm:text-xs">
              YENİ
            </span>
          ) : null}
        </div>

        {isLowStock ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-r from-[#7B1E2B] via-[#a02a3b] to-[#7B1E2B] px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_-8px_20px_-12px_rgba(0,0,0,0.65)] sm:py-2 sm:text-xs">
            Son {lowStockCount} Ürün - Tükenmeden Al
          </div>
        ) : null}

        {/* Wishlist */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleFavorite({
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              originalPrice: product.originalPrice,
              images: product.images,
              inStock: product.inStock,
            })
          }}
          className="absolute right-2 top-2 z-30 rounded-full bg-white/90 p-1.5 shadow-md transition-all hover:bg-white sm:right-3 sm:top-3 sm:p-2"
          aria-label={favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        >
          <Heart
            className={`h-4 w-4 transition-colors sm:h-5 sm:w-5 ${
              favorite ? 'fill-rose text-rose' : 'text-bronze/60'
            }`}
          />
        </button>

        {/* Color swatches — sol alt */}
        {product.colors.length > 1 ? (
          <div
            className={`absolute left-2 z-20 flex max-w-[calc(100%-3.5rem)] items-center gap-1 rounded-full bg-white/90 px-2 py-1 shadow-sm sm:left-3 ${overlayBottomClass}`}
          >
            {product.colors.slice(0, 3).map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedColor(color)
                }}
                className={`relative h-4 w-4 shrink-0 rounded-full border transition-transform hover:scale-110 sm:h-5 sm:w-5 ${
                  selectedColor.name === color.name
                    ? 'border-bronze ring-1 ring-bronze ring-offset-1'
                    : 'border-bronze/20'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
                aria-label={`${color.name} rengi seç`}
              >
                {Number(product.colorStockByName?.[color.name] || 0) > 0 &&
                Number(product.colorStockByName?.[color.name] || 0) <= 10 ? (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#7B1E2B] px-1 text-[9px] font-semibold leading-none text-white">
                    {Number(product.colorStockByName?.[color.name] || 0)}
                  </span>
                ) : null}
              </button>
            ))}
            {extraColors > 0 ? (
              <span className="ml-0.5 shrink-0 text-[10px] text-bronze/60 sm:text-xs">+{extraColors} Renk</span>
            ) : null}
          </div>
        ) : null}

        {/* Sepet — sağ alt; tıklanınca sepete ekler veya sepeti açar */}
        <button
          type="button"
          onClick={handleCartClick}
          className={`absolute right-2 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-bronze shadow-md ring-1 ring-black/5 transition hover:bg-white hover:text-bronze-dark sm:right-3 sm:h-10 sm:w-10 ${overlayBottomClass}`}
          aria-label={resolvedVariantId && canQuickAdd ? 'Sepete ekle ve sepeti aç' : 'Sepeti aç'}
        >
          <ShoppingBag className="h-4 w-4 sm:h-[1.15rem] sm:w-[1.15rem]" strokeWidth={2} />
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          className={`pointer-events-none absolute left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded bg-bronze/90 px-3 py-1.5 text-xs text-white shadow-lg sm:block ${
            isLowStock ? 'bottom-[5.25rem]' : 'bottom-14'
          }`}
        >
          {product.name} {selectedColor.name}
        </motion.div>
      </div>

      {/* Product Info — biraz daha ferah */}
      <div className="mt-3 flex min-h-0 flex-1 flex-col space-y-1.5 sm:mt-4 sm:space-y-2">
        <Link href={`/product/${product.slug}`} className="min-h-0">
          <h3 className="line-clamp-2 text-xs text-bronze transition-colors group-hover:text-bronze-dark sm:text-sm">
            {product.name}
          </h3>
        </Link>

        <div className="flex flex-wrap items-baseline gap-2">
          {hasDiscount ? (
            <span className="text-xs text-zinc-400 line-through sm:text-sm">
              {formatPrice(product.originalPrice!)}
            </span>
          ) : null}
          <span className={`text-sm font-semibold sm:text-base ${hasDiscount ? 'text-[#7B1E2B]' : 'text-bronze'}`}>
            {formatPrice(displayPrice)}
          </span>
        </div>
        <p
          className={`text-xs font-medium ${
            product.inStock === false ? 'text-[#c41e3a]' : isLowStock ? 'text-[#7B1E2B]' : 'text-bronze/55'
          }`}
        >
          {product.inStock === false
            ? 'Tükendi'
            : selectedColorStock > 0
              ? `${selectedColor.name}: Son ${selectedColorStock} ürün`
              : isLowStock
                ? `Son ${lowStockCount} ürün`
                : 'Stokta'}
        </p>
        {lowStockColors.length > 0 ? (
          <p className="line-clamp-2 text-[11px] text-bronze/70">
            Renk stokları: {lowStockColors.map(([name, qty]) => `${name} (${qty})`).join(' • ')}
          </p>
        ) : null}
      </div>
    </motion.article>
  )
}
