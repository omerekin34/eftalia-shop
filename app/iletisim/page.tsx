'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react'
import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import {
  DEFAULT_STORE_POLICY_CLAIMS,
  mergeStorePolicyClaims,
  type StorePolicyClaims,
} from '@/lib/policy-claims'

const supportPhone = '+90 (552) 713 82 13'

type PolicyResponse = {
  title?: string
  url?: string
  excerpt?: string
}

export default function ContactPage() {
  const [shippingPolicy, setShippingPolicy] = useState<PolicyResponse | null>(null)
  const [refundPolicy, setRefundPolicy] = useState<PolicyResponse | null>(null)
  const [policyClaims, setPolicyClaims] = useState<StorePolicyClaims>(DEFAULT_STORE_POLICY_CLAIMS)
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)
  const [contactFeedback, setContactFeedback] = useState('')
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    company: '',
  })

  useEffect(() => {
    let active = true

    const loadPolicyData = async () => {
      try {
        const [shippingResponse, refundResponse] = await Promise.all([
          fetch('/api/storefront/shipping-policy', { cache: 'no-store' }),
          fetch('/api/storefront/refund-policy', { cache: 'no-store' }),
        ])

        const shippingData = (await shippingResponse.json()) as {
          shippingPolicy?: PolicyResponse | null
        }
        const refundData = (await refundResponse.json()) as {
          refundPolicy?: PolicyResponse | null
        }
        if (!active) return
        setShippingPolicy(shippingData.shippingPolicy || null)
        setRefundPolicy(refundData.refundPolicy || null)
      } catch {
        if (!active) return
        setShippingPolicy(null)
        setRefundPolicy(null)
      }
    }

    loadPolicyData()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const response = await fetch('/api/storefront/policy-claims', { cache: 'no-store' })
        const data = (await response.json()) as Partial<StorePolicyClaims>
        if (!active) return
        setPolicyClaims(mergeStorePolicyClaims(data))
      } catch {
        if (!active) return
        setPolicyClaims(DEFAULT_STORE_POLICY_CLAIMS)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const contactCards = useMemo(
    () => [
      {
        title: 'E-Posta',
        value: policyClaims.supportEmail,
        detail: '24 saat içinde dönüş sağlanır',
        icon: Mail,
      },
      {
        title: 'Telefon',
        value: supportPhone,
        detail: 'Hafta içi 09:00 - 18:00',
        icon: Phone,
      },
      {
        title: 'Atölye',
        value: 'İstanbul, Türkiye',
        detail: 'Randevu ile ziyaret edilebilir',
        icon: MapPin,
      },
    ],
    [policyClaims.supportEmail]
  )

  const hoursTitle = 'Çalışma Saatleri'
  const hoursLines = [
    'Pazartesi: 08:00 - 17:00',
    'Salı: 08:00 - 17:00',
    'Çarşamba: 08:00 - 17:00',
    'Perşembe: 08:00 - 17:00',
    'Cuma: 08:00 - 17:00',
    'Cumartesi: 08:00 - 17:00',
    'Pazar: Kapalı',
  ]
  const faqTitle = 'Sık Sorulanlar'
  const faqItems = [
    'Sipariş durumumu nasıl takip ederim?',
    'İade ve değişim süreci kaç gün sürer?',
    'Ürün bakım önerilerine nereden ulaşabilirim?',
  ]

  const handleContactFieldChange = (field: keyof typeof contactForm, value: string) => {
    setContactForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleContactSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setContactFeedback('')

    setIsSubmittingContact(true)
    try {
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kind: 'contact',
          name: contactForm.name,
          email: contactForm.email,
          subject: contactForm.subject,
          message: contactForm.message,
          _gotcha: contactForm.company,
        }),
      })
      const data = (await response.json().catch(() => ({}))) as { error?: string; errors?: Array<{ message?: string }> }

      if (!response.ok) {
        const message = data.error || data.errors?.[0]?.message || 'Mesaj gönderilemedi.'
        throw new Error(message)
      }

      setContactFeedback('Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.')
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        company: '',
      })
    } catch (error) {
      setContactFeedback(error instanceof Error ? error.message : 'Mesaj gönderilemedi.')
    } finally {
      setIsSubmittingContact(false)
    }
  }

  return (
    <main className="min-h-screen bg-ivory">
      <Navbar />

      <section className="border-b border-bronze/10 bg-ivory-warm pt-32 sm:pt-36">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs tracking-[0.25em] text-bronze/70"
          >
            DESTEK
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-3 font-serif text-3xl text-bronze sm:text-4xl"
          >
            İletişim
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-2xl text-sm leading-relaxed text-bronze/75 sm:text-base"
          >
            Sorularınız, sipariş talepleriniz ve iş birliği önerileriniz için bize ulaşabilirsiniz.
            Ekibimiz en kısa sürede size geri dönüş sağlar.
          </motion.p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contactCards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="rounded-xl border border-bronze/10 bg-white p-5"
            >
              <div className="mb-4 inline-flex rounded-full bg-ivory p-2.5">
                <card.icon className="h-5 w-5 text-bronze" strokeWidth={1.5} />
              </div>
              <h2 className="text-sm font-semibold tracking-wide text-bronze">{card.title}</h2>
              {card.title === 'E-Posta' ? (
                <a
                  href={`mailto:${card.value}`}
                  className="mt-2 block text-lg font-medium text-bronze-dark underline-offset-4 hover:underline"
                >
                  {card.value}
                </a>
              ) : card.title === 'Telefon' ? (
                <a
                  href={`tel:${card.value.replace(/\s+/g, '')}`}
                  className="mt-2 block text-lg font-medium text-bronze-dark underline-offset-4 hover:underline"
                >
                  {card.value}
                </a>
              ) : (
                <p className="mt-2 text-lg font-medium text-bronze-dark">{card.value}</p>
              )}
              <p className="mt-2 text-sm text-bronze/65">{card.detail}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-2 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-bronze/10 bg-white p-5">
            <h3 className="font-serif text-xl text-bronze-dark">Kargo Politikası</h3>
            <p className="mt-2 text-sm text-bronze/70">
              {shippingPolicy?.excerpt || policyClaims.shippingDispatchWindow}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/kargo"
                className="rounded-md border border-bronze/20 px-3 py-2 text-xs font-medium uppercase tracking-wide text-bronze transition-colors hover:bg-ivory-warm"
              >
                Sitede Gör
              </Link>
              {shippingPolicy?.url ? (
                <span className="rounded-md border border-bronze/20 px-3 py-2 text-xs font-medium uppercase tracking-wide text-bronze">
                  Shopify Kaynağı
                </span>
              ) : null}
            </div>
          </article>

          <article className="rounded-xl border border-bronze/10 bg-white p-5">
            <h3 className="font-serif text-xl text-bronze-dark">İade Politikası</h3>
            <p className="mt-2 text-sm text-bronze/70">
              {refundPolicy?.excerpt || policyClaims.returnWindow}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/iade"
                className="rounded-md border border-bronze/20 px-3 py-2 text-xs font-medium uppercase tracking-wide text-bronze transition-colors hover:bg-ivory-warm"
              >
                Sitede Gör
              </Link>
              {refundPolicy?.url ? (
                <span className="rounded-md border border-bronze/20 px-3 py-2 text-xs font-medium uppercase tracking-wide text-bronze">
                  Shopify Kaynağı
                </span>
              ) : null}
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-bronze/10 bg-white p-6 sm:p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-bronze" strokeWidth={1.5} />
            <h3 className="font-serif text-2xl text-bronze">Bize Mesaj Bırakın</h3>
          </div>

          <form className="grid gap-4" onSubmit={handleContactSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Ad Soyad"
                value={contactForm.name}
                onChange={(event) => handleContactFieldChange('name', event.target.value)}
                className="rounded-md border border-bronze/15 bg-ivory/40 px-4 py-3 text-sm text-bronze placeholder:text-bronze/50 focus:border-bronze/35 focus:outline-none"
                required
              />
              <input
                type="email"
                placeholder="E-posta"
                value={contactForm.email}
                onChange={(event) => handleContactFieldChange('email', event.target.value)}
                className="rounded-md border border-bronze/15 bg-ivory/40 px-4 py-3 text-sm text-bronze placeholder:text-bronze/50 focus:border-bronze/35 focus:outline-none"
                required
              />
            </div>
            <input
              type="text"
              placeholder="Konu"
              value={contactForm.subject}
              onChange={(event) => handleContactFieldChange('subject', event.target.value)}
              className="rounded-md border border-bronze/15 bg-ivory/40 px-4 py-3 text-sm text-bronze placeholder:text-bronze/50 focus:border-bronze/35 focus:outline-none"
              required
            />
            <textarea
              placeholder="Mesajınızı buraya yazın..."
              rows={6}
              value={contactForm.message}
              onChange={(event) => handleContactFieldChange('message', event.target.value)}
              className="rounded-md border border-bronze/15 bg-ivory/40 px-4 py-3 text-sm text-bronze placeholder:text-bronze/50 focus:border-bronze/35 focus:outline-none"
              required
            />
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={contactForm.company}
              onChange={(event) => handleContactFieldChange('company', event.target.value)}
              className="hidden"
              aria-hidden="true"
            />
            {contactFeedback ? (
              <p className="rounded-md border border-bronze/15 bg-ivory-warm px-3 py-2 text-sm text-bronze/80">
                {contactFeedback}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isSubmittingContact}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-bronze px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-bronze-dark disabled:cursor-not-allowed disabled:bg-bronze/45"
            >
              {isSubmittingContact ? 'Gönderiliyor...' : 'Mesajı Gönder'}
              <Send className="h-4 w-4" strokeWidth={1.7} />
            </button>
          </form>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="space-y-5"
        >
          <div className="rounded-2xl border border-bronze/10 bg-white p-6">
            <div className="mb-3 flex items-center gap-2 text-bronze">
              <Clock className="h-4 w-4" strokeWidth={1.7} />
              <h4 className="text-sm font-semibold tracking-wide">{hoursTitle}</h4>
            </div>
            <ul className="space-y-2 text-sm text-bronze/75">
              {hoursLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-bronze/10 bg-white p-6">
            <h4 className="mb-3 text-sm font-semibold tracking-wide text-bronze">{faqTitle}</h4>
            <ul className="space-y-2 text-sm text-bronze/75">
              {faqItems.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-bronze/10 bg-white p-6">
            <h4 className="mb-3 text-sm font-semibold tracking-wide text-bronze">Hızlı Destek Kanalları</h4>
            <div className="space-y-2 text-sm">
              <a
                href={`mailto:${policyClaims.supportEmail}`}
                className="block text-bronze/80 underline-offset-2 hover:underline"
              >
                E-posta: {policyClaims.supportEmail}
              </a>
              <a href={`tel:${supportPhone.replace(/\s+/g, '')}`} className="block text-bronze/80 underline-offset-2 hover:underline">
                Telefon: {supportPhone}
              </a>
              <p className="text-bronze/65">
                Shopify Inbox canlı destek aktifse, mağazada sağ alttaki sohbet balonundan da bize anında
                ulaşabilirsiniz.
              </p>
            </div>
          </div>
        </motion.aside>
      </section>

      <Footer />
    </main>
  )
}
