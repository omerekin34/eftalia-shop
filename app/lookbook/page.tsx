'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'

const lookbookStories = [
  {
    title: 'Günlük Zarafet',
    description:
      'Gabardin kumaşın hafif ve nefes alan yapısı şehir temposuna uyum sağlar; çapraz ve omuz modelleriyle sabah toplantısından akşam buluşmasına kesintisiz geçiş.',
    tags: ['Gabardin Çanta', 'Nötr Tonlar', 'Günlük Stil'],
  },
  {
    title: 'Atölye İmzası',
    description:
      'Cüzdan ve kartlıklarda derinin sıcak dokusu; çantalarda gabardin kumaşın düzgün drape edişi ve dikiş çizgileriyle metal aksesuar dengesi. Eftalia karakterini oluşturan imza detaylar.',
    tags: ['Deri Aksesuar', 'Gabardin', 'El İşçiliği'],
  },
  {
    title: 'Akşam Seçkisi',
    description:
      'Gabardin gövde üzerinde minimal çizgiler; özel davet ve akşam kullanımına uygun güçlü silüet. Zarif deri küçük aksesuarlarla tamamlanan kombinler.',
    tags: ['Gabardin Çanta', 'Deri Detay', 'Özel Gün'],
  },
]

export default function LookbookPage() {
  return (
    <main className="min-h-screen bg-ivory">
      <Navbar />

      <section className="border-b border-bronze/10 bg-ivory-warm pt-28 sm:pt-32">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.25em] text-bronze/70">KOLEKSİYON</p>
          <h1 className="mt-3 font-serif text-4xl text-bronze sm:text-5xl">Lookbook</h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-bronze/75 sm:text-base">
            Lookbook; çantalarımızda kullandığımız gabardin kumaşın düşük silüet ve günlük konforunu, cüzdan ve kartlıklarda
            ise derinin zamansız hissini nasıl taşıdığınızı göstermek için hazırlandı. Kullanım bağlamı, stil önerisi ve
            tasarım dilini bir arada sunar—her parçayı kendi ritminizde nasıl konumlandıracağınızı netleştirir.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-5 lg:grid-cols-3">
          {lookbookStories.map((story, index) => (
            <motion.article
              key={story.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-xl border border-bronze/10 bg-white p-6"
            >
              <h2 className="font-serif text-2xl text-bronze-dark">{story.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-bronze/70">{story.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {story.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-bronze/20 bg-ivory-warm px-3 py-1 text-xs text-bronze/75"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
