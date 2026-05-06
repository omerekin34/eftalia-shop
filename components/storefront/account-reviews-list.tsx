'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Trash2 } from 'lucide-react'

export type AccountReviewRow = {
  id: string | number
  productTitle: string
  productHandle: string
  rating: number
  body: string
  createdAt: string
  imageUrl: string | null
}

function formatReviewDate(value: string) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function AccountReviewsList({ reviews: initialReviews }: { reviews: AccountReviewRow[] }) {
  const router = useRouter()
  const [reviews, setReviews] = useState(initialReviews)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setReviews(initialReviews)
  }, [initialReviews])

  const handleRemove = async (reviewId: string) => {
    setError('')
    setPendingId(reviewId)
    try {
      const res = await fetch(`/api/account/reviews/${encodeURIComponent(reviewId)}`, { method: 'DELETE' })
      const data = (await res.json().catch(() => ({}))) as { error?: string; mode?: string }
      if (!res.ok) {
        throw new Error(data?.error || 'Yorum kaldırılamadı.')
      }
      setReviews((prev) => prev.filter((r) => String(r.id) !== reviewId))
      setError('')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Yorum kaldırılamadı.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="mt-8">
      {error ? (
        <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-800">{error}</p>
      ) : null}
      <ul className="space-y-4">
        {reviews.map((review) => {
          const rid = String(review.id)
          const busy = pendingId === rid
          return (
            <li
              key={rid}
              className="rounded-xl border border-[#9b7a57]/20 bg-gradient-to-b from-[#fffdf9] to-[#faf6f0] p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex shrink-0 items-center justify-center sm:block">
                  {review.imageUrl ? (
                    <img
                      src={review.imageUrl}
                      alt=""
                      className="h-20 w-20 rounded-lg border border-[#9b7a57]/20 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-[#9b7a57]/25 bg-white/60 text-xs text-[#8a6b4b]">
                      Görsel yok
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      {review.productHandle ? (
                        <Link
                          href={`/product/${review.productHandle}`}
                          className="font-serif text-lg font-semibold text-[#4d3523] transition-colors hover:text-[#5B1F2A]"
                        >
                          {review.productTitle}
                        </Link>
                      ) : (
                        <p className="font-serif text-lg font-semibold text-[#4d3523]">{review.productTitle}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {review.productHandle ? (
                        <Link
                          href={`/product/${review.productHandle}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#caa980]/45 bg-gradient-to-br from-[#fff7ea] via-[#fff1de] to-[#f8e8cb] px-3 py-1.5 text-xs font-semibold tracking-[0.08em] text-[#5B1F2A]"
                        >
                          Ürüne Git
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        title="Judge.me: mümkünse tamamen siler; aksi halde yayından kaldırır (spam). Sayfa yenilenince listede görünmez."
                        disabled={busy}
                        onClick={() => handleRemove(rid)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-rose-200/80 bg-white/90 px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {busy ? 'Kaldırılıyor…' : 'Kaldır'}
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-base ${
                            review.rating >= star ? 'text-[#D4AF37]' : 'text-[#c4b5a8]/40'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </span>
                    <span className="text-[#c4b5a8]">•</span>
                    <span className="text-xs text-[#8a6b4b]">{formatReviewDate(review.createdAt)}</span>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#5c4330]">
                    {review.body?.trim() || '—'}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
