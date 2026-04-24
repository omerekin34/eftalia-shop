'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

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
}

interface ProductCardProps {
  product: Product
  showQuickAdd?: boolean
}

export function ProductCard({ product, showQuickAdd = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedColor, setSelectedColor] = useState(product.colors[0])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(price).replace('₺', '₺')
  }

  const extraColors = product.colors.length > 3 ? product.colors.length - 3 : 0

  return (
    <motion.article
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link href={`/product/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-white">
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
        <div className="absolute left-2 top-2 flex flex-col gap-1 sm:left-3 sm:top-3">
          {product.discount && (
            <span className="bg-[#c41e3a] px-2 py-0.5 text-[10px] font-medium text-white sm:text-xs">
              %{product.discount}
            </span>
          )}
          {product.isNew && (
            <span className="bg-bronze px-2 py-0.5 text-[10px] font-medium text-white sm:text-xs">
              YENİ
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            setIsFavorite(!isFavorite)
          }}
          className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 transition-all hover:bg-white sm:right-3 sm:top-3 sm:p-2"
          aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        >
          <Heart
            className={`h-4 w-4 transition-colors sm:h-5 sm:w-5 ${
              isFavorite ? 'fill-rose text-rose' : 'text-bronze/60'
            }`}
          />
        </button>

        {/* Color Variants - Bottom of image */}
        {product.colors.length > 1 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 shadow-sm sm:bottom-3 sm:right-3">
            {product.colors.slice(0, 3).map((color, index) => (
              <button
                key={color.name}
                onClick={(e) => {
                  e.preventDefault()
                  setSelectedColor(color)
                }}
                className={`h-4 w-4 rounded-full border transition-transform hover:scale-110 sm:h-5 sm:w-5 ${
                  selectedColor.name === color.name 
                    ? 'border-bronze ring-1 ring-bronze ring-offset-1' 
                    : 'border-bronze/20'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
                aria-label={`${color.name} rengi seç`}
              />
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
          className="absolute bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-bronze/90 px-3 py-1.5 text-xs text-white shadow-lg sm:bottom-14"
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
          {product.originalPrice && (
            <span className="text-xs text-bronze/40 line-through sm:text-sm">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <span className={`text-sm font-medium sm:text-base ${product.originalPrice ? 'text-[#c41e3a]' : 'text-bronze'}`}>
            {formatPrice(product.price)}
          </span>
        </div>
        <p className={`text-xs ${product.inStock === false ? 'text-[#c41e3a]' : 'text-bronze/55'}`}>
          {product.inStock === false ? 'Tükendi' : 'Stokta'}
        </p>
      </div>
    </motion.article>
  )
}
