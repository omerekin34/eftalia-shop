'use client'

import { motion } from 'framer-motion'
import { RefreshCw, ShieldCheck, CalendarClock, ClipboardCheck } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'

const returnRules = [
  'Teslim tarihinden itibaren 14 gün içinde iade/değişim başvurusu yapılabilir.',
  'Ürün kullanılmamış, etiketi ve ambalajı korunmuş olmalıdır.',
  'Kişiselleştirilmiş ürünlerde iade kapsamı ürün durumuna göre değerlendirilir.',
  'İade onayı sonrası ücret iadesi 3-7 iş günü içinde tamamlanır.',
]

export default function IadePage() {
  return (
    <main className="min-h-screen bg-ivory">
      <Navbar />
      <section className="border-b border-bronze/10 bg-ivory-warm pt-28 sm:pt-32">
        <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.25em] text-bronze/70">DESTEK</p>
          <h1 className="mt-3 font-serif text-4xl text-bronze">İade ve Değişim</h1>
          <p className="mt-4 max-w-3xl text-sm text-bronze/75 sm:text-base">
            Memnuniyetiniz önceliğimizdir. İade ve değişim sürecini hızlı ve şeffaf şekilde yönetebilmeniz için tüm bilgileri tek sayfada topladık.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {returnRules.map((rule, idx) => (
            <motion.div
              key={rule}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="rounded-xl border border-bronze/10 bg-white p-5 text-sm text-bronze/75"
            >
              {rule}
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-bronze/10 bg-white p-5"><RefreshCw className="h-5 w-5 text-bronze" /><p className="mt-2 text-sm text-bronze/70">Başvuru oluşturun ve talep numaranızı saklayın.</p></div>
          <div className="rounded-xl border border-bronze/10 bg-white p-5"><ClipboardCheck className="h-5 w-5 text-bronze" /><p className="mt-2 text-sm text-bronze/70">Kontrol sonrası iade/değişim sonucu size bildirilir.</p></div>
          <div className="rounded-xl border border-bronze/10 bg-white p-5"><CalendarClock className="h-5 w-5 text-bronze" /><p className="mt-2 text-sm text-bronze/70">Süreç durumunu hesabınızdaki iade taleplerinden takip edebilirsiniz.</p></div>
        </div>

        <div className="mt-6 rounded-xl border border-bronze/15 bg-ivory-warm p-5 text-sm text-bronze/75">
          <div className="mb-2 flex items-center gap-2 text-bronze"><ShieldCheck className="h-4 w-4" /> Güvenli Süreç</div>
          İade sürecinde tüm bilgi akışı kayıt altındadır. İhtiyaç durumunda destek ekibimiz sürecin her adımında yanınızdadır.
        </div>
      </section>
      <Footer />
    </main>
  )
}
