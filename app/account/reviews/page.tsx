import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCustomerDetails } from '@/lib/shopify'
import {
  attachShopifyProductImagesToReviews,
  fetchJudgeMeReviewsByReviewerEmail,
} from '@/lib/judgeme-reviewer-reviews'
import { AccountReviewsList } from '@/components/storefront/account-reviews-list'
import { AccountSidebar } from '@/components/storefront/account-sidebar'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

export default async function AccountReviewsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    redirect('/giris')
  }

  const customer = await getCustomerDetails(token)
  if (!customer?.email) {
    redirect('/giris')
  }

  const rawReviews = await fetchJudgeMeReviewsByReviewerEmail(customer.email)
  const reviews = await attachShopifyProductImagesToReviews(rawReviews)
  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim()

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-2xl border border-[#9b7a57]/25 bg-[#fdf8f0] p-6 shadow-[0_20px_60px_-40px_rgba(83,58,39,0.45)]">
        <p className="text-xs uppercase tracking-[0.22em] text-[#8a6b4b]">Eftalia Deri Atölyesi</p>
        <h1 className="mt-2 font-serif text-3xl text-[#4d3523] sm:text-4xl">Merhaba {fullName || 'Değerli Üyemiz'}</h1>
        <p className="mt-2 text-sm text-[#7d5f45]">{customer.email}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
        <AccountSidebar />

        <div className="rounded-2xl border border-[#9b7a57]/25 bg-[#fffaf2] p-6 sm:p-8">
          <h2 className="font-serif text-2xl text-[#4d3523]">Değerlendirmelerim</h2>
          <p className="mt-1 text-sm text-[#7d5f45]">Ürün sayfalarında bıraktığınız yorumların özeti.</p>

          {reviews.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-[#9b7a57]/30 bg-[#fdf8f0]/80 p-8 text-center">
              <p className="text-sm leading-relaxed text-[#6d4f35]">
                Henüz bir değerlendirme yapmadınız. Siparişlerinize giderek ürünlerimizi değerlendirebilirsiniz.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  href="/account?tab=orders"
                  className="inline-flex rounded-lg bg-[#5B1F2A] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4a1822]"
                >
                  Siparişlerim
                </Link>
                <Link
                  href="/tum-urunler"
                  className="inline-flex rounded-lg border border-[#9b7a57]/35 bg-white px-5 py-2.5 text-sm font-medium text-[#6d4f35] transition-colors hover:bg-white/90"
                >
                  Ürünlere Göz At
                </Link>
              </div>
            </div>
          ) : (
            <AccountReviewsList
              reviews={reviews.map((r) => ({
                id: r.id,
                productTitle: r.productTitle,
                productHandle: r.productHandle,
                rating: r.rating,
                body: r.body,
                createdAt: r.createdAt,
                imageUrl: r.imageUrl,
              }))}
            />
          )}
        </div>
      </div>
    </section>
  )
}
