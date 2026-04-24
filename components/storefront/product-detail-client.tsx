'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Check, Minus, Plus } from 'lucide-react'
import { useCart } from '@/components/storefront/cart-context'

type ProductVariant = {
  id: string
  title: string
  availableForSale: boolean
  quantityAvailable: number
  price: number
  compareAtPrice?: number
  image?: string
  selectedOptions: Array<{ name: string; value: string }>
}

type ProductDetailData = {
  id: string
  name: string
  slug: string
  description: string
  images: string[]
  options: Array<{ name: string; values: string[] }>
  variants: ProductVariant[]
  price: number
  originalPrice?: number
  inStock: boolean
}

const colorHexMap: Record<string, string> = {
  black: '#1a1a1a',
  beige: '#D4C4A8',
  brown: '#5C4033',
  tan: '#A67B5B',
  white: '#F8F8F8',
  grey: '#808080',
  gray: '#808080',
  cream: '#F5F5DC',
  mint: '#98D4BB',
  pink: '#E8D5D5',
  siyah: '#1a1a1a',
  bej: '#D4C4A8',
  kahve: '#5C4033',
  krem: '#F5F5DC',
  pudra: '#E8D5D5',
  mint: '#98D4BB',
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(price)
}

export function ProductDetailClient({ product }: { product: ProductDetailData }) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isAdded, setIsAdded] = useState(false)

  const colorOption = product.options.find((option) =>
    ['renk', 'color'].includes((option.name || '').toLocaleLowerCase('tr'))
  )

  const colorValues = colorOption?.values || []
  const [selectedColor, setSelectedColor] = useState<string>(colorValues[0] || '')

  const selectedVariant = useMemo(() => {
    if (!product.variants.length) return null
    if (!selectedColor) return product.variants[0]
    return (
      product.variants.find((variant) =>
        variant.selectedOptions.some(
          (option) =>
            ['renk', 'color'].includes((option.name || '').toLocaleLowerCase('tr')) &&
            option.value === selectedColor
        )
      ) || product.variants[0]
    )
  }, [product.variants, selectedColor])

  const galleryImages = useMemo(() => {
    const variantImage = selectedVariant?.image
    const merged = [variantImage, ...product.images].filter(Boolean) as string[]
    return Array.from(new Set(merged))
  }, [product.images, selectedVariant?.image])

  const displayPrice = selectedVariant?.price || product.price
  const displayCompare = selectedVariant?.compareAtPrice || product.originalPrice

  const inStock = selectedVariant
    ? selectedVariant.availableForSale && selectedVariant.quantityAvailable > 0
    : product.inStock

  const handleAddToCart = () => {
    if (!selectedVariant || !inStock) return
    addItem(
      {
        id: selectedVariant.id,
        slug: product.slug,
        name: product.name,
        price: selectedVariant.price || product.price,
        image: galleryImages[0],
        color: selectedColor || undefined,
      },
      quantity
    )
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1500)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
      <div className="space-y-4">
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-ivory-warm">
          {galleryImages[currentImageIndex] ? (
            <Image
              src={galleryImages[currentImageIndex]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-bronze/45">
              Ürün görseli bulunamadı
            </div>
          )}
        </div>
        {galleryImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {galleryImages.map((image, idx) => (
              <button
                key={`${image}-${idx}`}
                onClick={() => setCurrentImageIndex(idx)}
                className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm ${
                  idx === currentImageIndex ? 'ring-2 ring-bronze ring-offset-2' : 'opacity-65'
                }`}
              >
                <Image src={image} alt={`${product.name}-${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <p className="text-xs uppercase tracking-[0.25em] text-bronze/60">{product.subcategory}</p>
        <h1 className="mt-2 font-serif text-3xl text-bronze-dark sm:text-4xl">{product.name}</h1>

        <div className="mt-5 flex items-baseline gap-3">
          {displayCompare && displayCompare > displayPrice ? (
            <span className="text-lg text-bronze/45 line-through">{formatPrice(displayCompare)}</span>
          ) : null}
          <span className="text-3xl font-semibold text-bronze-dark">{formatPrice(displayPrice)}</span>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-bronze/75 sm:text-base">{product.description}</p>

        {colorValues.length > 0 && (
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-bronze">Renk</span>
              <span className="text-sm text-bronze/60">{selectedColor || 'Seçiniz'}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {colorValues.map((color) => {
                const isActive = selectedColor === color
                const hex = colorHexMap[(color || '').toLocaleLowerCase('tr')] || '#D4C4A8'
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all ${
                      isActive ? 'border-bronze bg-bronze/10 text-bronze-dark' : 'border-bronze/20 text-bronze/75'
                    }`}
                  >
                    <span className="h-4 w-4 rounded-full border border-bronze/20" style={{ backgroundColor: hex }} />
                    {color}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-8">
          <span className="text-sm font-medium text-bronze">Adet</span>
          <div className="mt-2 flex items-center border border-bronze/20 w-fit">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3 text-bronze">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-bronze">{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)} className="p-3 text-bronze">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`mt-8 flex w-full items-center justify-center gap-2 rounded-sm py-5 text-base font-semibold uppercase tracking-[0.12em] transition-colors ${
            inStock ? 'bg-bronze text-white hover:bg-bronze-dark' : 'cursor-not-allowed bg-bronze/35 text-white/75'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="h-5 w-5" />
              Sepete Eklendi
            </>
          ) : inStock ? (
            'Sepete Ekle'
          ) : (
            'Tükendi'
          )}
        </motion.button>
      </div>
    </div>
  )
}
