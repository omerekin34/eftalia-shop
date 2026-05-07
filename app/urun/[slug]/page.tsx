'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Share2,
  Truck,
  RefreshCw,
  Shield,
  Check,
  Star,
  LockKeyhole,
  CircleCheck,
} from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { ProductCard } from '@/components/storefront/product-card'
import { useCart } from '@/components/storefront/cart-context'
import { getProducts, type ProductCardModel } from '@/lib/shopify/getProducts'

// Product interface
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
  description?: string
  details?: string[]
  materials?: string[]
  dimensions?: { label: string; value: string }[]
  inStock?: boolean
}

type QuickInfoItem = {
  id: string
  title: string
  content: string
}

type ProductReview = {
  id: string
  name: string
  date: string
  rating: number
  comment: string
}

// Mock products data (same as tum-urunler)
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Mari Vintage Baget Çanta',
    slug: 'mari-vintage-baget-canta-mint',
    price: 579.90,
    originalPrice: 1449.75,
    discount: 60,
    images: ['/images/products/bag-1.jpg', '/images/products/bag-1-hover.jpg', '/images/products/bag-1.jpg', '/images/products/bag-1-hover.jpg'],
    category: 'canta',
    subcategory: 'Baget Çanta',
    colors: [
      { name: 'Mint', hex: '#98D4BB' },
      { name: 'Krem', hex: '#F5F5DC' },
      { name: 'Pudra', hex: '#E8D5D5' },
    ],
    isNew: true,
    isBestseller: true,
    description: 'El yapımı, gerçek deriden üretilmiş vintage tarzı baget çanta. Günlük kullanım için ideal boyut ve şık tasarım.',
    details: [
      'Gerçek deri malzeme',
      'El yapımı üretim',
      'Ayarlanabilir omuz askısı',
      'İç cep ve fermuar bölmesi',
      'Antik bronz metal aksesuarlar',
    ],
    materials: ['%100 Gerçek Deri', 'Pamuklu iç astar', 'Metal aksesuarlar'],
    dimensions: [
      { label: 'Genişlik', value: '25 cm' },
      { label: 'Yükseklik', value: '15 cm' },
      { label: 'Derinlik', value: '8 cm' },
      { label: 'Askı uzunluğu', value: '50-110 cm' },
    ],
  },
  {
    id: '2',
    name: 'Lina Çapraz Çanta',
    slug: 'lina-capraz-canta-mint',
    price: 429.90,
    originalPrice: 1074.75,
    discount: 60,
    images: ['/images/products/bag-2.jpg', '/images/products/bag-2-hover.jpg'],
    category: 'canta',
    subcategory: 'Çapraz Çanta',
    colors: [
      { name: 'Mint', hex: '#98D4BB' },
      { name: 'Siyah', hex: '#1a1a1a' },
    ],
    isNew: true,
    isBestseller: true,
    description: 'Minimalist tasarımlı çapraz çanta. Günlük kullanım için pratik ve şık.',
    details: [
      'Gerçek deri malzeme',
      'Kompakt tasarım',
      'Ayarlanabilir askı',
      'Fermuar kapatma',
    ],
    materials: ['%100 Gerçek Deri', 'Pamuklu iç astar'],
    dimensions: [
      { label: 'Genişlik', value: '20 cm' },
      { label: 'Yükseklik', value: '14 cm' },
      { label: 'Derinlik', value: '6 cm' },
    ],
  },
  {
    id: '3',
    name: 'Giglio Spor Omuz Çantası',
    slug: 'giglio-spor-omuz-cantasi',
    price: 729.90,
    originalPrice: 1824.75,
    discount: 60,
    images: ['/images/products/bag-3.jpg', '/images/products/bag-3-hover.jpg'],
    category: 'canta',
    subcategory: 'Omuz Çantası',
    colors: [
      { name: 'Siyah', hex: '#1a1a1a' },
      { name: 'Kahve', hex: '#5C4033' },
      { name: 'Bej', hex: '#D4C4A8' },
    ],
    isBestseller: true,
    description: 'Geniş hacimli spor omuz çantası. Aktif yaşam için dayanıklı ve fonksiyonel.',
    details: [
      'Premium deri malzeme',
      'Geniş ana bölme',
      'Laptop cebi',
      'Yan cepler',
    ],
    materials: ['%100 Gerçek Deri', 'Dayanıklı iç astar'],
    dimensions: [
      { label: 'Genişlik', value: '40 cm' },
      { label: 'Yükseklik', value: '30 cm' },
      { label: 'Derinlik', value: '15 cm' },
    ],
  },
]

// Default product for fallback
const defaultProduct: Product = {
  id: '0',
  name: 'Ürün',
  slug: 'urun',
  price: 599.90,
  originalPrice: 999.90,
  discount: 40,
  images: [],
  category: 'canta',
  subcategory: 'El Çantası',
  colors: [
    { name: 'Krem', hex: '#F5F5DC' },
    { name: 'Siyah', hex: '#1a1a1a' },
    { name: 'Kahve', hex: '#5C4033' },
  ],
  description: 'El yapımı, gerçek deriden üretilmiş özel tasarım çanta. Zamansız stil ve üstün kalite.',
  details: [
    'Gerçek deri malzeme',
    'El yapımı üretim',
    'Ayarlanabilir askı',
    'İç cep ve fermuar bölmesi',
  ],
  materials: ['%100 Gerçek Deri', 'Pamuklu iç astar', 'Metal aksesuarlar'],
  dimensions: [
    { label: 'Genişlik', value: '30 cm' },
    { label: 'Yükseklik', value: '20 cm' },
    { label: 'Derinlik', value: '10 cm' },
  ],
}

type ShopifyProductApiNode = {
  id: string
  handle: string
  title: string
  description?: string
  productType?: string
  tags?: string[]
  featuredImage?: { url: string } | null
  images?: { edges?: Array<{ node?: { url?: string | null } }> }
  variants?: {
    edges?: Array<{
      node?: {
        availableForSale?: boolean
        quantityAvailable?: number | null
        price?: { amount?: string }
        compareAtPrice?: { amount?: string } | null
        selectedOptions?: Array<{ name: string; value: string }>
      }
    }>
  }
}

const colorHexMap: Record<string, string> = {
  krem: '#F5F5DC',
  siyah: '#1a1a1a',
  antrasit: '#383838',
  vizon: '#8B7355',
  bej: '#D4C4A8',
  kahve: '#5C4033',
  pudra: '#E8D5D5',
  mint: '#98D4BB',
  taba: '#A67B5B',
}

function mapShopifyProductToUi(node: ShopifyProductApiNode): Product {
  const variants = node.variants?.edges?.map((edge) => edge.node).filter(Boolean) || []
  const prices = variants.map((variant) => Number(variant?.price?.amount || 0)).filter((p) => p > 0)
  const comparePrices = variants
    .map((variant) => Number(variant?.compareAtPrice?.amount || 0))
    .filter((p) => p > 0)

  const minPrice = prices.length ? Math.min(...prices) : defaultProduct.price
  const minComparePrice = comparePrices.length ? Math.min(...comparePrices) : undefined
  const discount =
    minComparePrice && minComparePrice > minPrice
      ? Math.round(((minComparePrice - minPrice) / minComparePrice) * 100)
      : undefined

  const inStock = variants.some(
    (variant) => Boolean(variant?.availableForSale) && ((variant?.quantityAvailable ?? 1) > 0)
  )

  const images = Array.from(
    new Set(
      [node.featuredImage?.url, ...(node.images?.edges || []).map((edge) => edge.node?.url)].filter(
        Boolean
      )
    )
  ) as string[]

  const colorValues = Array.from(
    new Set(
      variants
        .flatMap((variant) => variant?.selectedOptions || [])
        .filter((option) =>
          ['color', 'renk'].includes((option.name || '').toLocaleLowerCase('tr'))
        )
        .map((option) => option.value)
    )
  )

  const colors: ProductColor[] = colorValues.length
    ? colorValues.map((name) => ({
        name,
        hex: colorHexMap[name.toLocaleLowerCase('tr')] || '#D4C4A8',
      }))
    : defaultProduct.colors

  const tags = node.tags || []

  return {
    id: node.id,
    name: node.title,
    slug: node.handle,
    price: minPrice,
    originalPrice: minComparePrice,
    discount,
    images,
    category: (node.productType || '').toLocaleLowerCase('tr').includes('cüzdan') ? 'cuzdan-kartlik' : 'canta',
    subcategory: node.productType || defaultProduct.subcategory,
    colors,
    isNew: tags.some((tag) => ['new', 'yeni'].includes((tag || '').toLocaleLowerCase('tr'))),
    isBestseller: tags.some((tag) =>
      ['bestseller', 'çok satan', 'cok-satan', 'coksatan'].includes((tag || '').toLocaleLowerCase('tr'))
    ),
    description: node.description || defaultProduct.description,
    details: defaultProduct.details,
    materials: defaultProduct.materials,
    dimensions: defaultProduct.dimensions,
    inStock,
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [shopifyProduct, setShopifyProduct] = useState<Product | null>(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  const [similarProducts, setSimilarProducts] = useState<ProductCardModel[]>([])
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(true)

  // Shopify öncelikli, fallback mock/default
  const fallbackProduct =
    mockProducts.find((p) => p.slug === slug) || {
      ...defaultProduct,
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      slug,
    }
  const product = shopifyProduct || fallbackProduct

  const [selectedColor, setSelectedColor] = useState(product.colors[0] || defaultProduct.colors[0])
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'materials' | 'dimensions'>('details')
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [openQuickInfoId, setOpenQuickInfoId] = useState<string | null>('urun-ozellikleri')
  const [showAllReviews, setShowAllReviews] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoadingProduct(true)
        const response = await fetch(`/api/shopify/product/${slug}`, { cache: 'no-store' })
        if (!response.ok) {
          setShopifyProduct(null)
          return
        }
        const data = (await response.json()) as { product?: ShopifyProductApiNode }
        if (data.product) {
          setShopifyProduct(mapShopifyProductToUi(data.product))
        } else {
          setShopifyProduct(null)
        }
      } catch {
        setShopifyProduct(null)
      } finally {
        setIsLoadingProduct(false)
      }
    }

    loadProduct()
  }, [slug])

  useEffect(() => {
    setSelectedColor(product.colors[0] || defaultProduct.colors[0])
    setCurrentImageIndex(0)
  }, [product.id, product.colors])

  useEffect(() => {
    const loadSimilarProducts = async () => {
      try {
        setIsLoadingSimilar(true)
        const allProducts = await getProducts(100)
        const inStockProducts = allProducts.filter((item) => item.inStock !== false)
        const currentFromCatalog = inStockProducts.find((item) => item.slug === slug)
        const candidates = inStockProducts.filter((item) => item.slug !== slug)

        const currentCollections = currentFromCatalog?.collections || []
        const similarByCollection =
          currentCollections.length > 0
            ? candidates.filter((item) =>
                (item.collections || []).some((collection) =>
                  currentCollections.some((currentCollection) => currentCollection.handle === collection.handle)
                )
              )
            : []

        const similarBase = similarByCollection.length
          ? similarByCollection
          : candidates.filter(
              (item) =>
                item.subcategory.toLocaleLowerCase('tr') === product.subcategory.toLocaleLowerCase('tr') ||
                item.category === product.category
            )

        setSimilarProducts(similarBase.slice(0, 4))
      } catch {
        setSimilarProducts([])
      } finally {
        setIsLoadingSimilar(false)
      }
    }

    void loadSimilarProducts()
  }, [slug, product.category, product.subcategory])

  const productReviews: ProductReview[] = [
    {
      id: '1',
      name: 'Ayse K.',
      date: '12 Nisan 2026',
      rating: 5,
      comment: 'Deri kalitesi bekledigimden iyi cikti. Renk tam fotograflardaki gibi ve gunluk kullanimda cok rahat.',
    },
    {
      id: '2',
      name: 'Merve T.',
      date: '08 Nisan 2026',
      rating: 5,
      comment: 'Paketleme cok ozenliydi. Canta hem sik hem de ic hacmi gayet kullanisli.',
    },
    {
      id: '3',
      name: 'Seda Y.',
      date: '02 Nisan 2026',
      rating: 4,
      comment: 'Urun guzel, dikişleri temiz. Kargo da hizli geldi. Farkli renklerini de almayi dusunuyorum.',
    },
    {
      id: '4',
      name: 'Ece B.',
      date: '27 Mart 2026',
      rating: 5,
      comment: 'Tam aradigim boyutta. Kombinlemesi kolay, malzeme hissi premium.',
    },
  ]

  const visibleReviews = showAllReviews ? productReviews : productReviews.slice(0, 1)

  const quickInfoItems: QuickInfoItem[] = [
    {
      id: 'urun-ozellikleri',
      title: 'Ürün Özellikleri',
      content: 'Bu model, günlük kullanım için ideal ölçülerde hazırlanmıştır. İç bölümde düzenleyici cepler ve güvenli fermuarlı alan bulunur.',
    },
    {
      id: 'bakim-rehberi',
      title: 'Deri Bakım Rehberi',
      content: 'Ürünün uzun ömürlü kalması için direkt güneşten ve yoğun nemden uzak tutunuz. Yumuşak, kuru bir bez ile düzenli temizleyiniz.',
    },
    {
      id: 'kargo-teslimat',
      title: 'Kargo ve Teslimat',
      content: 'Siparişleriniz 1-3 iş günü içinde özenle hazırlanıp kargoya verilir. Teslimat süreci bölgeye göre 1-4 iş günü arasında değişebilir.',
    },
    {
      id: 'iade-degisim',
      title: 'İade ve Değişim',
      content: 'Kullanılmamış ürünlerde 14 gün içinde kolay iade veya değişim yapabilirsiniz. Talep için destek ekibimiz süreç boyunca size yardımcı olur.',
    },
    {
      id: 'odeme-guvenligi',
      title: 'Ödeme Güvencesi',
      content:
        'Ödeme adımında Shopify altyapısına yönlendirilirsiniz. Kart bilgileriniz Shopify tarafından güvenli ödeme sayfasında işlenir ve EFTALIA sistemlerinde saklanmaz.',
    },
    {
      id: 'eftalia-case-dokunusu',
      title: 'EFTALIA Dokunuşu',
      content: 'Her parça, usta ellerde özenle tamamlanır ve kalite kontrol sonrası paketlenir. Zamansız kullanım için dayanıklı malzemeler tercih edilir.',
    },
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(price)
  }

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0],
        color: selectedColor.name,
      },
      quantity
    )
    setIsAddedToCart(true)
    setTimeout(() => setIsAddedToCart(false), 2000)
  }

  const nextImage = () => {
    if (product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pb-20 pt-32 sm:pt-36">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-bronze/60">
            <Link href="/" className="transition-colors hover:text-bronze">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/tum-urunler" className="transition-colors hover:text-bronze">Ürünler</Link>
            <span>/</span>
            <span className="text-bronze">{product.name}</span>
          </nav>
        </div>

        {/* Product Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            
            {/* Left: Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="group relative aspect-[4/5] overflow-hidden bg-ivory-warm">
                {product.images.length > 0 ? (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0"
                      >
                        <Image
                          src={product.images[currentImageIndex]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          priority
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 opacity-0 shadow-lg transition-all hover:bg-white group-hover:opacity-100"
                          aria-label="Önceki resim"
                        >
                          <ChevronLeft className="h-5 w-5 text-bronze" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 opacity-0 shadow-lg transition-all hover:bg-white group-hover:opacity-100"
                          aria-label="Sonraki resim"
                        >
                          <ChevronRight className="h-5 w-5 text-bronze" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <svg className="h-24 w-24 text-bronze/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Badges */}
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  {product.discount && (
                    <span className="bg-[#c41e3a] px-3 py-1 text-sm font-medium text-white">
                      %{product.discount}
                    </span>
                  )}
                  {product.isNew && (
                    <span className="bg-bronze px-3 py-1 text-sm font-medium text-white">
                      YENİ
                    </span>
                  )}
                </div>

                {/* Wishlist & Share */}
                <div className="absolute right-4 top-4 flex flex-col gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="rounded-full bg-white/80 p-2.5 shadow-lg transition-all hover:bg-white"
                    aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors ${
                        isFavorite ? 'fill-rose text-rose' : 'text-bronze/60'
                      }`}
                    />
                  </button>
                  <button
                    className="rounded-full bg-white/80 p-2.5 shadow-lg transition-all hover:bg-white"
                    aria-label="Paylaş"
                  >
                    <Share2 className="h-5 w-5 text-bronze/60" />
                  </button>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative h-20 w-20 flex-shrink-0 overflow-hidden bg-ivory-warm transition-all ${
                        currentImageIndex === index
                          ? 'ring-2 ring-bronze ring-offset-2'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} - Görsel ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col">
              {/* Category */}
              <p className="text-sm uppercase tracking-widest text-bronze/60">
                {product.subcategory}
              </p>

              {/* Title */}
              <h1 className="mt-2 font-serif text-3xl text-bronze-dark md:text-4xl">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3">
                {product.originalPrice && (
                  <span className="text-lg text-bronze/40 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <span className={`text-2xl font-medium ${product.originalPrice ? 'text-[#c41e3a]' : 'text-bronze'}`}>
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Description */}
              <p className="mt-6 leading-relaxed text-bronze/70">
                {product.description}
              </p>

              {/* Color Selection */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-bronze">Renk</span>
                  <span className="text-sm text-bronze/60">{selectedColor.name}</span>
                </div>
                <div className="mt-3 flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`h-10 w-10 rounded-full border-2 transition-all ${
                        selectedColor.name === color.name
                          ? 'border-bronze ring-2 ring-bronze ring-offset-2'
                          : 'border-bronze/20 hover:border-bronze/40'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                      aria-label={`${color.name} rengi seç`}
                    />
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-8">
                <span className="text-sm font-medium text-bronze">Adet</span>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center border border-bronze/20">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 text-bronze transition-colors hover:bg-ivory-warm"
                      aria-label="Azalt"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-bronze">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 text-bronze transition-colors hover:bg-ivory-warm"
                      aria-label="Arttır"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <motion.button
                onClick={handleAddToCart}
                whileTap={{ scale: 0.98 }}
                disabled={isLoadingProduct || product.inStock === false}
                className={`mt-8 flex w-full items-center justify-center gap-2 py-4 text-sm font-medium uppercase tracking-wider transition-all ${
                  isAddedToCart
                    ? 'bg-green-600 text-white'
                    : 'bg-bronze text-white hover:bg-bronze-dark disabled:cursor-not-allowed disabled:bg-bronze/45'
                }`}
              >
                {isAddedToCart ? (
                  <>
                    <Check className="h-5 w-5" />
                    Sepete Eklendi
                  </>
                ) : isLoadingProduct ? (
                  'Yükleniyor...'
                ) : product.inStock === false ? (
                  'Tükendi'
                ) : (
                  'Sepete Ekle'
                )}
              </motion.button>

              {/* Secondary Button */}
              <button className="mt-3 w-full border border-bronze py-4 text-sm font-medium uppercase tracking-wider text-bronze transition-colors hover:bg-bronze hover:text-white">
                Hemen Satın Al
              </button>

              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-white p-2 text-emerald-700">
                    <LockKeyhole className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">Shopify Güvenli Ödeme</p>
                    <p className="mt-1 text-sm leading-relaxed text-emerald-900/85">
                      Ödeme sırasında Shopify&apos;ın güvenli ödeme ekranına yönlendirilirsiniz. Kart
                      bilgileriniz EFTALIA tarafında tutulmaz.
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-emerald-900/85 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <CircleCheck className="h-3.5 w-3.5" />
                    <span>Ödeme verileri Shopify altyapısında işlenir</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleCheck className="h-3.5 w-3.5" />
                    <span>Sipariş sonrası destek ve takip hesabında görünür</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-bronze/10 pt-8">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Truck className="h-6 w-6 text-bronze/60" />
                  <span className="text-xs text-bronze/60">Ücretsiz Kargo</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <RefreshCw className="h-6 w-6 text-bronze/60" />
                  <span className="text-xs text-bronze/60">14 Gün İade</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <Shield className="h-6 w-6 text-bronze/60" />
                  <span className="text-xs text-bronze/60">Güvenli Ödeme</span>
                </div>
              </div>

              {/* Product Details Tabs */}
              <div className="mt-10 border-t border-bronze/10 pt-8">
                <div className="flex gap-6 border-b border-bronze/10">
                  {(['details', 'materials', 'dimensions'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? 'border-b-2 border-bronze text-bronze'
                          : 'text-bronze/50 hover:text-bronze/70'
                      }`}
                    >
                      {tab === 'details' && 'Detaylar'}
                      {tab === 'materials' && 'Malzemeler'}
                      {tab === 'dimensions' && 'Ölçüler'}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="py-6"
                  >
                    {activeTab === 'details' && (
                      <ul className="space-y-2">
                        {(product.details || defaultProduct.details)?.map((detail, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-bronze/70">
                            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-bronze/40" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                    {activeTab === 'materials' && (
                      <ul className="space-y-2">
                        {(product.materials || defaultProduct.materials)?.map((material, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-bronze/70">
                            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-bronze/40" />
                            {material}
                          </li>
                        ))}
                      </ul>
                    )}
                    {activeTab === 'dimensions' && (
                      <div className="grid grid-cols-2 gap-4">
                        {(product.dimensions || defaultProduct.dimensions)?.map((dim, index) => (
                          <div key={index} className="flex justify-between border-b border-bronze/10 pb-2">
                            <span className="text-sm text-bronze/60">{dim.label}</span>
                            <span className="text-sm font-medium text-bronze">{dim.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Quick Info Accordion */}
              <div className="mt-8 border-t border-bronze/10">
                <div className="border-b border-bronze/10 py-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-bronze-dark">
                      Yorumlar ({productReviews.length})
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {visibleReviews.map((review) => (
                      <div key={review.id} className="rounded-md border border-bronze/10 bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-bronze">{review.name}</p>
                            <p className="mt-1 text-xs text-bronze/50">{review.date}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                className={`h-4 w-4 ${
                                  index < review.rating
                                    ? 'fill-[#c8a27d] text-[#c8a27d]'
                                    : 'text-bronze/20'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-bronze/70">{review.comment}</p>
                      </div>
                    ))}
                  </div>

                  {productReviews.length > 1 && (
                    <button
                      onClick={() => setShowAllReviews((prev) => !prev)}
                      className="mt-4 flex items-center gap-2 text-sm font-medium text-bronze transition-colors hover:text-bronze-dark"
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full border border-bronze/25 transition-transform ${
                          showAllReviews ? 'rotate-180' : ''
                        }`}
                        aria-hidden
                      >
                        <ChevronDown className="h-4 w-4" />
                      </span>
                      <span>{showAllReviews ? 'Yorumları daralt' : 'Tüm yorumları göster'}</span>
                    </button>
                  )}
                </div>

                {quickInfoItems.map((item) => {
                  const isOpen = openQuickInfoId === item.id

                  return (
                    <div key={item.id} className="border-b border-bronze/10">
                      <button
                        onClick={() => setOpenQuickInfoId(isOpen ? null : item.id)}
                        className="flex w-full items-center justify-between py-5 text-left"
                        aria-expanded={isOpen}
                        aria-controls={`quick-info-${item.id}`}
                      >
                        <span className="text-lg font-medium text-bronze-dark">{item.title}</span>
                        <ChevronRight
                          className={`h-5 w-5 text-bronze/50 transition-transform ${
                            isOpen ? 'rotate-90' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={`quick-info-${item.id}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <p className="pb-5 text-sm leading-relaxed text-bronze/70">
                              {item.content}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <section className="mx-auto mt-16 max-w-7xl border-t border-bronze/10 px-4 pt-12 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-serif text-2xl text-bronze sm:text-3xl">Benzer Ürünler</h2>
          </div>

          {isLoadingSimilar ? (
            <p className="text-sm text-bronze/60">Benzer ürünler yükleniyor...</p>
          ) : similarProducts.length === 0 ? (
            <p className="text-sm text-bronze/60">Bu ürün için benzer ürün bulunamadı.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
              {similarProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
