'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'

const aboutPages = [
  {
    title: 'Hikayemiz',
    href: '/hakkimizda/hikayemiz',
    description:
      'Eftalia’nın doğuşu, deri ve gabardinle harmanlanan ürün felsefemiz ve büyüme yolculuğumuz.',
  },
  {
    title: 'Zanaatımız',
    href: '/hakkimizda/zanaatimiz',
    description: 'Deri ve gabardinde kesim, dikiş ve kalite kontrol: atölye disiplinimiz ve ustalık anlayışımız.',
  },
  {
    title: 'Malzemeler',
    href: '/hakkimizda/malzemeler',
    description:
      'Deri cüzdan ve kartlıklar, gabardin çantalar ve metal aksesuarlar: seçim kriterlerimiz ve kalite anlayışımız.',
  },
  {
    title: 'Sürdürülebilirlik',
    href: '/hakkimizda/surdurulebilirlik',
    description:
      'Uzun ömürlü deri ve gabardin, planlı üretim ve daha az ambalaj: somut yaklaşımımız ve ilkelerimiz.',
  },
]

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-20 pt-28 sm:pt-32">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-bronze/15 bg-white p-6 shadow-sm sm:p-8"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-bronze/55">Hakkımızda</p>
            <h1 className="mt-3 font-serif text-4xl text-bronze-dark sm:text-5xl">
              Eftalia dünyası
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-bronze/70 sm:text-base">
              Her parça, zamansız estetik ve güçlü işlev arasında denge kuracak şekilde tasarlanır.
              Bu bölümde markamızın ruhunu oluşturan temel başlıkları yakından inceleyebilirsiniz.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {aboutPages.map((page) => (
                <Link
                  key={page.title}
                  href={page.href}
                  className="group rounded-xl border border-bronze/15 bg-ivory-warm p-5 transition-all hover:border-bronze/30 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium text-bronze-dark">{page.title}</h2>
                    <ChevronRight className="h-5 w-5 text-bronze/45 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-bronze/70">{page.description}</p>
                </Link>
              ))}
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
