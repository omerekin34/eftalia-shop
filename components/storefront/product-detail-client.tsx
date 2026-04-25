'use client'

import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Check, Minus, Plus, ShieldCheck, Sparkles, Star, Truck, X } from 'lucide-react'
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
  subcategory?: string
  description: string
  images: string[]
  options: Array<{ name: string; values: string[] }>
  variants: ProductVariant[]
  price: number
  originalPrice?: number
  inStock: boolean
  reviewRating?: number
  reviewRatingCount?: number
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
  const [isZooming, setIsZooming] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewBody, setReviewBody] = useState('')
  const [reviewName, setReviewName] = useState('')
  const [reviewEmail, setReviewEmail] = useState('')
  const [reviewPhoto, setReviewPhoto] = useState<File | null>(null)
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

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
  const hasDiscount =
    typeof displayCompare === 'number' && displayCompare > 0 && displayCompare > displayPrice
  const discountPercent = hasDiscount
    ? Math.round(((displayCompare - displayPrice) / displayCompare) * 100)
    : 0

  const inStock = selectedVariant
    ? selectedVariant.availableForSale && selectedVariant.quantityAvailable > 0
    : product.inStock
  const parsedReviewRating = Number.parseFloat(String(product.reviewRating ?? '').replace(',', '.'))
  const hasValidReviewRating = Number.isFinite(parsedReviewRating) && parsedReviewRating > 0
  const reviewCount = Number(product.reviewRatingCount || 0)
  const isRatingPending = !hasValidReviewRating && reviewCount > 0

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

  const handleZoomMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) })
  }

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' })
        const data = (await response.json()) as {
          authenticated?: boolean
          customer?: { firstName?: string; lastName?: string; email?: string } | null
        }
        if (data?.authenticated) {
          setIsAuthenticated(true)
          const fullName = [data?.customer?.firstName, data?.customer?.lastName].filter(Boolean).join(' ').trim()
          setReviewName(fullName)
          setReviewEmail(data?.customer?.email || '')
        } else {
          setIsAuthenticated(false)
        }
      } catch {
        setIsAuthenticated(false)
      }
    }

    loadSession()
  }, [])

  const hasReviews = Number(product.reviewRating || 0) > 0 && Number(product.reviewRatingCount || 0) > 0

  const handleReviewSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setReviewError('')
    setIsReviewSubmitting(true)

    try {
      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          rating: reviewRating,
          title: reviewTitle,
          body: reviewBody,
          name: reviewName,
          email: reviewEmail,
        }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(data?.error || 'Yorum gönderilemedi.')
      }

      setReviewMessage('')
      setIsReviewModalOpen(false)
      setToastMessage('Değerlendirmen alındı, teşekkürler!')
      setReviewTitle('')
      setReviewBody('')
      setReviewPhoto(null)
      if (!isAuthenticated) {
        setReviewName('')
        setReviewEmail('')
      }
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Yorum gönderilemedi.')
    } finally {
      setIsReviewSubmitting(false)
    }
  }

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(''), 2800)
    return () => clearTimeout(timer)
  }, [toastMessage])

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">
      <div className="space-y-5">
        <div
          className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-bronze/10 bg-ivory-warm shadow-[0_24px_90px_-44px_rgba(66,46,35,0.5)]"
          onMouseMove={handleZoomMove}
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
        >
          {galleryImages[currentImageIndex] ? (
            <Image
              src={galleryImages[currentImageIndex]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-bronze/45">
              Ürün görseli bulunamadı
            </div>
          )}
          {galleryImages[currentImageIndex] ? (
            <div
              className={`pointer-events-none absolute inset-0 hidden transition-opacity duration-200 lg:block ${
                isZooming ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${galleryImages[currentImageIndex]})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                backgroundSize: '210%',
              }}
            />
          ) : null}
        </div>
        {galleryImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {galleryImages.map((image, idx) => (
              <button
                key={`${image}-${idx}`}
                onClick={() => setCurrentImageIndex(idx)}
                className={`relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl border transition-all ${
                  idx === currentImageIndex
                    ? 'border-bronze/60 ring-2 ring-bronze/40 ring-offset-2'
                    : 'border-bronze/10 opacity-70 hover:opacity-100'
                }`}
              >
                <Image src={image} alt={`${product.name}-${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col pt-1">
        <p className="text-xs uppercase tracking-[0.28em] text-bronze/55">
          {product.subcategory || 'Premium Koleksiyon'}
        </p>
        <h1 className="mt-3 font-serif text-3xl text-bronze-dark sm:text-5xl">{product.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-bronze-dark">
            {hasValidReviewRating ? parsedReviewRating.toFixed(1) : isRatingPending ? 'Yükleniyor' : '0.0'}
          </span>
          <span className="inline-flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const value = hasValidReviewRating ? parsedReviewRating : 0
              const isFull = value >= star
              const isHalf = value >= star - 0.5 && value < star
              return (
                <Star
                  key={star}
                  className={`h-4 w-4 ${isFull ? 'fill-[#D4AF37] text-[#D4AF37]' : isHalf ? 'fill-[#E7C76A] text-[#D4AF37]' : 'text-bronze/25'}`}
                />
              )
            })}
          </span>
          <span className="text-bronze/35">•</span>
          <span className="text-bronze/70">{reviewCount} Değerlendirme</span>
          {isRatingPending ? <span className="text-xs text-bronze/60">(puan güncelleniyor)</span> : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-4xl font-bold text-[#111111]">{formatPrice(displayPrice)}</span>
          {hasDiscount ? (
            <span className="text-lg text-zinc-400 line-through">{formatPrice(displayCompare)}</span>
          ) : null}
          {hasDiscount ? (
            <span className="rounded-md bg-[#7B1E2B] px-2.5 py-1 text-xs font-semibold tracking-wide text-white shadow-sm">
              %{discountPercent} İndirim
            </span>
          ) : null}
        </div>

        <p className="mt-7 max-w-xl text-sm leading-relaxed text-bronze/75 sm:text-base">{product.description}</p>

        {colorValues.length > 0 && (
          <div className="mt-10 rounded-2xl border border-bronze/10 bg-white/70 p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium uppercase tracking-[0.16em] text-bronze/70">Renk</span>
              <span className="text-sm text-bronze/60">{selectedColor || 'Seçiniz'}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {colorValues.map((color) => {
                const isActive = selectedColor === color
                const hex = colorHexMap[(color || '').toLocaleLowerCase('tr')] || '#D4C4A8'
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Renk seç: ${color}`}
                    title={color}
                    className={`group relative h-10 w-10 rounded-full border-2 transition-all ${
                      isActive ? 'border-bronze bg-bronze/10 text-bronze-dark' : 'border-bronze/20 text-bronze/75'
                    }`}
                    style={{ backgroundColor: hex }}
                  >
                    <span className={`absolute inset-0 rounded-full ${isActive ? 'ring-2 ring-bronze/25 ring-offset-2' : ''}`} />
                    <span
                      className={`absolute -bottom-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-bronze/15 bg-white px-2 py-1 text-[10px] text-bronze/80 shadow-sm ${
                        isActive ? 'block' : 'group-hover:block'
                      }`}
                    >
                      {color}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-9">
          <span className="text-sm font-medium text-bronze">Adet</span>
          <div className="mt-2 flex w-fit items-center rounded-full border border-bronze/25">
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
          className={`mt-9 flex w-full items-center justify-center gap-2 rounded-xl py-5 text-base font-semibold uppercase tracking-[0.14em] transition-colors ${
            inStock
              ? 'bg-bronze text-white shadow-[0_12px_30px_-12px_rgba(66,46,35,0.65)] hover:bg-bronze-dark'
              : 'cursor-not-allowed bg-bronze/35 text-white/75'
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

        <div className="mt-5 grid gap-2 rounded-xl border border-bronze/10 bg-[#fffdf9] p-4 sm:grid-cols-3">
          <div className="flex items-center gap-2 text-xs text-bronze/80">
            <Truck className="h-4 w-4 text-bronze" />
            <span>Ücretsiz Kargo</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-bronze/80">
            <Sparkles className="h-4 w-4 text-bronze" />
            <span>%100 El İşçiliği</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-bronze/80">
            <ShieldCheck className="h-4 w-4 text-bronze" />
            <span>Güvenli Ödeme</span>
          </div>
        </div>
        <section className="mt-8 rounded-2xl border border-bronze/10 bg-gradient-to-b from-[#fffdf9] to-[#fffaf0] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-bronze/70">Müşteri Değerlendirmeleri</p>
              {hasReviews ? (
                <p className="mt-2 text-sm text-bronze/80">
                  {Number(product.reviewRating || 0).toFixed(1)} / 5 puan • {Number(product.reviewRatingCount || 0)} değerlendirme
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => {
                setReviewMessage('')
                setReviewError('')
                setIsReviewModalOpen(true)
              }}
              className="inline-flex items-center rounded-lg border border-[#9b7a57]/35 bg-[#5B1F2A] px-4 py-2 text-sm font-medium text-[#f7e5bb] transition-colors hover:bg-[#4a1822]"
            >
              Yorum Yaz
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-dashed border-bronze/20 bg-white/60 p-4 text-sm text-bronze/70">
            {hasReviews
              ? `${Number(product.reviewRatingCount || 0)} onaylı değerlendirme bulunuyor.`
              : 'Bu ürün için henüz yorum yapılmadı. İlk yorumu sen yap!'}
          </div>
        </section>
      </div>

      {isReviewModalOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-bronze/20 bg-[#fdf8f0] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-2xl text-[#4d3523]">Yorum Yaz</h3>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="rounded-md p-2 text-bronze/70 transition-colors hover:bg-ivory-warm hover:text-bronze"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-bronze-dark">Yıldız Puanı</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1"
                      aria-label={`${star} yıldız`}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= reviewRating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-bronze/25'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  readOnly={isAuthenticated}
                  required
                  placeholder="İsim Soyisim"
                  className={`rounded-lg border border-bronze/20 px-3 py-2.5 text-sm text-bronze-dark outline-none focus:border-bronze/40 ${
                    isAuthenticated ? 'bg-[#f4ede1]' : 'bg-white'
                  }`}
                />
                <input
                  type="email"
                  value={reviewEmail}
                  onChange={(e) => setReviewEmail(e.target.value)}
                  readOnly={isAuthenticated}
                  required
                  placeholder="E-posta"
                  className={`rounded-lg border border-bronze/20 px-3 py-2.5 text-sm text-bronze-dark outline-none focus:border-bronze/40 ${
                    isAuthenticated ? 'bg-[#f4ede1]' : 'bg-white'
                  }`}
                />
              </div>

              <input
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                required
                placeholder="Yorum Başlığı"
                className="w-full rounded-lg border border-bronze/20 bg-white px-3 py-2.5 text-sm text-bronze-dark outline-none focus:border-bronze/40"
              />

              <textarea
                value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value)}
                required
                rows={4}
                placeholder="Yorumunuz"
                className="w-full rounded-lg border border-bronze/20 bg-white px-3 py-2.5 text-sm text-bronze-dark outline-none focus:border-bronze/40"
              />

              <div>
                <label className="mb-1 block text-sm font-medium text-bronze-dark">Fotoğraf Yükleme (opsiyonel)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReviewPhoto(e.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-bronze/20 bg-white px-3 py-2 text-sm text-bronze-dark"
                />
              </div>

              {reviewError ? <p className="text-sm text-[#7B1E2B]">{reviewError}</p> : null}
              {reviewMessage ? (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{reviewMessage}</p>
              ) : null}

              <button
                type="submit"
                disabled={isReviewSubmitting}
                className="w-full rounded-lg bg-[#5B1F2A] px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#f7e5bb] transition-colors hover:bg-[#4a1822] disabled:opacity-70"
              >
                {isReviewSubmitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {toastMessage ? (
        <div className="fixed right-4 top-6 z-[130] rounded-lg border border-[#9b7a57]/35 bg-[#fff8ea] px-4 py-3 text-sm font-medium text-[#5B1F2A] shadow-lg">
          {toastMessage}
        </div>
      ) : null}
    </div>
  )
}
