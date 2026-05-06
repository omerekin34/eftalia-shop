'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/storefront/navbar'
import { Hero } from '@/components/storefront/hero'
import { CategoryGrid } from '@/components/storefront/category-grid'
import { CraftShowcase } from '@/components/storefront/craft-showcase'
import { Marquee } from '@/components/storefront/marquee'
import { Footer } from '@/components/storefront/footer'
import { ProductCard } from '@/components/storefront/product-card'
import { UgcVideoShowcase } from '@/components/storefront/ugc-video-showcase'
import { SocialFeedShowcase, type SocialFeedPost } from '@/components/storefront/social-feed-showcase'
import { getProducts } from '@/lib/shopify/getProducts'

interface HomeProduct {
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
  inStock?: boolean
}

interface UgcVideo {
  id: string
  title: string
  subtitle?: string
  videoUrl: string
  thumbnailUrl?: string
  productHandle?: string
  ctaText?: string
}

export default function Home() {
  const [products, setProducts] = useState<HomeProduct[]>([])
  const [ugcVideos, setUgcVideos] = useState<UgcVideo[]>([])
  const [socialPosts, setSocialPosts] = useState<SocialFeedPost[]>([])
  const [socialInstagram, setSocialInstagram] = useState('')
  const [socialTiktok, setSocialTiktok] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true)
        const shopifyProducts = await getProducts(24)
        const inStockProducts = shopifyProducts.filter((item) => item.inStock !== false)

        // Makyaj çantasını vitrinde önceliklendir.
        const makeup = inStockProducts.find(
          (item) =>
            (item.slug || '').includes('makyaj-cantasi') ||
            (item.name || '').toLocaleLowerCase('tr').includes('makyaj çanta')
        )
        const rest = inStockProducts.filter((item) => item.id !== makeup?.id)
        const showcase = makeup ? [makeup, ...rest].slice(0, 8) : inStockProducts.slice(0, 8)

        setProducts(showcase as HomeProduct[])
      } catch {
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }
    loadProducts()
  }, [])

  useEffect(() => {
    const loadUgcVideos = async () => {
      try {
        const response = await fetch('/api/storefront/ugc-videos', { cache: 'no-store' })
        if (!response.ok) return
        const data = (await response.json()) as { videos?: UgcVideo[] }
        setUgcVideos(Array.isArray(data.videos) ? data.videos : [])
      } catch {
        setUgcVideos([])
      }
    }
    loadUgcVideos()
  }, [])

  useEffect(() => {
    const loadSocialFeed = async () => {
      try {
        const response = await fetch('/api/storefront/social-feed', { cache: 'no-store' })
        if (!response.ok) return
        const data = (await response.json()) as {
          posts?: SocialFeedPost[]
          instagramUrl?: string
          tiktokUrl?: string
        }
        setSocialPosts(Array.isArray(data.posts) ? data.posts : [])
        setSocialInstagram(String(data.instagramUrl || ''))
        setSocialTiktok(String(data.tiktokUrl || ''))
      } catch {
        setSocialPosts([])
      }
    }
    loadSocialFeed()
  }, [])

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      <Navbar />
      <Hero />
      <section className="border-b border-bronze/10 py-10 sm:py-14">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="mt-2 font-serif text-2xl text-bronze sm:text-3xl">
                Eftalia Seçkisi
              </h2>
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-bronze/60">Ürünler yükleniyor...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-bronze/60">Ürün bulunamadı.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
      <CategoryGrid />
      <Marquee />
      <CraftShowcase />
      <Marquee />
      <UgcVideoShowcase items={ugcVideos} />
      <SocialFeedShowcase
        instagramUrl={socialInstagram}
        tiktokUrl={socialTiktok}
        posts={socialPosts}
      />
      <Footer />
    </motion.main>
  )
}
