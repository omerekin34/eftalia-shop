'use client'

import { motion } from 'framer-motion'
import { PackageCheck, Truck, Clock3, MapPin } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'

const steps = [
  { title: 'Sipariş Onayı', text: 'Siparişiniz onaylandıktan sonra hazırlık süreci başlar.' },
  { title: 'Paketleme', text: 'Ürünleriniz atölyede özenle paketlenir ve kargoya hazırlanır.' },
  { title: 'Kargoya Teslim', text: '1-3 iş günü içinde anlaşmalı kargo firmasına teslim edilir.' },
  { title: 'Teslimat', text: 'Bölgenize bağlı olarak 1-4 iş günü içinde teslim edilir.' },
]

export default function KargoPage() {
  return (
    <main className="min-h-screen bg-ivory">
      <Navbar />
      <section className="border-b border-bronze/10 bg-ivory-warm pt-28 sm:pt-32">
        <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.25em] text-bronze/70">DESTEK</p>
          <h1 className="mt-3 font-serif text-4xl text-bronze">Kargo Bilgilendirmesi</h1>
          <p className="mt-4 max-w-3xl text-sm text-bronze/75 sm:text-base">
            Siparişlerinizin hazırlık, sevkiyat ve teslimat süreçlerini şeffaf şekilde takip edebilmeniz için tüm adımları burada topladık.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((step, idx) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="rounded-xl border border-bronze/10 bg-white p-5"
            >
              <h2 className="text-lg font-medium text-bronze-dark">{step.title}</h2>
              <p className="mt-2 text-sm text-bronze/70">{step.text}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-bronze/10 bg-white p-5"><Truck className="h-5 w-5 text-bronze" /><p className="mt-2 text-sm text-bronze/70">1500 TL ve üzeri siparişlerde kargo ücretsizdir.</p></div>
          <div className="rounded-xl border border-bronze/10 bg-white p-5"><Clock3 className="h-5 w-5 text-bronze" /><p className="mt-2 text-sm text-bronze/70">Yoğun dönemlerde hazırlık süresi +1 iş günü uzayabilir.</p></div>
          <div className="rounded-xl border border-bronze/10 bg-white p-5"><MapPin className="h-5 w-5 text-bronze" /><p className="mt-2 text-sm text-bronze/70">Teslimat sonrası kargo hasarı varsa aynı gün bildirim yapınız.</p></div>
        </div>

        <div className="mt-6 rounded-xl border border-bronze/15 bg-ivory-warm p-5 text-sm text-bronze/75">
          <div className="mb-2 flex items-center gap-2 text-bronze"><PackageCheck className="h-4 w-4" /> Sipariş Takibi</div>
          Kargo takip numaranız siparişiniz kargoya verildiğinde SMS ve e-posta ile paylaşılır.
        </div>
      </section>
      <Footer />
    </main>
  )
}
