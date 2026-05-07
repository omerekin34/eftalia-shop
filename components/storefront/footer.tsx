'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Instagram, MapPin } from 'lucide-react'
import Link from 'next/link'
import { PaymentTrustMarquee } from '@/components/storefront/payment-trust-marquee'

const FEATURED_CATEGORY_TOKENS = [
  'canta',
  'suet canta',
  'omuz cantasi',
  'el cantasi',
  'makyaj cantasi',
  'laptop cantasi',
  'spor cantasi',
  'cuzdan ve kartliklar',
  'cuzdan',
  'kartlik',
  'tarak',
]

const normalizeTr = (value: string) =>
  value
    .toLocaleLowerCase('tr')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/\s+/g, ' ')
    .trim()

const footerLinks = {
  about: [
    { label: 'Hikayemiz', href: '/hakkimizda/hikayemiz' },
    { label: 'Zanaatımız', href: '/hakkimizda/zanaatimiz' },
    { label: 'Malzemeler', href: '/hakkimizda/malzemeler' },
    { label: 'Sürdürülebilirlik', href: '/hakkimizda/surdurulebilirlik' },
  ],
  support: [
    { label: 'İletişim', href: '/iletisim' },
    { label: 'Kargo', href: '/kargo' },
    { label: 'İade', href: '/iade' },
    { label: 'Bakım Rehberi', href: '/bakim-rehberi' },
  ],
}

const NEWSLETTER_STORAGE_KEY = 'eftalia_newsletter_subscription'

export function Footer() {
  const [email, setEmail] = useState('')
  const [subscribedEmail, setSubscribedEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscribeMessage, setSubscribeMessage] = useState('')
  const [shopLinks, setShopLinks] = useState<Array<{ label: string; href: string }>>([
    { label: 'Tüm Ürünler', href: '/tum-urunler' },
  ])
  const formspreeEndpoint = String(
    process.env.NEXT_PUBLIC_FORMSPREE_NEWSLETTER_ENDPOINT ||
      process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ||
      ''
  ).trim()

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(NEWSLETTER_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as { subscribed?: boolean; email?: string }
      if (parsed?.subscribed && parsed?.email) {
        setIsSubscribed(true)
        setSubscribedEmail(String(parsed.email))
        setSubscribeMessage('Kulübe hoş geldiniz! E-posta listesine eklendiniz.')
      }
    } catch {
      // Ignore invalid stored data
    }
  }, [])

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const response = await fetch('/api/storefront/collections', { cache: 'no-store' })
        if (!response.ok) return

        const data = (await response.json()) as {
          collections?: Array<{ name?: string; href?: string }>
        }
        const dynamicLinks = (data.collections || [])
          .map((collection) => ({
            label: String(collection.name || '').trim(),
            href: String(collection.href || '').trim(),
          }))
          .filter((collection) => collection.label && collection.href)

        const featuredOnly = dynamicLinks
          .map((collection) => {
            const normalized = normalizeTr(collection.label)
            const priority = FEATURED_CATEGORY_TOKENS.findIndex((token) =>
              normalized.includes(token)
            )
            return { ...collection, priority }
          })
          .filter((collection) => collection.priority !== -1)
          .sort((a, b) => a.priority - b.priority || a.label.localeCompare(b.label, 'tr'))
          .filter((collection, index, arr) =>
            arr.findIndex((item) => item.label === collection.label) === index
          )
          .slice(0, 8)
          .map(({ label, href }) => ({ label, href }))

        setShopLinks([{ label: 'Tüm Ürünler', href: '/tum-urunler' }, ...featuredOnly])
      } catch {
        // Fallback to default list if API fails
        setShopLinks([{ label: 'Tüm Ürünler', href: '/tum-urunler' }])
      }
    }

    loadCollections()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubscribeMessage('')

    if (!formspreeEndpoint) {
      setSubscribeMessage('Abonelik formu henüz yapılandırılmadı.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'footer-newsletter',
        }),
      })

      const data = (await response.json().catch(() => ({}))) as {
        error?: string
        errors?: Array<{ message?: string }>
      }

      if (!response.ok) {
        const message = data.error || data.errors?.[0]?.message || 'Abonelik işlemi tamamlanamadı.'
        throw new Error(message)
      }

      setIsSubscribed(true)
      setSubscribedEmail(email)
      setSubscribeMessage('Kulübe hoş geldiniz! E-posta listesine eklendiniz.')
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          NEWSLETTER_STORAGE_KEY,
          JSON.stringify({ subscribed: true, email })
        )
      }
      setEmail('')
    } catch (error) {
      setSubscribeMessage(error instanceof Error ? error.message : 'Abonelik işlemi tamamlanamadı.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="bg-ivory-warm">
      {/* Newsletter section */}
      <div className="border-b border-bronze/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-bronze/60">
              EFTALIA Kulübü
            </p>
            <h3 className="mt-2 font-serif text-2xl tracking-wide text-bronze sm:text-3xl">
              Koleksiyonlardan İlk Sen Haberdar Ol
            </h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-bronze-light">
              Yeni ürün duyuruları, sınırlı stok bildirimleri ve sadece üyeler için hazırlanan
              özel fırsatları e-posta ile paylaşalım.
            </p>
            
            <form onSubmit={handleSubmit} className="mt-8 w-full max-w-md">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresiniz"
                  className="w-full border-b-2 border-bronze/30 bg-transparent py-3 pr-12 text-bronze placeholder:text-bronze-light/60 focus:border-gold focus:outline-none"
                  disabled={isSubscribed || isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || isSubscribed}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-bronze transition-colors hover:text-gold disabled:opacity-50"
                  aria-label="Abone ol"
                >
                  {isSubscribed ? (
                    <span className="text-sm text-gold">Kulübe Katıldınız</span>
                  ) : (
                    <ArrowRight className={`h-5 w-5 ${isSubmitting ? 'animate-pulse' : ''}`} strokeWidth={1.5} />
                  )}
                </button>
              </div>
              {subscribeMessage ? (
                <p className="mt-3 text-xs text-bronze/70">{subscribeMessage}</p>
              ) : null}
              {isSubscribed ? (
                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-bronze/65">
                  <span>
                    Kayıtlı e-posta: <strong className="text-bronze/85">{subscribedEmail}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubscribed(false)
                      setSubscribeMessage('')
                      setEmail(subscribedEmail)
                      if (typeof window !== 'undefined') {
                        window.localStorage.removeItem(NEWSLETTER_STORAGE_KEY)
                      }
                    }}
                    className="underline underline-offset-4 transition-colors hover:text-bronze"
                  >
                    Kulüp e-postasını değiştir
                  </button>
                </div>
              ) : null}
              <p className="mt-3 text-xs text-bronze/55">
                Kayıt olarak bilgilendirme e-postalarını almayı kabul etmiş olursunuz.
              </p>
            </form>
          </motion.div>
        </div>
      </div>

      <PaymentTrustMarquee variant="footer" />

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <div className="group inline-flex items-center rounded-md border border-bronze/15 bg-background/70 px-5 py-3 backdrop-blur-[1px] transition-all duration-300 hover:border-gold/40 hover:bg-white">
                <span className="font-serif text-2xl tracking-[0.24em] text-bronze-dark transition-colors duration-300 group-hover:text-gold sm:text-3xl">
                  EFTALIA
                </span>
              </div>
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 max-w-[min(100%,22rem)]"
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-bronze/50">El işçiliği</p>
              <p className="mt-2.5 font-serif text-[15px] leading-[1.65] text-bronze-dark sm:text-base sm:leading-[1.7]">
                <span className="text-bronze-dark">Detayın sanatı.</span>
                <span className="mt-2 block text-sm font-sans font-normal leading-[1.8] text-bronze-light">
                  <span className="text-bronze/90">Deri cüzdan ve kartlıklar</span>
                  <span className="mx-1.5 text-bronze/35">·</span>
                  <span className="text-bronze/90">gabardin kumaş çantalarda</span>
                  <span className="mt-1.5 block text-bronze-light/95">küresel standartlarda incelik.</span>
                </span>
              </p>
              <p className="mt-4 border-l-[3px] border-gold/45 pl-4 text-sm italic leading-[1.75] text-bronze/75">
                Gelenek ile çağdaş zarafetin kesiştiği adres.
              </p>
            </motion.div>
            
            {/* Social links */}
            <div className="mt-6">
              <a
                href="https://www.shopify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-bronze/70"
                aria-label="Shopify resmi sitesi"
              >
                Shopify
              </a>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-bronze/45">
                Powered by Shopify
              </p>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <a 
                href="https://instagram.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-bronze transition-colors group-hover:text-gold" strokeWidth={1.5} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2 transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="h-5 w-5 text-bronze transition-colors group-hover:text-gold" />
              </a>
              <a 
                href="https://tiktok.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2 transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon className="h-5 w-5 text-bronze transition-colors group-hover:text-gold" />
              </a>
              <a 
                href="https://shopify.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2 transition-colors"
                aria-label="Shopify"
              >
                <ShopifyIcon className="h-5 w-5 text-bronze transition-colors group-hover:text-gold" />
              </a>
            </div>
          </div>

          {/* Links columns */}
          <div>
            <h4 className="text-xs font-medium tracking-[0.2em] text-bronze">ÖNE ÇIKAN KATEGORİLERİMİZ</h4>
            <ul className="mt-4 space-y-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-sm text-bronze-light transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-medium tracking-[0.2em] text-bronze">HAKKIMIZDA</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-sm text-bronze-light transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-medium tracking-[0.2em] text-bronze">DESTEK</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-sm text-bronze-light transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Location */}
        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-bronze-light">
          <MapPin className="h-3 w-3" strokeWidth={1.5} />
          <span>Özenle üretildi, dünya genelinde gönderilir</span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-bronze/10">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-bronze-light">
              &copy; {new Date().getFullYear()} {'EFTALIA'}. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-6 text-xs text-bronze-light">
              <Link href="/gizlilik-politikasi" className="transition-colors hover:text-gold">Gizlilik</Link>
              <Link href="/sartlar" className="transition-colors hover:text-gold">Şartlar</Link>
              <Link href="/cerez-politikasi" className="transition-colors hover:text-gold">Çerezler</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

// LinkedIn icon
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="3" />
      <path d="M7 10v7" />
      <circle cx="7" cy="7" r="1" fill="currentColor" />
      <path d="M11 10v7m0-4c0-2 1.5-3 3-3s3 1 3 3v4" />
    </svg>
  )
}

// TikTok icon
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 12a4 4 0 1 0 4 4V4c.5 2.5 2.5 4 5 4" />
    </svg>
  )
}

// Shopify icon
function ShopifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M15 4l-1 2-3-1-4 15h10l3-14c0-1-1-2-2-2h-3z" />
      <path d="M10 5L9 8" />
      <circle cx="10" cy="20" r="1" fill="currentColor" />
      <circle cx="16" cy="20" r="1" fill="currentColor" />
    </svg>
  )
}
