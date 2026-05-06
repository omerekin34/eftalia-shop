'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

function PaymentBadge({ kind }: { kind: string }) {
  const pill =
    'inline-flex items-center justify-center rounded-lg border border-bronze/15 bg-white px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-bronze-dark'

  switch (kind) {
    case 'VISA':
      return (
        <span className="font-[Segoe_UI,system-ui,sans-serif] text-xl font-black italic tracking-tight text-[#1434CB]" aria-hidden>
          VISA
        </span>
      )
    case 'MASTERCARD':
      return (
        <svg viewBox="0 0 48 32" className="h-8 w-auto max-w-[3rem] shrink-0" aria-hidden>
          <title>Mastercard</title>
          <circle cx="18" cy="16" r="11" fill="#EB001B" fillOpacity={0.88} />
          <circle cx="30" cy="16" r="11" fill="#F79E1B" fillOpacity={0.88} />
        </svg>
      )
    case 'AMERICAN_EXPRESS':
      return (
        <svg viewBox="0 0 80 28" className="h-8 w-auto max-w-[4.5rem] shrink-0" aria-hidden>
          <title>American Express</title>
          <rect width="80" height="28" rx="4" fill="#006FCF" fillOpacity={0.92} />
          <text x="40" y="18" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="system-ui,sans-serif">
            AMEX
          </text>
        </svg>
      )
    case 'DISCOVER':
      return <span className={pill}>Discover</span>
    case 'JCB':
      return <span className={pill}>JCB</span>
    case 'DINERS_CLUB':
      return (
        <span className={`${pill} max-w-[5rem] text-[9px] leading-tight`}>Diners Club</span>
      )
    case 'APPLE_PAY':
      return <span className="text-[13px] font-semibold tracking-tight text-bronze-dark">Apple Pay</span>
    case 'GOOGLE_PAY':
    case 'ANDROID_PAY':
      return (
        <span className="text-[13px] font-semibold tracking-tight">
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">l</span>
          <span className="text-[#EA4335]">e</span>
          <span className="text-bronze-dark"> Pay</span>
        </span>
      )
    case 'SHOPIFY_PAY':
      return (
        <span className={`${pill} normal-case tracking-normal`}>
          <span className="font-bold text-[#5B1F2A]">Shop</span>
          <span className="ml-0.5 text-bronze/75">Pay</span>
        </span>
      )
    default:
      return (
        <span className={`${pill} max-w-[6rem] text-center text-[10px] leading-tight`}>
          {kind.replace(/_/g, ' ')}
        </span>
      )
  }
}

type PaymentTrustVariant = 'page' | 'footer'

export function PaymentTrustMarquee({ variant = 'page' }: { variant?: PaymentTrustVariant }) {
  const isFooter = variant === 'footer'
  const [badges, setBadges] = useState<string[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/storefront/payment-trust', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { badges?: string[] }
        if (Array.isArray(data.badges) && data.badges.length) setBadges(data.badges)
      } catch {
        setBadges(['VISA', 'MASTERCARD', 'AMERICAN_EXPRESS', 'APPLE_PAY', 'GOOGLE_PAY'])
      }
    }
    load()
  }, [])

  const row = badges.length
    ? badges
    : ['VISA', 'MASTERCARD', 'AMERICAN_EXPRESS', 'APPLE_PAY', 'GOOGLE_PAY']
  // Marquee hattı kısa kalırsa boşluk oluşmaması için öğeleri çoğalt.
  const minVisibleItems = 16
  const repeatCount = Math.max(4, Math.ceil(minVisibleItems / row.length))
  const repeatedRow = Array.from({ length: repeatCount }, () => row).flat()
  const loop = [...repeatedRow, ...repeatedRow]

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        isFooter
          ? 'border-b border-bronze/10 bg-background py-8 sm:py-10'
          : 'border-y border-bronze/15 bg-gradient-to-b from-[#faf8f5] via-background to-[#f7f4ef] py-7 sm:py-9'
      )}
      aria-label="Güvenli ödeme yöntemleri"
    >
      {!isFooter ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        </>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45 }}
        className="container mx-auto px-4"
      >
        <div className="mb-5 flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-center sm:gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-bronze/15 bg-white/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.28em] text-bronze/55 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-bronze/60" aria-hidden />
            Güvenli ödeme
          </span>
          <p className="max-w-xl text-xs leading-relaxed text-bronze/55 sm:text-[13px]">
            Ödemeleriniz Shopify altyapısı üzerinden güvenli şekilde işlenir. Rozetler, mağazanızın Shopify Payments
            kapsamında açtığınız kart ve cüzdanlara göre otomatik güncellenir.
          </p>
        </div>
      </motion.div>

      <div className="relative">
        <div
          className={cn(
            'pointer-events-none absolute inset-y-0 left-0 z-[1] w-12 bg-gradient-to-r to-transparent sm:w-20',
            isFooter ? 'from-background' : 'from-[#faf8f5]'
          )}
          aria-hidden
        />
        <div
          className={cn(
            'pointer-events-none absolute inset-y-0 right-0 z-[1] w-12 bg-gradient-to-l to-transparent sm:w-20',
            isFooter ? 'from-background' : 'from-[#f7f4ef]'
          )}
          aria-hidden
        />

        <div className="flex animate-marquee-payment items-center">
          {loop.map((kind, index) => (
            <div key={`${kind}-${index}`} className="flex shrink-0 items-center px-5 sm:px-9">
              <div className="flex h-12 min-w-[5rem] items-center justify-center rounded-xl border border-bronze/10 bg-white/85 px-3 shadow-[0_10px_28px_-20px_rgba(58,41,29,0.55)] backdrop-blur-[1px]">
                <PaymentBadge kind={kind} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
