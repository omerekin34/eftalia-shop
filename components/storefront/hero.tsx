'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background paper-texture">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        {/* Top left ornament */}
        <svg 
          className="absolute left-4 top-24 h-24 w-24 text-bronze/10 sm:left-12 sm:h-32 sm:w-32" 
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <path d="M50 2 L50 98 M2 50 L98 50" stroke="currentColor" strokeWidth="0.3" />
        </svg>
        
        {/* Bottom right ornament */}
        <svg 
          className="absolute bottom-24 right-4 h-20 w-20 text-bronze/10 sm:right-12 sm:h-28 sm:w-28" 
          viewBox="0 0 100 100"
        >
          <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="0.3" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-6"
            >
              <span className="inline-block border-b border-bronze/30 pb-1 text-xs tracking-[0.4em] text-bronze-light">
                ZANAAT KOLEKSİYONU 2026
              </span>
            </motion.div>

            <h1 className="font-serif text-4xl leading-tight tracking-wide text-bronze sm:text-5xl md:text-6xl lg:text-7xl text-balance">
              {"B'ETUI EFTELIA:"}
              <br />
              <span className="italic text-gold">{'"'}Her Detayda</span>
              <br />
              Zarafet{'"'}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mx-auto mt-6 max-w-md text-base leading-relaxed text-bronze-light sm:text-lg lg:mx-0 lg:mt-8"
            >
              Detayın sanatını keşfedin. El yapımı deri ürünlerde küresel standartlar, geleneğin çağdaş zarafetle buluştuğu yer.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start"
            >
              <Link
                href="/tum-urunler"
                className="group relative overflow-hidden border border-bronze px-8 py-3 transition-all duration-300 hover:border-rose hover:bg-rose sm:px-10 sm:py-4"
              >
                <span className="relative z-10 flex items-center gap-2 text-sm tracking-[0.2em] text-bronze transition-colors group-hover:text-bronze-dark">
                  KOLEKSİYONU KEŞFET
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                </span>
              </Link>
              <Link
                href="/lookbook"
                className="text-sm tracking-[0.15em] text-bronze-light underline underline-offset-4 transition-colors hover:text-gold"
              >
                LOOKBOOK İNCELE
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Image - Logo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-ivory-warm">
              {/* Background texture */}
              <div className="absolute inset-0 bg-gradient-to-br from-ivory via-ivory-warm to-ivory-dark" />
              
              {/* Logo Image */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <Image
                  src="/images/logo.jpg"
                  alt="B'ETUI EFTELIA - Her Detayda Zarafet"
                  width={500}
                  height={600}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              
              {/* Corner frames */}
              <div className="absolute left-4 top-4 h-12 w-12 border-l border-t border-bronze/30" />
              <div className="absolute bottom-4 right-4 h-12 w-12 border-b border-r border-bronze/30" />
            </div>
            
            {/* Image caption */}
            <div className="mt-4 flex items-center justify-between text-xs tracking-wider text-bronze-light">
              <span>2026&apos;DAN BERİ</span>
              <span className="h-px flex-1 mx-4 bg-bronze/20" />
              <span>USTA ELLERİNDEN</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.3em] text-bronze-light">KAYDIR</span>
          <div className="h-8 w-px bg-gradient-to-b from-bronze/40 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  )
}
