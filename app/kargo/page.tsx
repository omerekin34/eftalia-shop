import Link from 'next/link'
import { PackageCheck, Truck } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { getShopShippingPolicy } from '@/lib/shopify'
import { mergeStorePolicyClaims } from '@/lib/policy-claims'
import { getShopPolicyClaimsFromMetafield } from '@/lib/shopify-admin'

export default async function KargoPage() {
  const storeClaims = mergeStorePolicyClaims(await getShopPolicyClaimsFromMetafield())
  const shippingPolicy = await getShopShippingPolicy().catch(() => null)
  const hasPolicy = Boolean(shippingPolicy?.body)
  const normalizedTitle = (shippingPolicy?.title || '').trim().toLowerCase()
  const policyTitle =
    !shippingPolicy?.title || normalizedTitle === 'shipping policy'
      ? 'Teslimat ve Kargo Politikası'
      : shippingPolicy.title

  return (
    <main className="min-h-screen bg-ivory">
      <Navbar />
      <section className="border-b border-bronze/10 bg-ivory-warm pt-32 sm:pt-36">
        <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.25em] text-bronze/70">DESTEK</p>
          <h1 className="mt-3 font-serif text-4xl text-bronze">Kargo Bilgilendirmesi</h1>
          <p className="mt-4 max-w-3xl text-sm text-bronze/75 sm:text-base">
            {storeClaims.shippingDispatchWindow} {storeClaims.shippingFinalCalculation}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-bronze/15 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-2xl text-bronze-dark sm:text-3xl">
              {policyTitle}
            </h2>
            {shippingPolicy?.url ? (
              <Link
                href={shippingPolicy.url}
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
              dangerouslySetInnerHTML={{ __html: shippingPolicy?.body || '' }}
            />
          ) : (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Shopify içinde henüz bir kargo politikası metni bulunamadı. Admin panelinde{' '}
              <strong>Settings &gt; Policies &gt; Shipping policy</strong> alanını doldurduğunuzda bu sayfa otomatik
              güncellenir.
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-bronze/15 bg-white p-5">
            <div className="mb-2 flex items-center gap-2 text-bronze">
              <Truck className="h-4 w-4" /> Canlı Shopify verisi
            </div>
            <p className="text-sm text-bronze/75">
              Kargo ve teslimat metni Shopify yönetim panelinde güncellendiğinde bu sayfaya otomatik yansır.
            </p>
          </div>
          <div className="rounded-xl border border-bronze/15 bg-white p-5">
            <div className="mb-2 flex items-center gap-2 text-bronze">
              <PackageCheck className="h-4 w-4" /> Sipariş takibi
            </div>
            <p className="text-sm text-bronze/75">
              {storeClaims.shippingDispatchWindow} Siparişiniz kargoya verildiğinde takip numarası paylaşılır.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
