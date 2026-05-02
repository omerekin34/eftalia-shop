'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Instagram } from 'lucide-react'

export type SocialFeedPost = {
  id: string
  postUrl: string
  caption: string
  thumbnailUrl: string
  platform: 'instagram' | 'tiktok'
}

function TiktokGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  )
}

export function SocialFeedShowcase({
  instagramUrl,
  tiktokUrl,
  posts,
}: {
  instagramUrl: string
  tiktokUrl: string
  posts: SocialFeedPost[]
}) {
  const hasLinks = Boolean(instagramUrl || tiktokUrl)
  const hasPosts = posts.length > 0
  if (!hasLinks && !hasPosts) return null

  return (
    <section className="relative overflow-hidden border-b border-bronze/10 bg-gradient-to-b from-[#faf8f4] to-[#f3efe8] py-12 sm:py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, #3a291d 0%, transparent 45%),
            radial-gradient(circle at 80% 60%, #7b1e2b 0%, transparent 40%)`,
        }}
      />
      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45 }}
          className="mb-8 text-center sm:mb-10"
        >
          <p className="text-xs tracking-[0.28em] text-bronze/55">@EFTALIA</p>
          <h2 className="mt-2 font-serif text-2xl text-bronze sm:text-3xl">Sosyal medyada biz</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-bronze/70">
            Paylaşımlarımızı kaçırmayın; Instagram ve TikTok’ta yeni ürünler, stil önerileri ve kamera arkası
            içerikleri bulabilirsiniz.
          </p>
          {hasLinks ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {instagramUrl ? (
                <Link
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-bronze/25 bg-white/90 px-5 py-2.5 text-sm font-medium text-bronze shadow-sm transition hover:border-bronze/40 hover:bg-white"
                >
                  <Instagram className="h-4 w-4" aria-hidden />
                  Instagram
                  <ExternalLink className="h-3.5 w-3.5 opacity-50" aria-hidden />
                </Link>
              ) : null}
              {tiktokUrl ? (
                <Link
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-bronze/25 bg-white/90 px-5 py-2.5 text-sm font-medium text-bronze shadow-sm transition hover:border-bronze/40 hover:bg-white"
                >
                  <TiktokGlyph className="h-4 w-4" />
                  TikTok
                  <ExternalLink className="h-3.5 w-3.5 opacity-50" aria-hidden />
                </Link>
              ) : null}
            </div>
          ) : null}
        </motion.div>

        {hasPosts ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="group"
              >
                <Link
                  href={post.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-2xl border border-bronze/15 bg-white shadow-[0_18px_44px_-32px_rgba(58,41,29,0.55)] transition hover:border-bronze/30 hover:shadow-[0_22px_50px_-28px_rgba(58,41,29,0.45)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#ebe6dd]">
                    {post.thumbnailUrl ? (
                      <Image
                        src={post.thumbnailUrl}
                        alt={post.caption ? post.caption.slice(0, 120) : 'Sosyal medya gönderisi'}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                        unoptimized
                      />
                    ) : (
                      <div
                        className={`flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center ${
                          post.platform === 'tiktok'
                            ? 'bg-gradient-to-br from-[#0f0f0f] to-[#2a2a2a] text-white'
                            : 'bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-white'
                        }`}
                      >
                        {post.platform === 'tiktok' ? (
                          <TiktokGlyph className="h-10 w-10 opacity-95" />
                        ) : (
                          <Instagram className="h-10 w-10 opacity-95" />
                        )}
                        <span className="text-xs font-medium uppercase tracking-[0.12em] opacity-90">
                          Gönderiyi aç
                        </span>
                      </div>
                    )}
                    <span
                      className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm ${
                        post.platform === 'tiktok' ? 'bg-black/75' : 'bg-black/55'
                      }`}
                    >
                      {post.platform === 'tiktok' ? (
                        <>
                          <TiktokGlyph className="h-3 w-3" /> TikTok
                        </>
                      ) : (
                        <>
                          <Instagram className="h-3 w-3" /> Instagram
                        </>
                      )}
                    </span>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-3 pt-10">
                      {post.caption ? (
                        <p className="line-clamp-2 text-left text-xs font-medium text-white drop-shadow-sm">
                          {post.caption}
                        </p>
                      ) : (
                        <p className="text-left text-xs text-white/85">Gönderiyi görüntüle</p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        ) : hasLinks ? (
          <p className="text-center text-sm text-bronze/55">
            Öne çıkan gönderiler yakında burada görünecek. Shopify’da içerikleri ekledikten sonra sayfayı yenileyin.
          </p>
        ) : null}
      </div>
    </section>
  )
}
