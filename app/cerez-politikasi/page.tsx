import Link from 'next/link'
import { Cookie, ShieldCheck } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { getShopPrivacyPolicy } from '@/lib/shopify'

export default async function CerezPolitikasiPage() {
  const privacyPolicy = await getShopPrivacyPolicy().catch(() => null)
  const hasPolicy = Boolean(privacyPolicy?.body)

  return (
    <main className="min-h-screen bg-ivory">
      <Navbar />
      <section className="border-b border-bronze/10 bg-ivory-warm pt-28 sm:pt-32">
        <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.25em] text-bronze/70">DESTEK</p>
          <h1 className="mt-3 font-serif text-4xl text-bronze">Çerez Politikası</h1>
          <p className="mt-4 max-w-3xl text-sm text-bronze/75 sm:text-base">
            Çerez kullanımına ilişkin bilgiler Shopify tarafındaki gizlilik politikanızdan otomatik olarak çekilir.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-bronze/15 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-2xl text-bronze-dark sm:text-3xl">Çerez Politikası</h2>
            {privacyPolicy?.url ? (
              <Link
                href={privacyPolicy.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg border border-bronze/15 bg-white/70 px-3 py-2 text-xs font-medium uppercase tracking-wide text-bronze/75 transition-colors hover:bg-white hover:text-bronze"
              >
                Shopify kaynağı
              </Link>
            ) : null}
          </div>

          {hasPolicy ? (
            <article
              className="prose prose-sm mt-6 max-w-none prose-headings:font-serif prose-headings:text-bronze-dark prose-p:text-bronze/80 prose-li:text-bronze/80 prose-strong:text-bronze-dark"
              dangerouslySetInnerHTML={{ __html: privacyPolicy?.body || '' }}
            />
          ) : (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Shopify içinde henüz bir gizlilik/çerez politikası metni bulunamadı. Admin panelinde{' '}
              <strong>Settings &gt; Policies &gt; Privacy policy</strong> alanını doldurduğunuzda bu sayfa otomatik
              güncellenir.
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-bronze/15 bg-white p-5">
            <div className="mb-2 flex items-center gap-2 text-bronze">
              <Cookie className="h-4 w-4" /> Çerez ve takip bilgisi
            </div>
            <p className="text-sm text-bronze/75">
              Çerez kullanımı, analitik araçlar ve benzer teknolojilere dair içerik Shopify metninden yönetilir.
            </p>
          </div>
          <div className="rounded-xl border border-bronze/15 bg-white p-5">
            <div className="mb-2 flex items-center gap-2 text-bronze">
              <ShieldCheck className="h-4 w-4" /> Güncel içerik
            </div>
            <p className="text-sm text-bronze/75">
              Politika güncellendiğinde bu sayfa otomatik yenilenir ve kullanıcılarınız en güncel metni görür.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
