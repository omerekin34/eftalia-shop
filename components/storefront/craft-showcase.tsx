'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const craftImages = [
  {
    title: 'Deri Örnekleri',
    description: 'Mükemmelliğe ulaşmış premium tam tahıl deri',
    handle: 'deri-ornekleri',
    href: '/tum-urunler?kategori=deri-ornekleri',
  },
  {
    title: 'Cüzdan ve Kartlıklar',
    description: 'Seçkin deri, şık ve fonksiyonel tasarımlar',
    handle: 'cuzdan-kartlik',
    href: '/tum-urunler?kategori=cuzdan-kartlik',
  },
  {
    title: 'Gabardin Kumaşları',
    description: 'Çantalarda nefes alan gabardin; dayanıklılık ve düzgün drapeler',
    handle: 'gabardin-kumaslari',
    href: '/tum-urunler?kategori=gabardin-kumaslari',
  },
  {
    title: 'Taraklar',
    description: 'En ince detaylara gösterilen özen',
    handle: 'taraklar',
    href: '/tum-urunler?kategori=taraklar',
  },
  {
    title: 'Aksesuarlar',
    description: 'Stili tamamlayan özel dokunuşlar',
    handle: 'aksesuarlar',
    href: '/tum-urunler?kategori=aksesuarlar',
  },
]

export function CraftShowcase() {
  const [imageMap, setImageMap] = useState<Record<string, { imageUrl: string | null; imageAlt: string }>>({})

  useEffect(() => {
    const loadCraftImages = async () => {
      try {
        const response = await fetch('/api/storefront/craft-images', { cache: 'no-store' })
        if (!response.ok) return
        const data = (await response.json()) as {
          craftImages?: Record<string, { imageUrl: string | null; imageAlt: string }>
        }
        setImageMap(data.craftImages || {})
      } catch {
        setImageMap({})
      }
    }
    loadCraftImages()
  }, [])

  return (
    <section className="overflow-hidden bg-ivory-warm py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-16 lg:mb-20"
        >
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-block text-xs tracking-[0.4em] text-bronze-light">
                DETAYIN SANATI
              </span>
              <h2 className="mt-4 font-serif text-3xl tracking-wide text-bronze sm:text-4xl lg:text-5xl text-balance">
                Zanaatımız, Hikayeniz
              </h2>
            </div>
            <p className="max-w-md text-base leading-relaxed text-bronze-light lg:text-right">
              Cüzdan ve kartlıklarda deri seçimi; çantalarda gabardin kumaşın dayanıklılığı ve drapesi ustalıkla bir araya gelir.
              Her parça adanmışlığın hikayesini taşır—küresel standartlar, usta eller.
            </p>
          </div>
        </motion.div>

        {/* Storyboard layout */}
        <div className="relative">
          {/* Main grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {craftImages.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`group relative ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
              >
                <div className={`relative overflow-hidden bg-ivory ${index === 0 ? 'aspect-square' : 'aspect-[4/5]'}`}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="absolute inset-0 z-20 rounded-[inherit]"
                      aria-label={`${item.title} koleksiyonunu görüntüle`}
                    />
                  ) : null}
                  {imageMap[item.handle]?.imageUrl ? (
                    <>
                      <Image
                        src={imageMap[item.handle].imageUrl as string}
                        alt={imageMap[item.handle].imageAlt || item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-black/10" />
                    </>
                  ) : null}

                  {/* Placeholder illustration */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      imageMap[item.handle]?.imageUrl
                        ? 'from-ivory/15 via-ivory-warm/20 to-ivory-dark/25'
                        : 'from-ivory via-ivory-warm to-ivory-dark'
                    }`}
                  >
                    {!imageMap[item.handle]?.imageUrl ? <CraftIllustration index={index} /> : null}
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-bronze/0 transition-colors duration-500 group-hover:bg-bronze/5" />
                  
                  {/* Label */}
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ivory/90 to-transparent p-4 lg:p-6">
                    <h3
                      className={`font-serif text-lg lg:text-xl ${
                        imageMap[item.handle]?.imageUrl ? 'text-white' : 'text-bronze'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={`mt-1 text-xs opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                        imageMap[item.handle]?.imageUrl ? 'text-ivory/90' : 'text-bronze-light'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                  
                  {/* Corner frame */}
                  <div className="pointer-events-none absolute left-3 top-3 h-8 w-8 border-l border-t border-bronze/20" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quote overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 flex justify-center lg:mt-16"
          >
            <div className="relative max-w-2xl px-8 py-6 text-center">
              <svg className="absolute -left-2 -top-2 h-8 w-8 text-gold/40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <blockquote className="font-serif text-xl italic leading-relaxed text-bronze sm:text-2xl lg:text-3xl">
                Detayın sanatı, küresel standartlar ve usta eller; zamana meydan okuyan parçalar yaratır.
              </blockquote>
              <svg className="absolute -bottom-2 -right-2 h-8 w-8 rotate-180 text-gold/40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function CraftIllustration({ index }: { index: number }) {
  const illustrations = [
    // Leather samples - large
    <svg key="leather" className="absolute inset-0 h-full w-full" viewBox="0 0 200 200">
      <defs>
        <pattern id="leather-grain" patternUnits="userSpaceOnUse" width="10" height="10">
          <circle cx="2" cy="2" r="0.5" className="fill-bronze/10" />
          <circle cx="7" cy="6" r="0.3" className="fill-bronze/8" />
        </pattern>
      </defs>
      <rect width="200" height="200" fill="url(#leather-grain)" />
      {/* Stacked leather swatches */}
      <g className="text-bronze/30">
        <rect x="30" y="40" width="100" height="60" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(-5, 80, 70)" />
        <rect x="50" y="70" width="100" height="60" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(3, 100, 100)" />
        <rect x="40" y="100" width="100" height="60" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(-2, 90, 130)" />
      </g>
      {/* Stitching detail */}
      <g className="text-gold/40">
        {[...Array(8)].map((_, i) => (
          <line key={i} x1={55 + i * 10} y1="85" x2={55 + i * 10} y2="90" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        ))}
      </g>
    </svg>,
    // Wallet and card holder
    <svg key="wallet" className="absolute inset-0 h-full w-full" viewBox="0 0 100 125">
      <g className="text-gold/40" transform="translate(50, 62)">
        {/* Main wallet body */}
        <rect x="-28" y="-20" width="56" height="40" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {/* Wallet flap */}
        <path d="M-28 -10 L28 -10" stroke="currentColor" strokeWidth="1" />
        {/* Card slots */}
        <rect x="-22" y="-5" width="18" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <rect x="-20" y="-3" width="18" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <rect x="-18" y="-1" width="18" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="0.8" />
        {/* Card holder separate */}
        <rect x="6" y="-2" width="16" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="9" y="2" width="10" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="0.6" />
        {/* Stitching detail */}
        <path d="M-25 16 L25 16" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
      </g>
      {/* Decorative circle */}
      <circle cx="50" cy="62" r="40" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-bronze/15" />
    </svg>,
    // Gabardin / fabric weave
    <svg key="fabric" className="absolute inset-0 h-full w-full" viewBox="0 0 100 125">
      <defs>
        <pattern id="gabardin-weave" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 6 L12 6" className="stroke-bronze/18" strokeWidth="0.8" />
          <path d="M6 0 L6 12" className="stroke-bronze/14" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100" height="125" fill="url(#gabardin-weave)" />
      <g className="text-bronze/25" opacity={0.9}>
        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3, 4].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={12 + col * 16}
              y={18 + row * 18}
              width="14"
              height="10"
              rx="1"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.35"
              opacity={0.35 + (row + col) * 0.04}
            />
          ))
        )}
      </g>
      <path
        d="M20 95 Q 50 78 80 95"
        fill="none"
        className="stroke-gold/35"
        strokeWidth="0.6"
      />
    </svg>,
    // Paddle brush / hair brush
    <svg key="brush" className="absolute inset-0 h-full w-full" viewBox="0 0 100 125">
      <g className="text-bronze/35" transform="translate(50, 55)">
        {/* Brush head - rounded rectangle */}
        <rect x="-22" y="-35" width="44" height="55" rx="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {/* Inner border */}
        <rect x="-18" y="-31" width="36" height="47" rx="9" fill="none" stroke="currentColor" strokeWidth="0.5" />
        {/* Bristle dots pattern */}
        {[...Array(5)].map((_, row) => (
          [...Array(4)].map((_, col) => (
            <circle 
              key={`${row}-${col}`} 
              cx={-12 + col * 8} 
              cy={-24 + row * 8} 
              r="2" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.8" 
            />
          ))
        ))}
        {/* Handle */}
        <rect x="-6" y="20" width="12" height="35" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {/* Handle detail line */}
        <line x1="0" y1="25" x2="0" y2="50" stroke="currentColor" strokeWidth="0.5" />
      </g>
      {/* Decorative elements */}
      <circle cx="50" cy="110" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold/30" />
    </svg>,
    // Shell motif
    <svg key="shell" className="absolute inset-0 h-full w-full" viewBox="0 0 100 125">
      <g className="text-rose/30" transform="translate(50, 65)">
        {/* Spiral shell */}
        <path 
          d="M0 0 Q 15 -25, 0 -40 Q -20 -25, 0 0" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
        />
        <path 
          d="M0 -5 Q 10 -22, 0 -32 Q -12 -20, 0 -5" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1"
        />
        <path 
          d="M0 -10 Q 6 -18, 0 -24 Q -7 -17, 0 -10" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="0.8"
        />
        {/* Ridges */}
        {[...Array(7)].map((_, i) => (
          <path 
            key={i}
            d={`M${-15 + i * 4} ${-35 + i * 3} Q ${-10 + i * 3} ${-20 + i * 2}, ${-5 + i * 2} 0`}
            fill="none" 
            stroke="currentColor" 
            strokeWidth="0.5"
          />
        ))}
      </g>
      {/* Sand dots */}
      <g className="text-bronze/15">
        <circle cx="25" cy="95" r="0.8" fill="currentColor" />
        <circle cx="40" cy="100" r="1" fill="currentColor" />
        <circle cx="55" cy="92" r="0.6" fill="currentColor" />
        <circle cx="70" cy="98" r="0.9" fill="currentColor" />
        <circle cx="35" cy="105" r="0.7" fill="currentColor" />
        <circle cx="60" cy="108" r="1.1" fill="currentColor" />
        <circle cx="75" cy="103" r="0.5" fill="currentColor" />
      </g>
    </svg>,
  ]
  
  return illustrations[index] || illustrations[0]
}
