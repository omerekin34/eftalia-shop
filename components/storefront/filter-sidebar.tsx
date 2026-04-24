'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Flame } from 'lucide-react'

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

interface FilterSidebarProps {
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
  activeFilter: 'yeni' | 'cok-satanlar' | 'outlet' | null
  setActiveFilter: (filter: 'yeni' | 'cok-satanlar' | 'outlet' | null) => void
  applyCustomPrice: () => void
}

export function FilterSidebar({
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
}: FilterSidebarProps) {
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
      // Also remove subcategories of this category
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

  const toggleSpecialFilter = (filter: 'yeni' | 'cok-satanlar' | 'outlet') => {
    setActiveFilter(activeFilter === filter ? null : filter)
  }

  return (
    <div className="sticky top-24 space-y-6">
      {/* Categories Section */}
      <div>
        <h3 className="mb-4 font-serif text-lg text-bronze">Kategoriler</h3>
        <div className="space-y-2">
          {Object.entries(categories).map(([key, category]) => (
            <div key={key} className="border-b border-bronze/10 pb-2">
              <button
                onClick={() => toggleCategory(key)}
                className="flex w-full items-center justify-between py-2 text-left text-sm text-bronze transition-colors hover:text-bronze-dark"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(key)}
                    onChange={() => handleCategoryChange(key)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 rounded-sm border-bronze/30 text-rose focus:ring-rose/50"
                  />
                  {category.name}
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
                          className="flex cursor-pointer items-center gap-2 py-1 text-sm text-bronze/70 transition-colors hover:text-bronze"
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
          
          {/* Special Categories */}
          <div className="space-y-2 pt-2">
            <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-bronze transition-colors hover:text-bronze-dark">
              <input
                type="checkbox"
                checked={activeFilter === 'yeni'}
                onChange={() => toggleSpecialFilter('yeni')}
                className="h-4 w-4 rounded-sm border-bronze/30 text-rose focus:ring-rose/50"
              />
              Yeni Gelenler
              <Flame className="h-4 w-4 text-orange-500" />
            </label>
            <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-bronze transition-colors hover:text-bronze-dark">
              <input
                type="checkbox"
                checked={activeFilter === 'cok-satanlar'}
                onChange={() => toggleSpecialFilter('cok-satanlar')}
                className="h-4 w-4 rounded-sm border-bronze/30 text-rose focus:ring-rose/50"
              />
              Çok Satanlar
              <Flame className="h-4 w-4 text-orange-500" />
            </label>
          </div>
        </div>
      </div>

      {/* Colors Section */}
      <div className="border-t border-bronze/10 pt-6">
        <button
          onClick={() => setShowColors(!showColors)}
          className="flex w-full items-center justify-between text-left"
        >
          <h3 className="font-serif text-lg text-bronze">Renk</h3>
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
              <div className="mt-4 space-y-2">
                {colorOptions.map((color) => (
                  <label
                    key={color.name}
                    className="flex cursor-pointer items-center gap-3 py-1 text-sm text-bronze/70 transition-colors hover:text-bronze"
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedColors.includes(color.name)}
                        onChange={() => handleColorChange(color.name)}
                        className="peer sr-only"
                      />
                      <div
                        className={`h-5 w-5 rounded-full border-2 transition-all ${
                          selectedColors.includes(color.name)
                            ? 'border-bronze ring-2 ring-bronze/30'
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

      {/* Price Range Section */}
      <div className="border-t border-bronze/10 pt-6">
        <button
          onClick={() => setShowPrice(!showPrice)}
          className="flex w-full items-center justify-between text-left"
        >
          <h3 className="font-serif text-lg text-bronze">Fiyat Aralığı</h3>
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
              <div className="mt-4 space-y-3">
                {/* Custom Price Range */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="İlk Fiyat"
                    value={customPriceMin}
                    onChange={(e) => setCustomPriceMin(e.target.value)}
                    className="w-full rounded-sm border border-bronze/20 bg-white px-3 py-2 text-sm text-bronze placeholder:text-bronze/40 focus:border-bronze focus:outline-none focus:ring-1 focus:ring-bronze/20"
                  />
                  <input
                    type="number"
                    placeholder="Son Fiyat"
                    value={customPriceMax}
                    onChange={(e) => setCustomPriceMax(e.target.value)}
                    className="w-full rounded-sm border border-bronze/20 bg-white px-3 py-2 text-sm text-bronze placeholder:text-bronze/40 focus:border-bronze focus:outline-none focus:ring-1 focus:ring-bronze/20"
                  />
                  <button
                    onClick={applyCustomPrice}
                    className="shrink-0 rounded-sm border border-bronze bg-bronze px-3 py-2 text-sm text-white transition-colors hover:bg-bronze-dark"
                  >
                    Filtrele
                  </button>
                </div>

                {/* Preset Ranges */}
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <label
                      key={range.label}
                      className="flex cursor-pointer items-center gap-2 py-1 text-sm text-bronze/70 transition-colors hover:text-bronze"
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
    </div>
  )
}
