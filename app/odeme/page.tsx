'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CreditCard, Lock, ShieldCheck, Truck } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { useCart } from '@/components/storefront/cart-context'

export default function OdemePage() {
  const { items, totalItems } = useCart()

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 99.9
  const total = subtotal + shipping

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pb-20 pt-28 sm:pt-32">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <nav className="flex items-center gap-2 text-sm text-bronze/60">
              <Link href="/" className="transition-colors hover:text-bronze">
                Ana Sayfa
              </Link>
              <span>/</span>
              <Link href="/hesabim/sepetim" className="transition-colors hover:text-bronze">
                Sepetim
              </Link>
              <span>/</span>
              <span className="text-bronze">Ödeme</span>
            </nav>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border border-bronze/15 bg-white p-6 shadow-sm sm:p-8"
            >
              <h1 className="font-serif text-3xl text-bronze-dark sm:text-4xl">Ödemeyi Tamamla</h1>
              <p className="mt-2 text-sm text-bronze/65">
                Teslimat, fatura ve ödeme bilgilerini girerek siparişini güvenle tamamla.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <input className="rounded-lg border border-bronze/20 px-4 py-3 text-sm focus:border-bronze/40 focus:outline-none sm:col-span-2" placeholder="Ad Soyad" />
                <input className="rounded-lg border border-bronze/20 px-4 py-3 text-sm focus:border-bronze/40 focus:outline-none" placeholder="Telefon" />
                <input className="rounded-lg border border-bronze/20 px-4 py-3 text-sm focus:border-bronze/40 focus:outline-none" placeholder="E-posta" />
                <input className="rounded-lg border border-bronze/20 px-4 py-3 text-sm focus:border-bronze/40 focus:outline-none sm:col-span-2" placeholder="Adres" />
                <input className="rounded-lg border border-bronze/20 px-4 py-3 text-sm focus:border-bronze/40 focus:outline-none" placeholder="İl" />
                <input className="rounded-lg border border-bronze/20 px-4 py-3 text-sm focus:border-bronze/40 focus:outline-none" placeholder="İlçe" />
              </div>

              <div className="mt-8 rounded-xl border border-bronze/15 bg-ivory-warm p-4">
                <div className="mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-bronze" />
                  <p className="text-sm font-medium text-bronze-dark">Kart Bilgileri</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="rounded-md border border-bronze/20 px-3 py-2.5 text-sm focus:border-bronze/40 focus:outline-none sm:col-span-2" placeholder="Kart Üzerindeki İsim" />
                  <input className="rounded-md border border-bronze/20 px-3 py-2.5 text-sm focus:border-bronze/40 focus:outline-none sm:col-span-2" placeholder="Kart Numarası" />
                  <input className="rounded-md border border-bronze/20 px-3 py-2.5 text-sm focus:border-bronze/40 focus:outline-none" placeholder="AA/YY" />
                  <input className="rounded-md border border-bronze/20 px-3 py-2.5 text-sm focus:border-bronze/40 focus:outline-none" placeholder="CVV" />
                </div>
              </div>

              <button className="mt-6 w-full rounded-lg bg-bronze px-5 py-3.5 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-bronze-dark">
                Siparişi Tamamla
              </button>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.06 }}
              className="h-fit rounded-2xl border border-bronze/15 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-medium text-bronze-dark">Sipariş Özeti</h2>
              <p className="mt-1 text-xs text-bronze/55">{totalItems} ürün</p>

              <div className="mt-4 space-y-3">
                {items.length > 0 ? (
                  items.map((item) => (
                    <div key={`${item.id}-${item.color || 'renksiz'}`} className="flex gap-3 rounded-lg border border-bronze/10 bg-ivory-warm p-3">
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-bronze/15 bg-white">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-bronze-dark">{item.name}</p>
                        <p className="text-xs text-bronze/60">Adet: {item.quantity}</p>
                        <p className="text-xs text-bronze/70">
                          {(item.price * item.quantity).toLocaleString('tr-TR')} TL
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg border border-bronze/15 bg-ivory-warm p-3 text-sm text-bronze/70">
                    Sepetinizde ürün bulunmuyor.
                  </p>
                )}
              </div>

              <div className="mt-5 space-y-2 border-t border-bronze/10 pt-4 text-sm">
                <div className="flex items-center justify-between text-bronze/70">
                  <span>Ara Toplam</span>
                  <span>{subtotal.toLocaleString('tr-TR')} TL</span>
                </div>
                <div className="flex items-center justify-between text-bronze/70">
                  <span>Kargo</span>
                  <span>{shipping === 0 ? 'Ücretsiz' : `${shipping.toLocaleString('tr-TR')} TL`}</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-base font-semibold text-bronze-dark">
                  <span>Genel Toplam</span>
                  <span>{total.toLocaleString('tr-TR')} TL</span>
                </div>
              </div>

              <div className="mt-5 space-y-2 rounded-lg border border-bronze/10 bg-ivory-warm p-3 text-xs text-bronze/70">
                <p className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" /> 256-bit güvenli ödeme altyapısı</p>
                <p className="flex items-center gap-2"><Truck className="h-3.5 w-3.5" /> Hızlı kargo ve canlı takip</p>
                <p className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" /> 14 gün kolay iade</p>
              </div>
            </motion.aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
