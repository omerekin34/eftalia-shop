'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

type UgcVideoItem = {
  id: string
  title: string
  subtitle?: string
  videoUrl: string
  thumbnailUrl?: string
  productHandle?: string
  ctaText?: string
}

function getYoutubeEmbedUrl(url: string) {
  const raw = String(url || '').trim()
  if (!raw) return ''
  if (raw.includes('youtube.com/watch')) {
    try {
      const parsed = new URL(raw)
      const id = parsed.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : ''
    } catch {
      return ''
    }
  }
  if (raw.includes('youtu.be/')) {
    const id = raw.split('youtu.be/')[1]?.split('?')[0]
    return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : ''
  }
  return ''
}

function getTiktokEmbedUrl(url: string) {
  const raw = String(url || '').trim()
  if (!raw || !raw.includes('tiktok.com')) return ''
  const match = raw.match(/\/video\/(\d+)/)
  const id = match?.[1]
  return id ? `https://www.tiktok.com/embed/v2/${id}` : ''
}

function getInstagramEmbedUrl(url: string) {
  const raw = String(url || '').trim()
  if (!raw || !raw.includes('instagram.com')) return ''
  const reelMatch = raw.match(/instagram\.com\/reel\/([^/?#]+)/)
  if (reelMatch?.[1]) return `https://www.instagram.com/reel/${reelMatch[1]}/embed`
  const postMatch = raw.match(/instagram\.com\/p\/([^/?#]+)/)
  if (postMatch?.[1]) return `https://www.instagram.com/p/${postMatch[1]}/embed`
  return ''
}

export function UgcVideoShowcase({ items }: { items: UgcVideoItem[] }) {
  if (!items.length) return null

  return (
    <section className="border-b border-bronze/10 bg-[#f8f6f1] py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-7 text-center">
          <p className="text-xs uppercase tracking-[0.26em] text-bronze/55">#gerçekkullanıcıdeneyimleri</p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-rose/25 bg-rose/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7B1E2B]">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#c41e3a]" />
            Canlı Trend Videolar
          </div>
          <h2 className="mt-3 font-serif text-2xl text-bronze sm:text-3xl">Gerçek Kullanıcı Deneyimleri</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 8).map((item) => {
            const ctaHref = item.productHandle ? `/product/${item.productHandle}` : '/tum-urunler'
            const youtubeEmbed = getYoutubeEmbedUrl(item.videoUrl)
            const tiktokEmbed = getTiktokEmbedUrl(item.videoUrl)
            const instagramEmbed = getInstagramEmbedUrl(item.videoUrl)
            const embedUrl = youtubeEmbed || tiktokEmbed || instagramEmbed
            const isEmbeddable = Boolean(embedUrl)
            return (
              <article
                key={item.id}
                className="group overflow-hidden rounded-[24px] border border-bronze/20 bg-white shadow-[0_18px_40px_-30px_rgba(58,41,29,0.45)]"
              >
                <div className="relative aspect-[9/16] overflow-hidden">
                  {isEmbeddable ? (
                    <iframe
                      src={embedUrl}
                      title={item.title || 'Kullanıcı videosu'}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : item.videoUrl.startsWith('http') ? (
                    <video
                      src={item.videoUrl}
                      poster={item.thumbnailUrl}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      muted
                      playsInline
                      autoPlay
                      loop
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#1f1f1f] px-4 text-center">
                      <p className="text-sm font-medium text-white">Video bağlantısı oynatılamadı</p>
                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-white/35 px-3 py-1.5 text-xs text-white/90 transition-colors hover:bg-white/10"
                      >
                        Videoyu yeni sekmede aç
                      </a>
                    </div>
                  )}
                  {item.title ? (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent p-3">
                      <p className="line-clamp-2 text-sm font-medium text-white">{item.title}</p>
                      {item.subtitle ? (
                        <p className="mt-1 line-clamp-1 text-xs text-white/80">{item.subtitle}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <div className="border-t border-bronze/15 p-2.5">
                  <Link
                    href={ctaHref}
                    className="flex items-center justify-center gap-2 rounded-lg bg-black px-3 py-2 text-xs font-medium uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#1e1e1e]"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    {item.ctaText || 'Hemen Satın Al'}
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
