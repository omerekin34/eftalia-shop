import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { ProductDetailClient } from '@/components/storefront/product-detail-client'
import { censorReviewerDisplayName, filterJudgeMePublishedReviews, getProduct } from '@/lib/shopify'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PageProps = {
  params: Promise<{ handle: string }>
  searchParams?: Promise<{ color?: string }>
}

function parseRating(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return 0
  const normalized = value.trim().replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function prettyMetafieldLabel(key: string) {
  const labelMap: Record<string, string> = {
    materyal: 'Materyal',
    i_c_astar: 'İç Astar',
    i_scilik: 'İşçilik',
  }
  return labelMap[String(key || '').toLocaleLowerCase('tr')] || key
}

function cleanShopifyProductId(productId: string) {
  const raw = String(productId || '').trim()
  if (!raw) return ''
  if (raw.includes('Product/')) return raw.split('Product/').pop() || ''
  const tail = raw.split('/').pop() || raw
  return /^\d+$/.test(tail) ? tail : raw.replace(/\D/g, '') || ''
}

async function fetchJudgeMeReviewsOnPage(cleanId: string) {
  if (!cleanId) return []

  const fetchUrl = `https://judge.me/api/v1/reviews?shop_domain=nwjti9-bw.myshopify.com&api_token=${process.env.JUDGEME_PRIVATE_TOKEN || process.env.JUDGEME_API_TOKEN}&external_id=${cleanId}`

  try {
    const response = await fetch(fetchUrl, { cache: 'no-store', next: { revalidate: 0 } })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      console.warn('[ProductPage][JudgeMe]', { status: response.status, keys: data && typeof data === 'object' ? Object.keys(data) : [] })
      return []
    }
    const rows = Array.isArray((data as { reviews?: unknown }).reviews) ? (data as { reviews: any[] }).reviews : []
    const published = filterJudgeMePublishedReviews(rows)
    return published.map((review: any) => ({
      id: review.id ?? review.review_id ?? '',
      reviewerName: censorReviewerDisplayName(
        String(review?.reviewer?.name ?? review?.reviewer_name ?? review?.name ?? 'Müşteri').trim()
      ),
      body: typeof review.body === 'string' ? review.body : '',
      title: String(review?.title ?? review?.review_title ?? '').trim(),
      rating: parseRating(review?.rating),
      createdAt: String(review?.created_at ?? review?.createdAt ?? ''),
    }))
  } catch (e) {
    console.warn('[ProductPage][JudgeMe][fetch-error]', e instanceof Error ? e.message : e)
    return []
  }
}

export default async function ProductByHandlePage({ params, searchParams }: PageProps) {
  const { handle } = await params
  const search = (await searchParams) || {}
  const product = await getProduct(handle)

  if (!product) {
    notFound()
  }

  const cleanId = cleanShopifyProductId(product.id)
  const pageJudgeReviews = await fetchJudgeMeReviewsOnPage(cleanId)

  const productSpecKeys = ['materyal', 'i_c_astar', 'i_scilik']
  const productSpecs = (product.metafields || []).filter(
    (field) => field?.value && productSpecKeys.includes(String(field.key || '').toLocaleLowerCase('tr'))
  )
  const fallbackReviews = Array.isArray(product.reviews) ? product.reviews : []
  const reviews =
    pageJudgeReviews.length > 0
      ? pageJudgeReviews.map((r) => ({
          id: r.id,
          reviewer: r.reviewerName,
          reviewerName: r.reviewerName,
          body: r.body,
          title: r.title,
          rating: r.rating,
          createdAt: r.createdAt,
        }))
      : fallbackReviews.map((r: any) => ({
          id: r.id,
          reviewer: censorReviewerDisplayName(String(r.reviewer || r.reviewerName || 'Müşteri').trim()),
          reviewerName: censorReviewerDisplayName(String(r.reviewerName || r.reviewer || 'Müşteri').trim()),
          body: r.body || '',
          title: r.title || '',
          rating: Number(r.rating || 0),
          createdAt: r.createdAt || '',
        }))
  const computedRatingFromReviews = reviews.length
    ? reviews.reduce((sum: number, review: any) => sum + Number(review?.rating || 0), 0) / reviews.length
    : 0
  const judgemeWidgetHtml = String(product?.judgemeWidget || '').trim()
  const fallbackRating = Number.parseFloat(String(product.reviewRating ?? '').replace(',', '.'))
  const reviewRating = computedRatingFromReviews > 0 ? computedRatingFromReviews : fallbackRating
  const reviewRatingCount = reviews.length > 0 ? reviews.length : Number(product.reviewRatingCount || 0)
  const hasValidRating = Number.isFinite(reviewRating) && reviewRating > 0
  const isRatingPending = !hasValidRating && reviewRatingCount > 0

  const formatReviewDate = (value: string) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const dayMs = 1000 * 60 * 60 * 24
    const days = Math.floor(diffMs / dayMs)

    if (days >= 0 && days <= 7) {
      if (days === 0) return 'Bugün'
      if (days === 1) return '1 gün önce'
      return `${days} gün önce`
    }

    return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pb-32 pt-32 sm:pt-36">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-bronze/60">
            <Link href="/" className="transition-colors hover:text-bronze">
              Ana Sayfa
            </Link>
            <span>/</span>
            <Link href="/tum-urunler" className="transition-colors hover:text-bronze">
              Ürünler
            </Link>
            <span>/</span>
            <span className="text-bronze">{product.name}</span>
          </nav>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProductDetailClient
            product={product}
            initialColor={typeof search.color === 'string' ? search.color : undefined}
            productSpecs={productSpecs.map((field) => ({
              key: field.key,
              label: prettyMetafieldLabel(field.key),
              value: field.value,
            }))}
          />

          <section className="mt-10 rounded-2xl border border-bronze/10 bg-gradient-to-b from-[#fffdf9] to-[#fffaf0] p-6 sm:p-7">
            <p className="text-xs uppercase tracking-[0.2em] text-bronze/70">Müşteri Değerlendirmeleri</p>

            <div className="mt-4 rounded-xl border border-bronze/15 bg-white/75 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-serif text-4xl text-bronze-dark">
                  {hasValidRating ? reviewRating.toFixed(1) : isRatingPending ? 'Yükleniyor' : '0.0'}
                </span>
                <span className="inline-flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const safeRating = hasValidRating ? reviewRating : 0
                    const isFull = safeRating >= star
                    const isHalf = safeRating >= star - 0.5 && safeRating < star
                    return (
                      <span
                        key={star}
                        className={`text-xl ${isFull ? 'text-[#D4AF37]' : isHalf ? 'text-[#E7C76A]' : 'text-bronze/25'}`}
                      >
                        ★
                      </span>
                    )
                  })}
                </span>
                <span className="text-bronze/35">•</span>
                <span className="text-sm text-bronze/70">{reviewRatingCount} Değerlendirme</span>
              </div>
              {isRatingPending ? (
                <p className="mt-2 text-xs uppercase tracking-[0.08em] text-bronze/60">
                  Puan bilgisi güncelleniyor...
                </p>
              ) : null}
            </div>

            {reviews.length > 0 ? (
              <div className="mt-5 space-y-3">
                {reviews.map((review: any) => {
                  const displayName = String(review.reviewerName || review.reviewer || 'Müşteri').trim()
                  const displayBody =
                    typeof review.body === 'string' && review.body.trim() ? review.body.trim() : 'Yorum metni bulunamadı.'
                  return (
                  <article
                    key={review.id || `${displayName}-${review.createdAt}`}
                    className="rounded-xl border border-bronze/15 bg-gradient-to-b from-[#fffdf9] to-[#faf6f0] p-4 shadow-sm sm:p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-bronze-dark">{review.title || 'Ürün Yorumu'}</h3>
                      <span className="text-xs text-bronze/55">{formatReviewDate(review.createdAt)}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-sm ${Number(review.rating || 0) >= star ? 'text-[#D4AF37]' : 'text-bronze/25'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 font-serif text-base font-semibold tracking-tight text-bronze-dark">{displayName}</p>
                    <p className="mt-3 whitespace-pre-wrap break-words border-t border-bronze/10 pt-3 text-sm leading-relaxed text-bronze/80">
                      {displayBody}
                    </p>
                  </article>
                  )
                })}
              </div>
            ) : judgemeWidgetHtml ? (
              <div className="mt-5 rounded-xl border border-bronze/10 bg-white/80 p-4 sm:p-5">
                <div
                  className="jdgm-widget-wrapper text-sm text-bronze/80"
                  dangerouslySetInnerHTML={{ __html: judgemeWidgetHtml }}
                />
              </div>
            ) : !hasValidRating && reviewRatingCount === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-bronze/20 bg-white/60 p-5 text-sm text-bronze/70">
                Henüz değerlendirilmedi - İlk yorumu sen yap.
              </div>
            ) : null}
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}
