'use client'

import { motion } from 'framer-motion'
import { Droplets, Sun, Wind, Sparkles } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'

const careTips = [
  {
    title: 'Günlük Temizlik',
    text: 'Deri yüzeyi yumuşak ve kuru bir bezle nazikçe silin. Kimyasal içeren temizleyicilerden kaçının.',
    icon: Sparkles,
  },
  {
    title: 'Nem ve Isı Dengesi',
    text: 'Doğrudan güneş ışığına ve yoğun neme uzun süre maruz bırakmayın.',
    icon: Sun,
  },
  {
    title: 'Saklama Koşulları',
    text: 'Kullanmadığınızda ürününüzü hava alan bir kılıfta, formunu koruyacak şekilde saklayın.',
    icon: Wind,
  },
  {
    title: 'Leke Yönetimi',
    text: 'Sıvı temasında ürünü bastırmadan tampon hareketle kurulayın ve doğal şekilde kurumaya bırakın.',
    icon: Droplets,
  },
]

export default function BakimRehberiPage() {
  return (
    <main className="min-h-screen bg-ivory">
      <Navbar />
      <section className="border-b border-bronze/10 bg-ivory-warm pt-32 sm:pt-36">
        <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.25em] text-bronze/70">DESTEK</p>
          <h1 className="mt-3 font-serif text-4xl text-bronze">Bakım Rehberi</h1>
          <p className="mt-4 max-w-3xl text-sm text-bronze/75 sm:text-base">
            Ürününüzün ilk günkü görünümünü uzun süre korumak için bakım önerilerimizi düzenli şekilde uygulamanızı öneririz.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {careTips.map((tip, idx) => (
            <motion.article
              key={tip.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="rounded-xl border border-bronze/10 bg-white p-5"
            >
              <tip.icon className="h-5 w-5 text-bronze" />
              <h2 className="mt-3 text-lg font-medium text-bronze-dark">{tip.title}</h2>
              <p className="mt-2 text-sm text-bronze/70">{tip.text}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-bronze/15 bg-ivory-warm p-5 text-sm text-bronze/75">
          Ekstra öneri: Sezon geçişlerinde ürününüzü tozdan arındırıp doğal deri bakım kremi ile ince bir katman halinde koruma sağlayabilirsiniz.
        </div>
      </section>
      <Footer />
    </main>
  )
}
