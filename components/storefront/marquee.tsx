'use client'

import { motion } from 'framer-motion'

const marqueeItems = [
  'EL YAPIMI DERİ ÜRÜNLER',
  'EFTALIA CASE',
  'KÜRESEL LÜKS',
  'USTA ELLERİNDEN',
  'ZAMANSIZ ZARAFET',
]

export function Marquee() {
  return (
    <section className="overflow-hidden border-y border-bronze/20 bg-background py-6">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        <div className="flex animate-marquee">
          {/* Double the items for seamless loop */}
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <div
              key={index}
              className="flex shrink-0 items-center gap-8 px-4"
            >
              <span className="whitespace-nowrap font-serif text-sm tracking-[0.3em] text-bronze sm:text-base md:text-lg">
                {item}
              </span>
              <span className="text-gold">&#10022;</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
