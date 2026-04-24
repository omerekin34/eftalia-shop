'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Instagram, MapPin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const footerLinks = {
  shop: [
    { label: 'Tüm Ürünler', href: '/tum-urunler' },
    { label: 'El Çantaları', href: '/tum-urunler?kategori=el-cantasi' },
    { label: 'Makyaj Çantaları', href: '/tum-urunler?kategori=makyaj-cantasi' },
    { label: 'Cüzdan ve Kartlıklar', href: '/tum-urunler?kategori=cuzdan-kartlik' },
    { label: 'Yeni Gelenler', href: '/tum-urunler?yeni=true' },
  ],
  about: [
    { label: 'Hikayemiz', href: '#' },
    { label: 'Zanaatımız', href: '#' },
    { label: 'Malzemeler', href: '#' },
    { label: 'Sürdürülebilirlik', href: '#' },
  ],
  support: [
    { label: 'İletişim', href: '/iletisim' },
    { label: 'Kargo', href: '#' },
    { label: 'İade', href: '#' },
    { label: 'Bakım Rehberi', href: '#' },
  ],
}

export function Footer() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setIsSubmitting(true)
    // Simulate API call for newsletter signup
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubscribed(true)
    setIsSubmitting(false)
    setEmail('')
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
            <h3 className="font-serif text-2xl tracking-wide text-bronze sm:text-3xl">
              Atölyemize Katılın
            </h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-bronze-light">
              Yeni koleksiyonlara özel erişim, zanaat hikayeleri ve sadece üyelere özel fırsatlar için abone olun.
            </p>
            
            <form onSubmit={handleSubmit} className="mt-8 w-full max-w-md">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresinizi girin"
                  className="w-full border-b-2 border-bronze/30 bg-transparent py-3 pr-12 text-bronze placeholder:text-bronze-light/60 focus:border-gold focus:outline-none"
                  disabled={isSubscribed}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || isSubscribed}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-bronze transition-colors hover:text-gold disabled:opacity-50"
                  aria-label="Abone ol"
                >
                  {isSubscribed ? (
                    <span className="text-sm text-gold">Abone Oldunuz</span>
                  ) : (
                    <ArrowRight className={`h-5 w-5 ${isSubmitting ? 'animate-pulse' : ''}`} strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo.jpg"
                alt="B'ETUI EFTELIA"
                width={80}
                height={80}
                className="h-20 w-20 object-contain"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-bronze-light">
              Detayın sanatı. El yapımı deri ürünlerde küresel standartlar, geleneğin çağdaş zarafetle buluştuğu yer.
            </p>
            
            {/* Social links */}
            <div className="mt-6 flex items-center gap-4">
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
            <h4 className="text-xs font-medium tracking-[0.2em] text-bronze">ALIŞVERİŞ</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.shop.map((link) => (
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
              &copy; {new Date().getFullYear()} {"B'ETUI EFTELIA"}. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-6 text-xs text-bronze-light">
              <Link href="#" className="transition-colors hover:text-gold">Gizlilik</Link>
              <Link href="#" className="transition-colors hover:text-gold">Şartlar</Link>
              <Link href="#" className="transition-colors hover:text-gold">Çerezler</Link>
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
