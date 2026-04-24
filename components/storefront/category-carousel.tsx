'use client'

import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from './product-card'

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
  colors: { name: string; hex: string }[]
  isNew?: boolean
  isBestseller?: boolean
}

interface CategoryCarouselProps {
  title: string
  products: Product[]
}

export function CategoryCarousel({ title, products }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const progressTrackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [thumbWidthPercent, setThumbWidthPercent] = useState(20)
  const [isDraggingTrack, setIsDraggingTrack] = useState(false)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      const maxScroll = Math.max(1, scrollWidth - clientWidth)
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
      setScrollProgress(scrollLeft / maxScroll)
      setThumbWidthPercent(Math.max(20, (clientWidth / scrollWidth) * 100))
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
      setTimeout(checkScroll, 300)
    }
  }

  const setScrollByProgress = (progress: number) => {
    if (!scrollRef.current) return
    const { scrollWidth, clientWidth } = scrollRef.current
    const maxScroll = Math.max(0, scrollWidth - clientWidth)
    scrollRef.current.scrollTo({
      left: maxScroll * Math.min(1, Math.max(0, progress)),
      behavior: 'smooth',
    })
  }

  const handleTrackClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!progressTrackRef.current) return
    const rect = progressTrackRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const progress = clickX / rect.width
    setScrollByProgress(progress)
  }

  const handleTrackDrag = (clientX: number) => {
    if (!progressTrackRef.current) return
    const rect = progressTrackRef.current.getBoundingClientRect()
    const progress = (clientX - rect.left) / rect.width
    setScrollByProgress(progress)
  }

  useEffect(() => {
    checkScroll()
    const handleResize = () => checkScroll()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [products.length])

  useEffect(() => {
    if (!isDraggingTrack) return

    const onMouseMove = (e: globalThis.MouseEvent) => {
      handleTrackDrag(e.clientX)
    }
    const onMouseUp = () => {
      setIsDraggingTrack(false)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [isDraggingTrack])

  if (products.length === 0) return null

  return (
    <section className="border-b border-bronze/10 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-xl text-bronze sm:text-2xl">
            Kategorinin En Çok Satanları
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`flex h-10 w-10 items-center justify-center rounded-sm border transition-colors ${
                canScrollLeft
                  ? 'border-bronze/30 text-bronze hover:bg-bronze hover:text-white'
                  : 'border-bronze/10 text-bronze/30 cursor-not-allowed'
              }`}
              aria-label="Önceki ürünler"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`flex h-10 w-10 items-center justify-center rounded-sm border transition-colors ${
                canScrollRight
                  ? 'border-bronze/30 text-bronze hover:bg-bronze hover:text-white'
                  : 'border-bronze/10 text-bronze/30 cursor-not-allowed'
              }`}
              aria-label="Sonraki ürünler"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Products Carousel */}
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="scrollbar-hide flex gap-4 overflow-x-auto pb-4 sm:gap-6"
            style={{ scrollSnapType: 'x proximity' }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-[45%] shrink-0 sm:w-[30%] md:w-[23%] lg:w-[18%]"
                style={{ scrollSnapAlign: index === products.length - 1 ? 'end' : 'start' }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          {/* Progress Bar */}
          <div
            ref={progressTrackRef}
            onClick={handleTrackClick}
            onMouseDown={(e) => {
              setIsDraggingTrack(true)
              handleTrackDrag(e.clientX)
            }}
            className="mt-4 h-1.5 w-full cursor-pointer rounded-full bg-bronze/10"
            role="slider"
            aria-label={`${title} kaydırma çubuğu`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(scrollProgress * 100)}
          >
            <div
              className="h-full rounded-full bg-bronze/40 transition-[width,margin] duration-200"
              style={{
                width: `${thumbWidthPercent}%`,
                marginLeft: `${scrollProgress * (100 - thumbWidthPercent)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
