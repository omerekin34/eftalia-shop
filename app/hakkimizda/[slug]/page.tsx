'use client'

import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'

type AboutContent = {
  eyebrow: string
  title: string
  intro: string
  pillars: string[]
  details: { title: string; text: string }[]
  closing: string
}

const aboutContent: Record<string, AboutContent> = {
  hikayemiz: {
    eyebrow: 'Hakkımızda',
    title: 'Hikayemiz',
    intro:
      'B&E, zarafeti günlük hayatın doğal bir parçasına dönüştürme fikriyle doğdu. İlk günden bu yana amacımız, sade ama güçlü bir karakter taşıyan ürünler üretmek oldu.',
    pillars: ['Zamansız tasarım', 'Ustalık odaklı üretim', 'Güven veren kalite'],
    details: [
      {
        title: 'Başlangıç Noktamız',
        text: 'Markanın temelinde, hızlı tüketim yerine uzun yıllar kullanılabilecek parçalar üretme fikri yer alır. Her ürün, ihtiyaçtan doğan bir işlevi estetik bir dille sunar.',
      },
      {
        title: 'Tasarım Felsefemiz',
        text: 'Duru çizgiler, dengeli oranlar ve gereksiz detaylardan arındırılmış bir yaklaşım benimsiyoruz. Böylece ürünlerimiz trendlerden bağımsız bir kimlik kazanır.',
      },
      {
        title: 'Bugün ve Gelecek',
        text: 'Bugün B&E, ürün kalitesini ve müşteri deneyimini birlikte geliştiren bir marka olarak büyümeyi sürdürür. Gelecekte de aynı özen ve netlikle üretmeye devam edeceğiz.',
      },
    ],
    closing:
      'Hikayemiz, her koleksiyonda yeniden şekillense de özünde değişmeyen değerlerle ilerler: kalite, sadelik ve güven.',
  },
  zanaatimiz: {
    eyebrow: 'Atölye',
    title: 'Zanaatımız',
    intro:
      'Zanaat anlayışımız, hız yerine hassasiyet üzerine kurulur. Her ürünün üretim süreci, malzeme seçimiyle başlar ve son kalite kontrol adımıyla tamamlanır.',
    pillars: ['Usta işçilik', 'Çok adımlı kalite kontrol', 'Detay odaklı son dokunuş'],
    details: [
      {
        title: 'Kesim ve Form',
        text: 'Deri parçaları, ürün formunu koruyacak şekilde ölçülendirilir ve kesilir. Bu adım ürünün hem estetiğini hem de dayanıklılığını doğrudan etkiler.',
      },
      {
        title: 'Dikiş Disiplini',
        text: 'Dikiş aralıkları, taşıma yükü ve kullanım senaryoları gözetilerek belirlenir. Kritik bölgelerde ekstra güçlendirme uygulanır.',
      },
      {
        title: 'Son Kontrol',
        text: 'Ürünler paketlenmeden önce yüzey kalitesi, aksesuar uyumu, fermuar akışı ve iç düzen bölmeleri tek tek kontrol edilir.',
      },
    ],
    closing:
      'Bizim için zanaat, yalnızca üretim tekniği değil; ürünü kullanıcıya saygıyla teslim etmenin bir biçimidir.',
  },
  malzemeler: {
    eyebrow: 'Kalite',
    title: 'Malzemeler',
    intro:
      'Malzeme kalitesi, ürünün ilk günkü görünümünü ve yıllar içindeki performansını belirler. Bu nedenle seçim sürecimizde estetik kadar dayanıklılığı da esas alıyoruz.',
    pillars: ['Seçici tedarik', 'Dayanıklılık testleri', 'Uzun ömür odaklı yapı'],
    details: [
      {
        title: 'Deri Seçimi',
        text: 'Yüzey dokusu, esneme davranışı ve yaş alma karakteri dengeli olan derileri tercih ediyoruz. Böylece ürünler kullanıldıkça karakter kazanır.',
      },
      {
        title: 'Astar ve İç Bölmeler',
        text: 'İç astar malzemeleri, sürtünmeye ve günlük kullanım yoğunluğuna karşı test edilerek seçilir. İç bölmeler kullanım ergonomisini artıracak şekilde planlanır.',
      },
      {
        title: 'Metal Aksesuarlar',
        text: 'Toka, halka ve fermuar gibi bileşenlerde dayanıklılığı kanıtlanmış parçalar kullanırız. Renk uyumu ve kaplama kalitesi son aşamada doğrulanır.',
      },
    ],
    closing:
      'Doğru malzeme, yalnızca güzel görünmek için değil; her gün güvenle kullanılmak için seçilir.',
  },
  surdurulebilirlik: {
    eyebrow: 'Sorumluluk',
    title: 'Sürdürülebilirlik',
    intro:
      'Sürdürülebilirlik yaklaşımımız, daha az ama daha iyi üretme fikrine dayanır. Uzun ömürlü ürün, çevresel etkiyi azaltmanın en güçlü yollarından biridir.',
    pillars: ['Uzun ömürlü tasarım', 'Sorumlu kaynak kullanımı', 'Atık azaltma yaklaşımı'],
    details: [
      {
        title: 'Bilinçli Üretim Planı',
        text: 'Koleksiyonları gerçek ihtiyaçlar doğrultusunda planlayarak gereksiz üretimi azaltıyoruz. Bu sayede stok ve kaynak yönetimini daha verimli hale getiriyoruz.',
      },
      {
        title: 'Onarım ve Uzun Kullanım',
        text: 'Ürün ömrünü uzatmak için bakım ve kullanım önerileri paylaşıyoruz. Amacımız tek sezonluk değil, yıllarca kullanılabilecek parçalar sunmak.',
      },
      {
        title: 'Süreç İyileştirmesi',
        text: 'Paketleme, sevkiyat ve üretim süreçlerinde daha az atık ve daha yüksek verim için düzenli iyileştirmeler yapıyoruz.',
      },
    ],
    closing:
      'Sürdürülebilirlik bizim için bir kampanya değil; her ürün kararında tekrar edilen bir üretim prensibidir.',
  },
}

export default function AboutDetailPage() {
  const params = useParams()
  const slug = String(params.slug || '')
  const content = aboutContent[slug]

  if (!content) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-20 pt-28 sm:pt-32">
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/hakkimizda"
              className="inline-flex items-center gap-2 text-sm text-bronze/70 transition-colors hover:text-bronze"
            >
              <ArrowLeft className="h-4 w-4" />
              Hakkımızda sayfasına dön
            </Link>
          </div>

          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-bronze/15 bg-white p-6 shadow-sm sm:p-8"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-bronze/55">{content.eyebrow}</p>
            <h1 className="mt-3 font-serif text-4xl text-bronze-dark sm:text-5xl">{content.title}</h1>
            <p className="mt-4 text-sm leading-relaxed text-bronze/70 sm:text-base">{content.intro}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {content.pillars.map((pillar) => (
                <div key={pillar} className="rounded-xl border border-bronze/15 bg-ivory-warm p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-bronze" />
                    <p className="text-sm text-bronze-dark">{pillar}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-5">
              {content.details.map((detail) => (
                <div key={detail.title} className="rounded-xl border border-bronze/10 bg-ivory-warm p-5">
                  <h2 className="text-xl font-medium text-bronze-dark">{detail.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-bronze/70 sm:text-base">{detail.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-bronze/15 bg-bronze px-5 py-4">
              <p className="text-sm leading-relaxed text-white/95 sm:text-base">{content.closing}</p>
            </div>
          </motion.article>
        </section>
      </main>
      <Footer />
    </div>
  )
}
