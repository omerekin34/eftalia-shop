'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

const categories = [
  {
    title: 'Makyaj Çantaları',
    description: 'Günlük ihtiyaçlarınız için zarif tasarımlar',
    span: 'col-span-1 row-span-1 md:col-span-1 md:row-span-2',
    aspect: 'aspect-[3/4] md:aspect-auto',
    href: '/tum-urunler?kategori=makyaj-cantasi',
  },
  {
    title: 'El Çantaları',
    description: 'Modern kadın için zamansız silüetler',
    span: 'col-span-1 row-span-1 md:col-span-2 md:row-span-1',
    aspect: 'aspect-square md:aspect-[2/1]',
    href: '/tum-urunler?kategori=el-cantasi',
  },
  {
    title: 'Omuz Çantaları',
    description: 'Her an için çok yönlü tasarımlar',
    span: 'col-span-1 row-span-1',
    aspect: 'aspect-square',
    href: '/tum-urunler?kategori=omuz-cantasi',
  },
  {
    title: 'Spor Çantası',
    description: 'Aktif yaşam için güçlü tasarımlar',
    span: 'col-span-1 row-span-1',
    aspect: 'aspect-square',
    href: '/tum-urunler?kategori=spor-cantasi',
  },
]

export function CategoryGrid() {
  return (
    <section className="bg-background py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center sm:mb-16"
        >
          <span className="inline-block text-xs tracking-[0.4em] text-bronze-light">
            SEÇKİN KOLEKSİYONLAR
          </span>
          <h2 className="mt-4 font-serif text-3xl tracking-wide text-bronze sm:text-4xl lg:text-5xl">
            Zanaatımızı Keşfedin
          </h2>
          <div className="mx-auto mt-6 h-px w-16 bg-gold/50" />
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:gap-6">
          {categories.map((category, index) => (
            <Link href={category.href} key={category.title} className={category.span}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`group relative h-full cursor-pointer overflow-hidden bg-ivory-warm ${category.aspect}`}
              >
              {/* Background pattern - hand-drawn style */}
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-ivory via-ivory-warm to-ivory-dark" />
                
                {/* Sketch-style illustration */}
                <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 200 200">
                  <defs>
                    <pattern id={`pattern-${index}`} patternUnits="userSpaceOnUse" width="40" height="40">
                      <path 
                        d="M0 20 Q 10 15, 20 20 T 40 20" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="0.5" 
                        className="text-bronze"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#pattern-${index})`} />
                </svg>
                
                {/* Category-specific illustrations */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <CategoryIllustration index={index} />
                </div>
              </div>

              {/* Hover border effect */}
              <div className="absolute inset-0 border-2 border-transparent transition-colors duration-500 group-hover:border-rose/60" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                <div className="relative">
                  {/* Turkish title */}
                  <h3 className="font-serif text-2xl tracking-wide text-bronze transition-colors group-hover:text-bronze-dark lg:text-3xl">
                    {category.title}
                  </h3>
                  
                  {/* Description - shows on hover */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="mt-3 max-w-xs text-sm leading-relaxed text-bronze-light opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  >
                    {category.description}
                  </motion.p>

                  {/* Arrow */}
                  <div className="mt-4 flex items-center gap-2 text-bronze transition-colors group-hover:text-gold">
                    <span className="text-xs tracking-[0.15em]">KEŞFET</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              {/* Corner accents */}
              <div className="absolute left-3 top-3 h-6 w-6 border-l border-t border-bronze/20 transition-colors group-hover:border-gold/40" />
              <div className="absolute bottom-3 right-3 h-6 w-6 border-b border-r border-bronze/20 transition-colors group-hover:border-gold/40" />
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function CategoryIllustration({ index }: { index: number }) {
  const illustrations = [
    // Makeup bag illustration
    <svg key="makeup" className="h-32 w-32 text-bronze/25" viewBox="0 0 100 100">
      <path 
        d="M20 70 Q 20 30, 50 30 Q 80 30, 80 70 L 75 75 L 25 75 Z" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
      />
      <path d="M30 30 Q 30 20, 50 20 Q 70 20, 70 30" fill="none" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="50" cy="50" rx="15" ry="8" fill="none" stroke="currentColor" strokeWidth="0.8" />
    </svg>,
    // Handbag illustration
    <svg key="handbag" className="h-32 w-32 text-bronze/25" viewBox="0 0 100 100">
      <path 
        d="M25 45 L 25 80 L 75 80 L 75 45" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
      />
      <path d="M30 45 Q 50 35, 70 45" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M35 25 Q 35 15, 50 15 Q 65 15, 65 25 L 65 45" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M35 25 L 35 45" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="40" y="55" width="20" height="10" fill="none" stroke="currentColor" strokeWidth="0.8" />
    </svg>,
    // Shoulder bag illustration
    <svg key="shoulder" className="h-28 w-28 text-bronze/25" viewBox="0 0 100 100">
      <ellipse cx="50" cy="60" rx="30" ry="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M25 50 Q 25 20, 50 20 Q 75 20, 75 50" fill="none" stroke="currentColor" strokeWidth="1" />
      <line x1="50" y1="45" x2="50" y2="75" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="50" cy="60" r="8" fill="none" stroke="currentColor" strokeWidth="0.8" />
    </svg>,
    // Sports bag illustration
    <svg key="sports" className="h-28 w-28 text-bronze/25" viewBox="0 0 100 100">
      {/* Main bag body - duffle style */}
      <ellipse cx="50" cy="55" rx="35" ry="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Top opening */}
      <ellipse cx="50" cy="38" rx="20" ry="8" fill="none" stroke="currentColor" strokeWidth="1" />
      {/* Handles */}
      <path d="M30 38 Q 30 25, 50 25 Q 70 25, 70 38" fill="none" stroke="currentColor" strokeWidth="1.2" />
      {/* Side straps */}
      <line x1="20" y1="50" x2="15" y2="50" stroke="currentColor" strokeWidth="1" />
      <line x1="80" y1="50" x2="85" y2="50" stroke="currentColor" strokeWidth="1" />
      {/* Zipper detail */}
      <line x1="30" y1="55" x2="70" y2="55" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,2" />
      {/* Front pocket */}
      <rect x="40" y="60" width="20" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="0.8" />
    </svg>,
  ]
  
  return illustrations[index] || illustrations[0]
}
