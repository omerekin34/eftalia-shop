import Link from 'next/link'
import { RefreshCw, ShieldCheck, CalendarClock, ClipboardCheck } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { getShopRefundPolicy } from '@/lib/shopify'

export default async function IadePage() {
  const refundPolicy = await getShopRefundPolicy().catch(() => null)
  const hasPolicy = Boolean(refundPolicy?.body)
  const normalizedTitle = (refundPolicy?.title || '').trim().toLowerCase()
  const policyTitle =
    !refundPolicy?.title || normalizedTitle === 'refund policy'
      ? 'İade ve Değişim Politikası'
      : refundPolicy.title

  return (
    <main className="min-h-screen bg-ivory">
      <Navbar />
      <section className="border-b border-bronze/10 bg-ivory-warm pt-28 sm:pt-32">
        <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.25em] text-bronze/70">DESTEK</p>
          <h1 className="mt-3 font-serif text-4xl text-bronze">İade ve Değişim</h1>
          <p className="mt-4 max-w-3xl text-sm text-bronze/75 sm:text-base">
            Bu sayfadaki bilgiler Shopify tarafındaki iade ve değişim politikanızdan otomatik olarak çekilir.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-bronze/15 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-2xl text-bronze-dark sm:text-3xl">{policyTitle}</h2>
            {refundPolicy?.url ? (
              <Link
                href={refundPolicy.url}
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
              dangerouslySetInnerHTML={{ __html: refundPolicy?.body || '' }}
            />
          ) : (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Shopify içinde henüz bir iade politikası metni bulunamadı. Admin panelinde{' '}
              <strong>Settings &gt; Policies &gt; Refund policy</strong> alanını doldurduğunuzda bu sayfa otomatik
              güncellenir.
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-bronze/10 bg-white p-5">
            <RefreshCw className="h-5 w-5 text-bronze" />
            <p className="mt-2 text-sm text-bronze/70">Başvurunuzu Shopify iade akışıyla başlatabilirsiniz.</p>
          </div>
          <div className="rounded-xl border border-bronze/10 bg-white p-5">
            <ClipboardCheck className="h-5 w-5 text-bronze" />
            <p className="mt-2 text-sm text-bronze/70">İnceleme sonrası iade/değişim sonucu tarafınıza bildirilir.</p>
          </div>
          <div className="rounded-xl border border-bronze/10 bg-white p-5">
            <CalendarClock className="h-5 w-5 text-bronze" />
            <p className="mt-2 text-sm text-bronze/70">Süreç durumunu hesabınız ve e-posta bildirimlerinden takip edebilirsiniz.</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-bronze/15 bg-ivory-warm p-5 text-sm text-bronze/75">
          <div className="mb-2 flex items-center gap-2 text-bronze">
            <ShieldCheck className="h-4 w-4" /> Güvenli süreç
          </div>
          İade sürecinde tüm bilgi akışı kayıt altındadır. İhtiyaç durumunda destek ekibimiz sürecin her adımında yanınızdadır.
        </div>
      </section>
      <Footer />
    </main>
  )
}
