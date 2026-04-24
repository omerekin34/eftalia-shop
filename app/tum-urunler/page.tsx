'use client'

import { Suspense } from 'react';
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { ProductCard } from '@/components/storefront/product-card'
import { FilterSidebar } from '@/components/storefront/filter-sidebar'
import { MobileFilterSheet } from '@/components/storefront/mobile-filter-sheet'
import { CategoryCarousel } from '@/components/storefront/category-carousel'
import { getProducts } from '@/lib/shopify/getProducts'


// Product data structure for Shopify integration later
export interface Product {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  discount?: number
  images: string[]
  category: string
  subcategory: string
  colors: { name: string; hex: string }[]
  tags?: string[]
  collections?: Array<{ id: string; title: string; handle: string }>
  isNew?: boolean
  isBestseller?: boolean
  inStock?: boolean
}

// Categories structure
const categories = {
  'canta': {
    name: 'Çanta',
    subcategories: [
      'Süet Çanta',
      'Omuz Çantası',
      'Çapraz Çanta',
      'Baget Çanta',
      'El Çantası',
      'Makyaj Çantası',
      'Laptop Çantası',
      'Spor Çantası',
    ]
  },
  'cuzdan-kartlik': {
    name: 'Cüzdan ve Kartlıklar',
    subcategories: [
      'Kadın Cüzdan',
      'Erkek Cüzdan',
      'Kartlık',
      'Pasaportluk',
      'Telefon Cüzdanı',
    ]
  },
  'tarak': {
    name: 'Tarak',
    subcategories: [
      'Ahşap Tarak',
      'Kemik Tarak',
      'Cep Tarağı',
      'Saç Fırçası',
    ]
  }
}

// Color options
const colorOptions = [
  { name: 'Krem', hex: '#F5F5DC' },
  { name: 'Siyah', hex: '#1a1a1a' },
  { name: 'Antrasit', hex: '#383838' },
  { name: 'Vizon', hex: '#8B7355' },
  { name: 'Bej', hex: '#D4C4A8' },
  { name: 'Kahve', hex: '#5C4033' },
  { name: 'Pudra', hex: '#E8D5D5' },
  { name: 'Mint', hex: '#98D4BB' },
  { name: 'Taba', hex: '#A67B5B' },
]

// Price ranges
const priceRanges = [
  { label: '₺0 - ₺500', min: 0, max: 500 },
  { label: '₺500 - ₺1.000', min: 500, max: 1000 },
  { label: '₺1.000 - ₺2.000', min: 1000, max: 2000 },
  { label: '₺2.000 üzeri', min: 2000, max: Infinity },
]

// Sort options
const sortOptions = [
  { value: 'newest', label: 'En Yeniler' },
  { value: 'price-asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price-desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'bestseller', label: 'Çok Satanlar' },
  { value: 'discount', label: 'İndirim Oranı' },
]

const normalizeForSearch = (value: string) =>
  (value || '')
    .toLocaleLowerCase('tr')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/û/g, 'u')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const matchesFilterToken = (filterToken: string, product: Product) => {
  const normalizedToken = normalizeForSearch(filterToken)
  if (!normalizedToken) return false

  const normalizedCollections = (product.collections || []).flatMap((collection) => [
    normalizeForSearch(collection.title || ''),
    normalizeForSearch(collection.handle || ''),
  ])
  const normalizedTags = (product.tags || []).map((tag) => normalizeForSearch(tag || ''))

  const inCollections = normalizedCollections.includes(normalizedToken)
  const inTags = normalizedTags.includes(normalizedToken)

  // Backward compatibility with legacy local subcategory/category mapping.
  const inLegacyFields = [
    normalizeForSearch(product.subcategory || ''),
    normalizeForSearch(product.category || ''),
  ].includes(normalizedToken)

  return inCollections || inTags || inLegacyFields
}

const safeDecodeURIComponent = (value: string) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

 function ProductsContent() {
  const searchParams = useSearchParams()
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [selectedSort, setSelectedSort] = useState('newest')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number } | null>(null)
  const [customPriceMin, setCustomPriceMin] = useState('')
  const [customPriceMax, setCustomPriceMax] = useState('')
  const [activeFilter, setActiveFilter] = useState<'yeni' | 'cok-satanlar' | 'outlet' | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoadingProducts(true)
        setProductsError(null)
        const shopifyProducts = await getProducts(48)
        setProducts(shopifyProducts)
      } catch (error) {
        setProductsError(
          error instanceof Error ? error.message : 'Ürünler yüklenirken bir hata oluştu.'
        )
      } finally {
        setIsLoadingProducts(false)
      }
    }

    loadProducts()
  }, [])

  // Read URL parameters and apply filters
  useEffect(() => {
    const filtre = searchParams.get('filtre')
    const kategori = searchParams.get('kategori')

    // Reset URL-driven filters first so menu navigations don't keep stale ticks
    setActiveFilter(null)
    setSelectedCategories([])
    setSelectedSubcategories([])
    
    if (filtre === 'yeni') {
      setActiveFilter('yeni')
      setSelectedSort('newest')
    } else if (filtre === 'cok-satanlar') {
      setActiveFilter('cok-satanlar')
      setSelectedSort('bestseller')
    } else if (filtre === 'outlet') {
      setActiveFilter('outlet')
      setSelectedSort('discount')
    }

    // Handle category from URL
    if (kategori) {
      const categoryMap: Record<string, string> = {
        'suet-canta': 'Süet Çanta',
        'omuz-cantasi': 'Omuz Çantası',
        'capraz-canta': 'Çapraz Çanta',
        'baget-canta': 'Baget Çanta',
        'el-cantasi': 'El Çantası',
        'makyaj-cantasi': 'Makyaj Çantası',
        'laptop-cantasi': 'Laptop Çantası',
        'spor-cantasi': 'Spor Çantası',
        'kadin-cuzdan': 'Kadın Cüzdan',
        'erkek-cuzdan': 'Erkek Cüzdan',
        'kartlik': 'Kartlık',
        'pasaportluk': 'Pasaportluk',
        'telefon-cuzdani': 'Telefon Cüzdanı',
        'ahsap-tarak': 'Ahşap Tarak',
        'kemik-tarak': 'Kemik Tarak',
        'cep-taragi': 'Cep Tarağı',
        'sac-fircasi': 'Saç Fırçası',
        'cuzdan-kartlik': 'cuzdan-kartlik',
      }
      const decodedKategori = safeDecodeURIComponent(kategori)
      const normalizedKategori = normalizeForSearch(decodedKategori)

      if (normalizedKategori === 'cuzdan-kartlik') {
        setSelectedCategories(['cuzdan-kartlik'])
      } else {
        const matchedSubcategory = Object.entries(categoryMap).find(([key, value]) => {
          const normalizedKey = normalizeForSearch(key)
          const normalizedValue = normalizeForSearch(value)
          return (
            normalizedKey === normalizedKategori ||
            normalizedValue === normalizedKategori
          )
        })?.[1]

        if (matchedSubcategory) {
          setSelectedSubcategories([matchedSubcategory])
        }
      }
    }
  }, [searchParams])

  // Get bestsellers for carousel
  const bestsellers = products.filter(
    (p) => p.inStock && (p.isBestseller || (p.discount && p.discount >= 50))
  )

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let productsToFilter = products.filter((p) => p.inStock)

    // Filter by URL-based active filter
    if (activeFilter === 'yeni') {
      productsToFilter = productsToFilter.filter(p => p.isNew === true)
    } else if (activeFilter === 'cok-satanlar') {
      productsToFilter = productsToFilter.filter(p => p.isBestseller === true)
    } else if (activeFilter === 'outlet') {
      productsToFilter = productsToFilter.filter(p => p.discount && p.discount >= 50)
    }

    // Filter by category
    if (selectedCategories.length > 0) {
      const normalizedSelectedCategories = selectedCategories.map(normalizeForSearch)
      productsToFilter = productsToFilter.filter((p) =>
        normalizedSelectedCategories.includes(normalizeForSearch(p.category || ''))
      )
    }

    // Filter by subcategory
    if (selectedSubcategories.length > 0) {
      productsToFilter = productsToFilter.filter((p) =>
        selectedSubcategories.some((selected) => matchesFilterToken(selected, p))
      )
    }

    // Filter by color
    if (selectedColors.length > 0) {
      const normalizedSelectedColors = selectedColors.map(normalizeForSearch)
      productsToFilter = productsToFilter.filter((p) =>
        p.colors.some((c) =>
          normalizedSelectedColors.includes(normalizeForSearch(c.name || ''))
        )
      )
    }

    // Filter by price range
    if (selectedPriceRange) {
      productsToFilter = productsToFilter.filter(p => 
        p.price >= selectedPriceRange.min && p.price <= selectedPriceRange.max
      )
    }

    // Sort
    switch (selectedSort) {
      case 'price-asc':
        productsToFilter.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        productsToFilter.sort((a, b) => b.price - a.price)
        break
      case 'bestseller':
        productsToFilter.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0))
        break
      case 'discount':
        productsToFilter.sort((a, b) => (b.discount || 0) - (a.discount || 0))
        break
      case 'newest':
      default:
        productsToFilter.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
    }

    return productsToFilter
  }, [activeFilter, products, selectedCategories, selectedSubcategories, selectedColors, selectedPriceRange, selectedSort])

  const clearFilters = () => {
    setActiveFilter(null)
    setSelectedCategories([])
    setSelectedSubcategories([])
    setSelectedColors([])
    setSelectedPriceRange(null)
    setCustomPriceMin('')
    setCustomPriceMax('')
  }

  const applyCustomPrice = () => {
    const min = parseFloat(customPriceMin) || 0
    const max = parseFloat(customPriceMax) || Infinity
    setSelectedPriceRange({ min, max })
  }

  const hasActiveFilters = selectedCategories.length > 0 || selectedSubcategories.length > 0 || selectedColors.length > 0 || selectedPriceRange !== null

  return (
    <main className="min-h-screen bg-ivory">
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="border-b border-bronze/10 bg-ivory/80 pt-24">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-bronze/60">
            <a href="/" className="transition-colors hover:text-bronze">Anasayfa</a>
            <span>/</span>
            <span className="text-bronze">
              {activeFilter === 'yeni' ? 'Yeni Gelenler' : 
               activeFilter === 'cok-satanlar' ? 'Çok Satanlar' : 
               activeFilter === 'outlet' ? 'Outlet' : 'Tüm Ürünler'}
            </span>
          </nav>
        </div>
      </div>

      {/* Bestsellers Carousel */}
      <CategoryCarousel 
        title="Çok Satanlar" 
        products={bestsellers} 
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl text-bronze sm:text-3xl">
              {activeFilter === 'yeni' ? 'Yeni Gelenler' : 
               activeFilter === 'cok-satanlar' ? 'Çok Satanlar' : 
               activeFilter === 'outlet' ? 'Outlet' : 'Tüm Ürünler'}
            </h1>
            <p className="mt-1 text-sm text-bronze/60">{filteredProducts.length} ürün bulundu</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex items-center gap-2 rounded-sm border border-bronze/20 bg-white px-4 py-2 text-sm text-bronze transition-colors hover:border-bronze/40 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtrele
              {hasActiveFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose text-xs text-white">
                  {selectedCategories.length + selectedSubcategories.length + selectedColors.length + (selectedPriceRange ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 rounded-sm border border-bronze/20 bg-white px-4 py-2 text-sm text-bronze transition-colors hover:border-bronze/40"
              >
                Sırala: {sortOptions.find(o => o.value === selectedSort)?.label}
                {sortOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full z-20 mt-1 w-56 rounded-sm border border-bronze/20 bg-white py-1 shadow-lg"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedSort(option.value)
                          setSortOpen(false)
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-ivory ${
                          selectedSort === option.value ? 'text-rose' : 'text-bronze'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-bronze/60">Aktif Filtreler:</span>
            {selectedCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategories(prev => prev.filter(c => c !== cat))}
                className="flex items-center gap-1 rounded-full bg-bronze/10 px-3 py-1 text-sm text-bronze"
              >
                {categories[cat as keyof typeof categories]?.name}
                <X className="h-3 w-3" />
              </button>
            ))}
            {selectedSubcategories.map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategories(prev => prev.filter(s => s !== sub))}
                className="flex items-center gap-1 rounded-full bg-bronze/10 px-3 py-1 text-sm text-bronze"
              >
                {sub}
                <X className="h-3 w-3" />
              </button>
            ))}
            {selectedColors.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColors(prev => prev.filter(c => c !== color))}
                className="flex items-center gap-1 rounded-full bg-bronze/10 px-3 py-1 text-sm text-bronze"
              >
                {color}
                <X className="h-3 w-3" />
              </button>
            ))}
            {selectedPriceRange && (
              <button
                onClick={() => setSelectedPriceRange(null)}
                className="flex items-center gap-1 rounded-full bg-bronze/10 px-3 py-1 text-sm text-bronze"
              >
                ₺{selectedPriceRange.min} - ₺{selectedPriceRange.max === Infinity ? '∞' : selectedPriceRange.max}
                <X className="h-3 w-3" />
              </button>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-rose underline underline-offset-2"
            >
              Tümünü Temizle
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <FilterSidebar
              categories={categories}
              colorOptions={colorOptions}
              priceRanges={priceRanges}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedSubcategories={selectedSubcategories}
              setSelectedSubcategories={setSelectedSubcategories}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              selectedPriceRange={selectedPriceRange}
              setSelectedPriceRange={setSelectedPriceRange}
              customPriceMin={customPriceMin}
              setCustomPriceMin={setCustomPriceMin}
              customPriceMax={customPriceMax}
              setCustomPriceMax={setCustomPriceMax}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              applyCustomPrice={applyCustomPrice}
            />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoadingProducts ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-lg text-bronze/60">Shopify ürünleri yükleniyor...</p>
              </div>
            ) : productsError ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-lg text-bronze/60">{productsError}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-lg text-bronze/60">Aradığınız kriterlere uygun ürün bulunamadı.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-rose underline underline-offset-2"
                >
                  Filtreleri Temizle
                </button>
              </div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <MobileFilterSheet
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        categories={categories}
        colorOptions={colorOptions}
        priceRanges={priceRanges}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        selectedSubcategories={selectedSubcategories}
        setSelectedSubcategories={setSelectedSubcategories}
        selectedColors={selectedColors}
        setSelectedColors={setSelectedColors}
        selectedPriceRange={selectedPriceRange}
        setSelectedPriceRange={setSelectedPriceRange}
        customPriceMin={customPriceMin}
        setCustomPriceMin={setCustomPriceMin}
        customPriceMax={customPriceMax}
        setCustomPriceMax={setCustomPriceMax}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        applyCustomPrice={applyCustomPrice}
        clearFilters={clearFilters}
      />

      <Footer />
      
    </main>
  )
}
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Ürünler Yükleniyor...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
