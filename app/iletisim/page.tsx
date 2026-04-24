'use client'

import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'

const contactCards = [
  {
    title: 'E-Posta',
    value: 'destek@betuieftelia.com',
    detail: '24 saat içinde dönüş sağlanır',
    icon: Mail,
  },
  {
    title: 'Telefon',
    value: '+90 (212) 000 00 00',
    detail: 'Hafta içi 09:00 - 18:00',
    icon: Phone,
  },
  {
    title: 'Atölye',
    value: 'İstanbul, Türkiye',
    detail: 'Randevu ile ziyaret edilebilir',
    icon: MapPin,
  },
]

const faqItems = [
  'Sipariş durumumu nasıl takip ederim?',
  'İade ve değişim süreci kaç gün sürer?',
  'Ürün bakım önerilerine nereden ulaşabilirim?',
]

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-ivory">
      <Navbar />

      <section className="border-b border-bronze/10 bg-ivory-warm pt-28 sm:pt-32">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs tracking-[0.25em] text-bronze/70"
          >
            DESTEK
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-3 font-serif text-3xl text-bronze sm:text-4xl"
          >
            İletişim
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-2xl text-sm leading-relaxed text-bronze/75 sm:text-base"
          >
            Sorularınız, sipariş talepleriniz ve iş birliği önerileriniz için bize ulaşabilirsiniz.
            Ekibimiz en kısa sürede size geri dönüş sağlar.
          </motion.p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contactCards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="rounded-xl border border-bronze/10 bg-white p-5"
            >
              <div className="mb-4 inline-flex rounded-full bg-ivory p-2.5">
                <card.icon className="h-5 w-5 text-bronze" strokeWidth={1.5} />
              </div>
              <h2 className="text-sm font-semibold tracking-wide text-bronze">{card.title}</h2>
              <p className="mt-2 text-lg font-medium text-bronze-dark">{card.value}</p>
              <p className="mt-2 text-sm text-bronze/65">{card.detail}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-bronze/10 bg-white p-6 sm:p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-bronze" strokeWidth={1.5} />
            <h3 className="font-serif text-2xl text-bronze">Bize Mesaj Bırakın</h3>
          </div>

          <form className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Ad Soyad"
                className="rounded-md border border-bronze/15 bg-ivory/40 px-4 py-3 text-sm text-bronze placeholder:text-bronze/50 focus:border-bronze/35 focus:outline-none"
              />
              <input
                type="email"
                placeholder="E-posta"
                className="rounded-md border border-bronze/15 bg-ivory/40 px-4 py-3 text-sm text-bronze placeholder:text-bronze/50 focus:border-bronze/35 focus:outline-none"
              />
            </div>
            <input
              type="text"
              placeholder="Konu"
              className="rounded-md border border-bronze/15 bg-ivory/40 px-4 py-3 text-sm text-bronze placeholder:text-bronze/50 focus:border-bronze/35 focus:outline-none"
            />
            <textarea
              placeholder="Mesajınızı buraya yazın..."
              rows={6}
              className="rounded-md border border-bronze/15 bg-ivory/40 px-4 py-3 text-sm text-bronze placeholder:text-bronze/50 focus:border-bronze/35 focus:outline-none"
            />
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-bronze px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-bronze-dark"
            >
              Mesajı Gönder
              <Send className="h-4 w-4" strokeWidth={1.7} />
            </button>
          </form>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="space-y-5"
        >
          <div className="rounded-2xl border border-bronze/10 bg-white p-6">
            <div className="mb-3 flex items-center gap-2 text-bronze">
              <Clock className="h-4 w-4" strokeWidth={1.7} />
              <h4 className="text-sm font-semibold tracking-wide">Çalışma Saatleri</h4>
            </div>
            <ul className="space-y-2 text-sm text-bronze/75">
              <li>Pazartesi - Cuma: 09:00 - 18:00</li>
              <li>Cumartesi: 10:00 - 14:00</li>
              <li>Pazar: Kapalı</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-bronze/10 bg-white p-6">
            <h4 className="mb-3 text-sm font-semibold tracking-wide text-bronze">Sık Sorulanlar</h4>
            <ul className="space-y-2 text-sm text-bronze/75">
              {faqItems.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>
        </motion.aside>
      </section>

      <Footer />
    </main>
  )
}
