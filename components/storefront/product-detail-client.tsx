'use client'

import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, Minus, Plus, RefreshCcw, ShieldCheck, Sparkles, Star, Truck, X, MessageCircle } from 'lucide-react'
import { useCart } from '@/components/storefront/cart-context'
import {
  DEFAULT_STORE_POLICY_CLAIMS,
  mergeStorePolicyClaims,
  type StorePolicyClaims,
} from '@/lib/policy-claims'

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
  videoUrl?: string
}

type ProductSpec = {
  key: string
  label: string
  value: string
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

function getEmbeddableVideoUrl(videoUrl?: string) {
  const raw = String(videoUrl || "").trim()
  if (!raw) return ""
  if (raw.includes("youtube.com/watch")) {
    const url = new URL(raw)
    const id = url.searchParams.get("v")
    return id ? `https://www.youtube.com/embed/${id}` : raw
  }
  if (raw.includes("youtu.be/")) {
    const id = raw.split("youtu.be/")[1]?.split("?")[0]
    return id ? `https://www.youtube.com/embed/${id}` : raw
  }
  if (raw.includes("vimeo.com/")) {
    const id = raw.split("vimeo.com/")[1]?.split("?")[0]
    return id ? `https://player.vimeo.com/video/${id}` : raw
  }
  return raw
}

export function ProductDetailClient({
  product,
  productSpecs = [],
  initialColor,
}: {
  product: ProductDetailData
  productSpecs?: ProductSpec[]
  initialColor?: string
}) {
  const router = useRouter()
  const { addItem, isDrawerOpen } = useCart()
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
  const [, setReviewPhoto] = useState<File | null>(null)
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [policyClaims, setPolicyClaims] = useState<StorePolicyClaims>(DEFAULT_STORE_POLICY_CLAIMS)

  const colorValues = useMemo(
    () =>
      product.options.find((option) => ['renk', 'color'].includes((option.name || '').toLocaleLowerCase('tr')))
        ?.values || [],
    [product.options]
  )
  const [selectedColor, setSelectedColor] = useState<string>(colorValues[0] || '')

  useEffect(() => {
    if (colorValues.length === 0) {
      setSelectedColor('')
      return
    }

    const requestedColor = String(initialColor || '').trim()
    if (!requestedColor) {
      setSelectedColor(colorValues[0])
      return
    }

    const matchedColor =
      colorValues.find((color) => color.toLocaleLowerCase('tr') === requestedColor.toLocaleLowerCase('tr')) ||
      colorValues[0]
    setSelectedColor(matchedColor)
  }, [initialColor, colorValues, product.id])

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
  const colorStockByName = useMemo(() => {
    return product.variants.reduce<Record<string, number>>((acc, variant) => {
      if (!variant.availableForSale) return acc
      const qty = Number(variant.quantityAvailable || 0)
      if (!Number.isFinite(qty) || qty <= 0) return acc
      const colorOptionValue = variant.selectedOptions.find((option) =>
        ['renk', 'color'].includes((option.name || '').toLocaleLowerCase('tr'))
      )?.value
      const colorName = String(colorOptionValue || 'Standart').trim() || 'Standart'
      acc[colorName] = (acc[colorName] || 0) + qty
      return acc
    }, {})
  }, [product.variants])

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
  const maxSelectableQuantity =
    selectedVariant && selectedVariant.quantityAvailable > 0
      ? selectedVariant.quantityAvailable
      : undefined
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
        maxQuantity: maxSelectableQuantity,
      },
      quantity
    )
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1500)
  }

  const handleBuyNow = () => {
    if (!selectedVariant || !inStock) return
    addItem(
      {
        id: selectedVariant.id,
        slug: product.slug,
        name: product.name,
        price: selectedVariant.price || product.price,
        image: galleryImages[0],
        color: selectedColor || undefined,
        maxQuantity: maxSelectableQuantity,
      },
      quantity
    )
    router.push('/odeme')
  }

  const handleWhatsAppQuickOrder = () => {
    if (!selectedVariant || !inStock) return
    const rawPhone = String(process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '')
    const phone = rawPhone.replace(/\D/g, '')
    if (!phone) {
      setToastMessage('WhatsApp sipariş numarası yakında eklenecek.')
      return
    }

    const messageLines = [
      'Merhaba, hızlı sipariş vermek istiyorum.',
      `Ürün: ${product.name}`,
      selectedColor ? `Renk: ${selectedColor}` : '',
      `Adet: ${quantity}`,
      `Fiyat: ${formatPrice(displayPrice)}`,
      `Ürün Linki: ${window.location.href}`,
    ].filter(Boolean)
    const message = encodeURIComponent(messageLines.join('\n'))
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer')
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

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const response = await fetch('/api/storefront/policy-claims', { cache: 'no-store' })
        const data = (await response.json()) as Partial<StorePolicyClaims>
        if (!cancelled) setPolicyClaims(mergeStorePolicyClaims(data))
      } catch {
        if (!cancelled) setPolicyClaims(DEFAULT_STORE_POLICY_CLAIMS)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const hasReviews = Number(product.reviewRating || 0) > 0 && Number(product.reviewRatingCount || 0) > 0
  const embeddableVideoUrl = getEmbeddableVideoUrl(product.videoUrl)
  const isExternalEmbed = embeddableVideoUrl.includes("youtube.com/embed") || embeddableVideoUrl.includes("player.vimeo.com/video")

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

  useEffect(() => {
    if (typeof maxSelectableQuantity !== 'number' || maxSelectableQuantity <= 0) return
    setQuantity((prev) => Math.min(prev, maxSelectableQuantity))
  }, [maxSelectableQuantity, selectedVariant?.id])

  return (
    <div
      className={`relative grid gap-10 lg:grid-cols-2 lg:gap-20 ${
        isDrawerOpen ? 'pb-0' : 'pb-28'
      }`}
    >
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

        {embeddableVideoUrl ? (
          <section className="rounded-2xl border border-bronze/10 bg-gradient-to-b from-[#fffdf9] to-[#fffaf0] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-bronze/70">Ürün Tanıtım Videosu</p>
            <div className="mt-4 overflow-hidden rounded-xl border border-bronze/15 bg-black/90 shadow-[0_18px_34px_-26px_rgba(28,20,15,0.75)]">
              {isExternalEmbed ? (
                <div className="relative aspect-video w-full">
                  <iframe
                    src={embeddableVideoUrl}
                    title={`${product.name} tanıtım videosu`}
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="relative aspect-video w-full">
                  <video
                    className="absolute inset-0 h-full w-full"
                    src={embeddableVideoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    poster={galleryImages[0] || undefined}
                  >
                    Tarayıcınız video etiketini desteklemiyor.
                  </video>
                </div>
              )}
            </div>
            <a
              href={String(product.videoUrl || embeddableVideoUrl)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-xs font-medium text-bronze/75 underline underline-offset-4 hover:text-bronze"
            >
              Video açılmazsa yeni sekmede aç
            </a>
          </section>
        ) : null}

        {productSpecs.length > 0 ? (
          <section className="rounded-2xl border border-bronze/10 bg-gradient-to-b from-[#fffdf9] to-[#fffaf0] p-5">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-bronze/70">Ürün Özellikleri</p>
            <div className="divide-y divide-bronze/10">
              {productSpecs.map((field) => (
                <details key={field.key} className="group py-2">
                  <summary className="cursor-pointer list-none py-3 text-sm font-medium text-bronze-dark">
                    <span className="inline-flex w-full items-center justify-between">
                      <span>{field.label}</span>
                      <span className="text-bronze/50 transition-transform group-open:rotate-180">⌄</span>
                    </span>
                  </summary>
                  <p className="pb-3 pr-8 text-sm leading-relaxed text-bronze/75">{field.value}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}
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
          <a
            href="#product-reviews"
            className="text-bronze/70 underline-offset-4 transition-colors hover:text-bronze hover:underline"
          >
            {reviewCount} Değerlendirme
          </a>
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
              <span className="text-sm text-bronze/60">
                {selectedColor || 'Seçiniz'}
                {selectedColor && Number(colorStockByName[selectedColor] || 0) > 0
                  ? ` • Son ${Number(colorStockByName[selectedColor] || 0)}`
                  : ''}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {colorValues.map((color) => {
                const isActive = selectedColor === color
                const hex = colorHexMap[(color || '').toLocaleLowerCase('tr')] || '#D4C4A8'
                const colorStock = Number(colorStockByName[color] || 0)
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
                    {colorStock > 0 && colorStock <= 10 ? (
                      <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7B1E2B] px-1 text-[10px] font-semibold leading-none text-white">
                        {colorStock}
                      </span>
                    ) : null}
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
            <button
              onClick={() =>
                setQuantity((q) =>
                  typeof maxSelectableQuantity === 'number' && maxSelectableQuantity > 0
                    ? Math.min(maxSelectableQuantity, q + 1)
                    : q + 1
                )
              }
              className="p-3 text-bronze"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {selectedVariant && inStock && selectedVariant.quantityAvailable > 0 && selectedVariant.quantityAvailable <= 10 ? (
          <div className="mt-4 rounded-xl border border-[#7B1E2B]/30 bg-gradient-to-r from-[#fff1f3] to-[#ffe7eb] px-4 py-3 shadow-[0_10px_22px_-16px_rgba(123,30,43,0.65)]">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#7B1E2B]">
              Son {selectedVariant.quantityAvailable} ürün kaldı
            </p>
            <p className="mt-1 text-xs text-[#8b3a48]">
              Yoğun talep var, tükenmeden sepete eklemenizi öneririz.
            </p>
          </div>
        ) : null}
        {!inStock ? (
          <div className="mt-4 rounded-xl border border-[#c41e3a]/25 bg-[#fff0f2] px-4 py-3">
            <p className="text-sm font-semibold text-[#c41e3a]">Bu varyant stokta bulunmuyor.</p>
            <p className="mt-1 text-xs text-[#b14b5d]">Farklı renk seçerek tekrar deneyebilirsiniz.</p>
          </div>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleWhatsAppQuickOrder}
            disabled={!inStock}
            className={`rounded-xl px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] transition-colors ${
              inStock
                ? 'bg-bronze text-white hover:bg-bronze-dark'
                : 'cursor-not-allowed bg-bronze/35 text-white/75'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              {inStock ? 'WhatsApp ile Hızlı Sipariş Ver' : 'Tükendi'}
            </span>
          </motion.button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!inStock}
            className={`rounded-xl border px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] transition-colors ${
              inStock
                ? 'border-bronze text-bronze hover:bg-bronze hover:text-white'
                : 'cursor-not-allowed border-bronze/20 text-bronze/40'
            }`}
          >
            Hemen Satın Al
          </button>
        </div>

        <section className="mt-5 rounded-2xl border border-bronze/10 bg-gradient-to-b from-[#fffdf9] to-[#fff9ef] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-bronze/70">Güvenli Alışveriş Ayrıcalıkları</p>
            <span className="rounded-full border border-bronze/20 bg-white/75 px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-bronze/70">
              Eftalia Güvencesi
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-start gap-2 rounded-lg border border-bronze/10 bg-white/80 p-3 text-xs text-bronze/80">
              <Truck className="mt-0.5 h-4 w-4 text-bronze" />
              <div>
                <p className="font-semibold text-bronze-dark">Ücretsiz Kargo</p>
                <p className="mt-0.5 text-[11px] text-bronze/65">{policyClaims.shippingDispatchWindow}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-bronze/10 bg-white/80 p-3 text-xs text-bronze/80">
              <RefreshCcw className="mt-0.5 h-4 w-4 text-bronze" />
              <div>
                <p className="font-semibold text-bronze-dark">Kolay İade Süreci</p>
                <p className="mt-0.5 text-[11px] text-bronze/65">{policyClaims.returnWindow}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-bronze/10 bg-white/80 p-3 text-xs text-bronze/80">
              <Sparkles className="mt-0.5 h-4 w-4 text-bronze" />
              <div>
                <p className="font-semibold text-bronze-dark">%100 El İşçiliği</p>
                <p className="mt-0.5 text-[11px] text-bronze/65">Her üründe premium malzeme ve özenli üretim standardı.</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-bronze/10 bg-white/80 p-3 text-xs text-bronze/80">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-bronze" />
              <div>
                <p className="font-semibold text-bronze-dark">Güvenli Ödeme</p>
                <p className="mt-0.5 text-[11px] text-bronze/65">SSL korumalı altyapı ile güvenli ödeme deneyimi.</p>
              </div>
            </div>
          </div>
        </section>
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

      {!isDrawerOpen ? (
        <div
          className="fixed inset-x-0 bottom-0 z-[90] border-t border-bronze/20 bg-[#fdf8f0]/98 shadow-[0_-14px_44px_-16px_rgba(66,46,35,0.42)] backdrop-blur-md ring-1 ring-black/[0.04]"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
          role="region"
          aria-label="Sepete ekle çubuğu"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 pt-3 pb-1 sm:gap-4 sm:px-6 sm:pt-3.5 lg:gap-6 lg:px-8 lg:pt-4">
            <div className="min-w-0 flex-1">
              {hasDiscount && typeof displayCompare === 'number' ? (
                <p className="text-xs text-zinc-400 line-through sm:text-sm">{formatPrice(displayCompare)}</p>
              ) : null}
              <p className="truncate text-lg font-bold text-bronze-dark sm:text-xl lg:text-2xl">
                {formatPrice(displayPrice)}
              </p>
              {quantity > 1 ? (
                <p className="truncate text-[11px] text-bronze/60 sm:text-xs">
                  {quantity} adet sepete eklenecek
                </p>
              ) : selectedColor ? (
                <p className="truncate text-[11px] text-bronze/60 sm:text-xs">{selectedColor}</p>
              ) : null}
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`shrink-0 rounded-xl px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors sm:px-6 sm:py-4 sm:text-sm lg:px-8 lg:py-4 lg:tracking-[0.14em] ${
                inStock
                  ? 'bg-bronze text-white shadow-[0_10px_26px_-14px_rgba(66,46,35,0.7)] hover:bg-bronze-dark'
                  : 'cursor-not-allowed bg-bronze/35 text-white/75'
              }`}
            >
              {isAdded ? (
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                  Eklendi
                </span>
              ) : inStock ? (
                'Sepete Ekle'
              ) : (
                'Tükendi'
              )}
            </motion.button>
          </div>
        </div>
      ) : null}

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
