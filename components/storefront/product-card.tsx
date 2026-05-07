'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useFavorites } from '@/components/storefront/favorites-context'

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
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const { isFavorite, toggleFavorite } = useFavorites()
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

  return (
    <motion.article
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link href={`/product/${product.slug}`} className="relative block aspect-[3/4.25] overflow-hidden bg-white">
        {/* Primary Image */}
        <div className="absolute inset-0">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className={`object-cover transition-all duration-500 ${
                isHovered && product.images[1] ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
              }`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-ivory">
              <svg className="h-16 w-16 text-bronze/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Hover Image */}
        {product.images[1] && (
          <div className="absolute inset-0">
            <Image
              src={product.images[1]}
              alt={`${product.name} - alternatif görünüm`}
              fill
              className={`object-cover transition-all duration-500 ${
                isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 z-10 flex flex-col gap-1 sm:left-3 sm:top-3">
          {hasDiscount && (
            <span className="rounded-md bg-[#7B1E2B] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white shadow-md sm:text-xs">
              %{discountPercent} İndirim
            </span>
          )}
        </div>
        {isLowStock && (
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-r from-[#7B1E2B] via-[#a02a3b] to-[#7B1E2B] px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_-8px_20px_-12px_rgba(0,0,0,0.65)] sm:text-xs">
            Son {lowStockCount} Ürün - Tükenmeden Al
          </div>
        )}
        {product.isNew && (
          <span className="absolute right-12 top-2 rounded-md border border-black/80 bg-black/85 px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-[#E9D5A1] shadow-md sm:right-14 sm:top-3 sm:text-xs">
            YENİ
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
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
          className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 transition-all hover:bg-white sm:right-3 sm:top-3 sm:p-2"
          aria-label={favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        >
          <Heart
            className={`h-4 w-4 transition-colors sm:h-5 sm:w-5 ${
              favorite ? 'fill-rose text-rose' : 'text-bronze/60'
            }`}
          />
        </button>

        {/* Color Variants - Bottom of image */}
        {product.colors.length > 1 && (
          <div
            className={`absolute right-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 shadow-sm sm:right-3 ${
              isLowStock ? 'bottom-10 sm:bottom-11' : 'bottom-2 sm:bottom-3'
            }`}
          >
            {product.colors.slice(0, 3).map((color) => (
              <button
                key={color.name}
                onClick={(e) => {
                  e.preventDefault()
                  setSelectedColor(color)
                }}
                className={`relative h-4 w-4 rounded-full border transition-transform hover:scale-110 sm:h-5 sm:w-5 ${
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
            {extraColors > 0 && (
              <span className="ml-0.5 text-[10px] text-bronze/60 sm:text-xs">
                +{extraColors} Renk
              </span>
            )}
          </div>
        )}

        {/* Product Name Tooltip on Hover */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-bronze/90 px-3 py-1.5 text-xs text-white shadow-lg ${
            isLowStock ? 'bottom-[4.75rem] sm:bottom-[5.25rem]' : 'bottom-12 sm:bottom-14'
          }`}
        >
          {product.name} {selectedColor.name}
        </motion.div>
      </Link>

      {/* Product Info */}
      <div className="mt-3 space-y-1">
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 text-xs text-bronze transition-colors group-hover:text-bronze-dark sm:text-sm">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-baseline gap-2">
          {hasDiscount && (
            <span className="text-xs text-zinc-400 line-through sm:text-sm">
              {formatPrice(product.originalPrice!)}
            </span>
          )}
          <span className={`text-sm font-semibold sm:text-base ${hasDiscount ? 'text-[#7B1E2B]' : 'text-bronze'}`}>
            {formatPrice(product.price)}
          </span>
        </div>
        <p className={`text-xs font-medium ${product.inStock === false ? 'text-[#c41e3a]' : isLowStock ? 'text-[#7B1E2B]' : 'text-bronze/55'}`}>
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
