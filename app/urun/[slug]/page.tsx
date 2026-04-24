'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Minus, Plus, ChevronLeft, ChevronRight, Share2, Truck, RefreshCw, Shield, Check } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'

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

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  
  // Find product by slug or use default
  const product = mockProducts.find(p => p.slug === slug) || { ...defaultProduct, name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), slug }
  
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'materials' | 'dimensions'>('details')
  const [isAddedToCart, setIsAddedToCart] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(price)
  }

  const handleAddToCart = () => {
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
      
      <main className="pb-20 pt-24">
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
                className={`mt-8 flex w-full items-center justify-center gap-2 py-4 text-sm font-medium uppercase tracking-wider transition-all ${
                  isAddedToCart
                    ? 'bg-green-600 text-white'
                    : 'bg-bronze text-white hover:bg-bronze-dark'
                }`}
              >
                {isAddedToCart ? (
                  <>
                    <Check className="h-5 w-5" />
                    Sepete Eklendi
                  </>
                ) : (
                  'Sepete Ekle'
                )}
              </motion.button>

              {/* Secondary Button */}
              <button className="mt-3 w-full border border-bronze py-4 text-sm font-medium uppercase tracking-wider text-bronze transition-colors hover:bg-bronze hover:text-white">
                Hemen Satın Al
              </button>

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
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
