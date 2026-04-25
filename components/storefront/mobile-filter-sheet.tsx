'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, ChevronUp, Flame } from 'lucide-react'
import { useState } from 'react'

interface Category {
  name: string
  subcategories: string[]
}

interface ColorOption {
  name: string
  hex: string
}

interface PriceRange {
  label: string
  min: number
  max: number
}

interface MobileFilterSheetProps {
  isOpen: boolean
  onClose: () => void
  categories: Record<string, Category>
  colorOptions: ColorOption[]
  priceRanges: PriceRange[]
  selectedCategories: string[]
  setSelectedCategories: (cats: string[]) => void
  selectedSubcategories: string[]
  setSelectedSubcategories: (subs: string[]) => void
  selectedColors: string[]
  setSelectedColors: (colors: string[]) => void
  selectedPriceRange: { min: number; max: number } | null
  setSelectedPriceRange: (range: { min: number; max: number } | null) => void
  customPriceMin: string
  setCustomPriceMin: (val: string) => void
  customPriceMax: string
  setCustomPriceMax: (val: string) => void
  activeFilter: 'yeni' | 'cok-satanlar' | null
  setActiveFilter: (filter: 'yeni' | 'cok-satanlar' | null) => void
  applyCustomPrice: () => void
  clearFilters: () => void
}

export function MobileFilterSheet({
  isOpen,
  onClose,
  categories,
  colorOptions,
  priceRanges,
  selectedCategories,
  setSelectedCategories,
  selectedSubcategories,
  setSelectedSubcategories,
  selectedColors,
  setSelectedColors,
  selectedPriceRange,
  setSelectedPriceRange,
  customPriceMin,
  setCustomPriceMin,
  customPriceMax,
  setCustomPriceMax,
  activeFilter,
  setActiveFilter,
  applyCustomPrice,
  clearFilters,
}: MobileFilterSheetProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(Object.keys(categories))
  const [showColors, setShowColors] = useState(true)
  const [showPrice, setShowPrice] = useState(true)

  const toggleCategory = (key: string) => {
    setExpandedCategories(prev =>
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    )
  }

  const handleCategoryChange = (key: string) => {
    if (selectedCategories.includes(key)) {
      setSelectedCategories(selectedCategories.filter(c => c !== key))
      const category = categories[key]
      setSelectedSubcategories(
        selectedSubcategories.filter(s => !category.subcategories.includes(s))
      )
    } else {
      setSelectedCategories([...selectedCategories, key])
    }
  }

  const handleSubcategoryChange = (sub: string) => {
    if (selectedSubcategories.includes(sub)) {
      setSelectedSubcategories(selectedSubcategories.filter(s => s !== sub))
    } else {
      setSelectedSubcategories([...selectedSubcategories, sub])
    }
  }

  const handleColorChange = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color))
    } else {
      setSelectedColors([...selectedColors, color])
    }
  }

  const handlePriceRangeChange = (range: PriceRange) => {
    if (selectedPriceRange?.min === range.min && selectedPriceRange?.max === range.max) {
      setSelectedPriceRange(null)
    } else {
      setSelectedPriceRange({ min: range.min, max: range.max })
    }
  }

  const toggleSpecialFilter = (filter: 'yeni' | 'cok-satanlar') => {
    setActiveFilter(activeFilter === filter ? null : filter)
  }

  const activeFilterCount = selectedCategories.length + selectedSubcategories.length + selectedColors.length + (selectedPriceRange ? 1 : 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 w-full max-w-sm overflow-y-auto bg-ivory shadow-xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-bronze/10 bg-ivory px-4 py-4">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-sm text-bronze"
              >
                <X className="h-5 w-5" />
                Kapat
              </button>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-rose"
                >
                  Temizle ({activeFilterCount})
                </button>
              )}
            </div>

            <div className="p-4">
              {/* Title */}
              <h2 className="mb-6 font-serif text-2xl text-bronze">TÜM ÜRÜNLER</h2>

              {/* Categories Section */}
              <div className="mb-6">
                <h3 className="mb-3 font-medium text-bronze">Kategoriler</h3>
                <div className="space-y-1">
                  {Object.entries(categories).map(([key, category]) => (
                    <div key={key}>
                      <button
                        onClick={() => toggleCategory(key)}
                        className="flex w-full items-center justify-between py-2.5 text-left text-bronze"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(key)}
                            onChange={() => handleCategoryChange(key)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 rounded-sm border-bronze/30 text-rose focus:ring-rose/50"
                          />
                          <span className="font-medium">{category.name}</span>
                        </span>
                        {expandedCategories.includes(key) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {expandedCategories.includes(key) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-1 pb-2 pl-6">
                              {category.subcategories.map((sub) => (
                                <label
                                  key={sub}
                                  className="flex cursor-pointer items-center gap-2 py-2 text-bronze/70"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedSubcategories.includes(sub)}
                                    onChange={() => handleSubcategoryChange(sub)}
                                    className="h-4 w-4 rounded-sm border-bronze/30 text-rose focus:ring-rose/50"
                                  />
                                  {sub}
                                </label>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                  
                  <div className="mt-3 rounded-lg border border-bronze/10 bg-white/70 p-3">
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-bronze/60">Öne Çıkanlar</p>
                    <label className="flex cursor-pointer items-center gap-2 py-2 text-bronze">
                      <input
                        type="checkbox"
                        checked={activeFilter === 'yeni'}
                        onChange={() => toggleSpecialFilter('yeni')}
                        className="h-4 w-4 rounded-sm border-bronze/30 text-rose focus:ring-rose/50"
                      />
                      🔥 Yeni Gelenler
                      <Flame className="h-4 w-4 text-orange-500" />
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 py-2 text-bronze">
                      <input
                        type="checkbox"
                        checked={activeFilter === 'cok-satanlar'}
                        onChange={() => toggleSpecialFilter('cok-satanlar')}
                        className="h-4 w-4 rounded-sm border-bronze/30 text-rose focus:ring-rose/50"
                      />
                      🔥 Çok Satanlar
                      <Flame className="h-4 w-4 text-orange-500" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="my-6 border-t border-bronze/10" />

              {/* Colors Section */}
              <div className="mb-6">
                <button
                  onClick={() => setShowColors(!showColors)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <h3 className="font-medium text-bronze">Renk</h3>
                  {showColors ? (
                    <ChevronUp className="h-4 w-4 text-bronze" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-bronze" />
                  )}
                </button>
                
                <AnimatePresence>
                  {showColors && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-1">
                        {colorOptions.map((color) => (
                          <label
                            key={color.name}
                            className="flex cursor-pointer items-center gap-3 py-2 text-bronze/70"
                          >
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={selectedColors.includes(color.name)}
                                onChange={() => handleColorChange(color.name)}
                                className="peer sr-only"
                              />
                              <div
                                className={`h-6 w-6 rounded-sm border-2 transition-all ${
                                  selectedColors.includes(color.name)
                                    ? 'border-bronze'
                                    : 'border-bronze/20'
                                }`}
                                style={{ backgroundColor: color.hex }}
                              />
                              {selectedColors.includes(color.name) && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <svg className="h-3 w-3 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            {color.name}
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider */}
              <div className="my-6 border-t border-bronze/10" />

              {/* Price Range Section */}
              <div className="mb-6">
                <button
                  onClick={() => setShowPrice(!showPrice)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <h3 className="font-medium text-bronze">Fiyat Aralığı</h3>
                  {showPrice ? (
                    <ChevronUp className="h-4 w-4 text-bronze" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-bronze" />
                  )}
                </button>
                
                <AnimatePresence>
                  {showPrice && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-3">
                        {/* Custom Price Range */}
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="İlk Fiyat"
                            value={customPriceMin}
                            onChange={(e) => setCustomPriceMin(e.target.value)}
                            className="w-full rounded-sm border border-bronze/20 bg-white px-3 py-2 text-sm text-bronze placeholder:text-bronze/40 focus:border-bronze focus:outline-none"
                          />
                          <input
                            type="number"
                            placeholder="Son Fiyat"
                            value={customPriceMax}
                            onChange={(e) => setCustomPriceMax(e.target.value)}
                            className="w-full rounded-sm border border-bronze/20 bg-white px-3 py-2 text-sm text-bronze placeholder:text-bronze/40 focus:border-bronze focus:outline-none"
                          />
                          <button
                            onClick={applyCustomPrice}
                            className="shrink-0 rounded-sm border border-bronze bg-bronze px-3 py-2 text-sm text-white"
                          >
                            Filtrele
                          </button>
                        </div>

                        {/* Preset Ranges */}
                        <div className="space-y-1">
                          {priceRanges.map((range) => (
                            <label
                              key={range.label}
                              className="flex cursor-pointer items-center gap-2 py-2 text-bronze/70"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPriceRange?.min === range.min && selectedPriceRange?.max === range.max}
                                onChange={() => handlePriceRangeChange(range)}
                                className="h-4 w-4 rounded-sm border-bronze/30 text-rose focus:ring-rose/50"
                              />
                              {range.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider */}
              <div className="my-6 border-t border-bronze/10" />

              {/* Account Links */}
              <div className="space-y-3 pb-8">
                <a href="/account" className="flex items-center gap-3 py-2 text-bronze">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Hesabım
                </a>
                <a href="/giris" className="flex items-center gap-3 py-2 text-bronze">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Üye Girişi / Üye Ol
                </a>
                <a href="/kolay-iade" className="flex items-center gap-3 py-2 text-bronze">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Kolay İade
                </a>
                <a href="/favorilerim" className="flex items-center gap-3 py-2 text-bronze">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Favorilerim
                </a>
              </div>
            </div>

            {/* Apply Button */}
            <div className="sticky bottom-0 border-t border-bronze/10 bg-ivory p-4">
              <button
                onClick={onClose}
                className="w-full rounded-sm bg-bronze py-3 text-center font-medium text-white transition-colors hover:bg-bronze-dark"
              >
                Ürünleri Göster
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
