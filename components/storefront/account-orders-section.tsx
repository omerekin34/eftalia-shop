'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  Calendar,
  ExternalLink,
  MapPin,
  Package,
  Sparkles,
  Truck,
} from 'lucide-react'

export type AccountOrderLineItem = {
  title: string
  quantity: number
  variantImage?: string | null
  variantImageAlt?: string | null
}

export type AccountOrder = {
  id: string
  orderNumber: number
  processedAt?: string
  financialStatus?: string | null
  fulfillmentStatus?: string | null
  totalPrice?: {
    amount?: string
    currencyCode?: string
  }
  statusUrl?: string | null
  lineItems: AccountOrderLineItem[]
  shippingRecipient?: string
  shippingSummary?: string | null
}

function formatMoney(amount?: string, currency = 'TRY') {
  const numeric = Number(amount || 0)
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(numeric)
}

function formatOrderDate(date?: string) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

function fulfillmentBadge(status?: string | null) {
  const s = (status || '').toUpperCase()
  if (s === 'FULFILLED') {
    return {
      label: 'Kargolandı',
      className:
        'border-emerald-200/80 bg-emerald-50 text-emerald-900 shadow-[0_6px_16px_-10px_rgba(6,95,70,0.45)]',
    }
  }
  if (s === 'PARTIALLY_FULFILLED') {
    return {
      label: 'Kısmen kargoda',
      className: 'border-amber-200/90 bg-amber-50 text-amber-950',
    }
  }
  if (s === 'IN_PROGRESS' || s === 'UNFULFILLED' || s === '') {
    return {
      label: s === 'IN_PROGRESS' ? 'İşleniyor' : 'Hazırlanıyor',
      className: 'border-[#c4a574]/50 bg-[#fff9ef] text-[#5c4328]',
    }
  }
  if (s === 'RESTOCKED') {
    return { label: 'Depoya iade', className: 'border-zinc-200 bg-zinc-50 text-zinc-700' }
  }
  return {
    label: status?.replace(/_/g, ' ') || 'Durum',
    className: 'border-[#9b7a57]/30 bg-white text-[#6d4f35]',
  }
}

function financialLabel(status?: string | null) {
  const s = (status || '').toUpperCase()
  const map: Record<string, string> = {
    PAID: 'Ödendi',
    PENDING: 'Ödeme bekliyor',
    AUTHORIZED: 'Yetkilendirildi',
    PARTIALLY_PAID: 'Kısmi ödeme',
    REFUNDED: 'İade edildi',
    VOIDED: 'İptal',
    PARTIALLY_REFUNDED: 'Kısmi iade',
  }
  return map[s] || (status ? status.replace(/_/g, ' ') : '')
}

export function AccountOrdersSection({ orders }: { orders: AccountOrder[] }) {
  if (!orders.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#9b7a57]/30 bg-gradient-to-br from-white via-[#fffdf9] to-[#f8efe1] p-8 text-[#7d5f45] shadow-[0_24px_60px_-48px_rgba(83,58,39,0.35)]">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-lg">
            <p className="text-xs uppercase tracking-[0.22em] text-[#8a6b4b]">Eftalia Premium</p>
            <p className="mt-2 font-serif text-2xl text-[#4d3523] sm:text-3xl">Henüz siparişiniz yok</p>
            <p className="mt-2 text-sm leading-relaxed text-[#7d5f45]">
              İlk deri ürününüzü seçtiğinizde siparişleriniz burada; teslimat adresi, ürün görselleri ve durum takibi tek
              ekranda görünecek.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl border border-[#9b7a57]/20 bg-white/90 px-8 py-6 shadow-inner">
            <Package className="h-10 w-10 text-[#8a6b4b]" strokeWidth={1.25} />
            <p className="mt-2 font-serif text-3xl text-[#5B1F2A]">0</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a6b4b]">Sipariş</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/tum-urunler"
            className="inline-flex items-center justify-center rounded-xl bg-[#5B1F2A] px-5 py-3 text-sm font-medium text-white shadow-[0_14px_28px_-16px_rgba(91,31,42,0.65)] transition-colors hover:bg-[#4a1822]"
          >
            Koleksiyonu keşfet
          </Link>
          <Link
            href="/account?tab=favorites"
            className="inline-flex items-center justify-center rounded-xl border border-[#9b7a57]/35 bg-white px-5 py-3 text-sm font-medium text-[#6d4f35] transition-colors hover:bg-[#f7f0e6]"
          >
            Favorilerim
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#8a6b4b]">Sipariş geçmişi</p>
          <h2 className="font-serif text-3xl text-[#4d3523] sm:text-4xl">Siparişlerim</h2>
          <p className="mt-1 max-w-xl text-sm text-[#7d5f45]">
            {orders.length} sipariş listeleniyor. Teslimat özeti, ürün görselleri ve Shopify güvenli sipariş takibi.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#9b7a57]/25 bg-white/80 px-4 py-2 text-xs font-medium text-[#6d4f35] shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-[#b8956a]" />
          Premium takip deneyimi
        </div>
      </div>

      <ul className="space-y-5">
        {orders.map((order) => {
          const fb = fulfillmentBadge(order.fulfillmentStatus)
          const fin = financialLabel(order.financialStatus)
          return (
            <li key={order.id}>
              <article className="overflow-hidden rounded-2xl border border-[#9b7a57]/22 bg-gradient-to-br from-white via-[#fffdfb] to-[#faf4ea] shadow-[0_28px_70px_-44px_rgba(83,58,39,0.42)] ring-1 ring-black/[0.02]">
                <header className="flex flex-col gap-4 border-b border-[#9b7a57]/12 bg-gradient-to-r from-[#5B1F2A]/[0.06] to-transparent px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#9b7a57]/20 bg-white/90 shadow-sm">
                      <Package className="h-5 w-5 text-[#5B1F2A]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a6b4b]">Sipariş no</p>
                      <p className="font-serif text-2xl leading-tight text-[#4d3523] sm:text-3xl">#{order.orderNumber}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${fb.className}`}
                    >
                      {fb.label}
                    </span>
                    {fin ? (
                      <span className="inline-flex items-center rounded-full border border-[#9b7a57]/20 bg-white/90 px-3 py-1 text-[11px] font-medium text-[#6d4f35]">
                        {fin}
                      </span>
                    ) : null}
                  </div>
                </header>

                <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_minmax(0,280px)]">
                  <div className="min-w-0 space-y-5">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#7d5f45]">
                      <span className="inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0 text-[#b8956a]" />
                        {formatOrderDate(order.processedAt)}
                      </span>
                    </div>

                    {order.lineItems?.length ? (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a6b4b]">
                          Ürünler
                        </p>
                        <ul className="mt-3 divide-y divide-[#9b7a57]/12 rounded-xl border border-[#9b7a57]/15 bg-white/75">
                          {order.lineItems.map((line, idx) => (
                            <li
                              key={`${order.id}-${idx}-${line.title}`}
                              className="flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4"
                            >
                              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#9b7a57]/15 bg-[#f5ede2]">
                                {line.variantImage ? (
                                  <Image
                                    src={line.variantImage}
                                    alt={line.variantImageAlt || line.title}
                                    fill
                                    className="object-cover"
                                    sizes="56px"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center p-1 text-center text-[9px] font-medium uppercase leading-tight text-[#9b7a57]">
                                    Ürün
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-sm font-medium leading-snug text-[#4d3523]">
                                  {line.title}
                                </p>
                                <p className="mt-0.5 text-xs text-[#8a6b4b]">Adet: {line.quantity}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {order.shippingSummary ? (
                      <div className="rounded-xl border border-[#9b7a57]/18 bg-white/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a6b4b]">
                          <MapPin className="h-3.5 w-3.5" />
                          Teslimat adresi
                        </p>
                        {order.shippingRecipient ? (
                          <p className="mt-1.5 text-sm font-semibold text-[#4d3523]">{order.shippingRecipient}</p>
                        ) : null}
                        <p className="mt-1 text-sm leading-relaxed text-[#7d5f45]">{order.shippingSummary}</p>
                      </div>
                    ) : null}
                  </div>

                  <aside className="flex flex-col justify-between gap-4 rounded-xl border border-[#9b7a57]/15 bg-gradient-to-b from-white to-[#fffaf3] p-5 shadow-inner">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a6b4b]">Toplam</p>
                      <p className="mt-1 font-serif text-3xl text-[#4d3523]">
                        {formatMoney(order?.totalPrice?.amount, order?.totalPrice?.currencyCode)}
                      </p>
                    </div>
                    {order.statusUrl ? (
                      <a
                        href={order.statusUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5B1F2A] px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white shadow-[0_12px_24px_-14px_rgba(91,31,42,0.55)] transition-colors hover:bg-[#4a1822]"
                      >
                        <Truck className="h-4 w-4 shrink-0" />
                        Sipariş takibi
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-80" />
                      </a>
                    ) : (
                      <p className="text-center text-xs text-[#8a6b4b]">Takip bağlantısı bu sipariş için kullanılamıyor.</p>
                    )}
                  </aside>
                </div>
              </article>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
