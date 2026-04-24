'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/storefront/navbar'
import { Hero } from '@/components/storefront/hero'
import { CategoryGrid } from '@/components/storefront/category-grid'
import { CraftShowcase } from '@/components/storefront/craft-showcase'
import { Marquee } from '@/components/storefront/marquee'
import { Footer } from '@/components/storefront/footer'

export default function Home() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      <Navbar />
      <Hero />
      <CategoryGrid />
      <Marquee />
      <CraftShowcase />
      <Marquee />
      <Footer />
    </motion.main>
  )
}
