'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Ban, Package, RotateCcw } from 'lucide-react'
import type { AccountOrder } from '@/components/storefront/account-orders-section'

export type ServiceTicket = {
  id: string
  orderId: string
  orderNumber: number
  reason: string
  note?: string
  status: string
  createdAt: string
}

const RETURN_REASON_OPTIONS = [
  'Ürün hasarlı / kusurlu',
  'Yanlış ürün gönderildi',
  'Beden / ölçü uyumsuzluğu',
  'Ürün beklentimi karşılamadı',
  'Diğer',
] as const

const CANCEL_REASON_OPTIONS = [
  'Siparişi vermekten vazgeçtim',
  'Yanlışlıkla sipariş verdim',
  'Teslimat süresi / tarih uygun değil',
  'Ödeme / adres değişikliği',
  'Diğer',
] as const

function statusBadge(status: string) {
  const s = (status || '').toLowerCase()
  if (s === 'tamamlandi') {
    return { label: 'Tamamlandı', className: 'border-emerald-200 bg-emerald-50 text-emerald-900' }
  }
  if (s === 'reddedildi') {
    return { label: 'Reddedildi', className: 'border-rose-200 bg-rose-50 text-rose-800' }
  }
  if (s === 'inceleniyor') {
    return { label: 'İnceleniyor', className: 'border-amber-200 bg-amber-50 text-amber-950' }
  }
  return { label: 'Beklemede', className: 'border-[#9b7a57]/25 bg-white text-[#6d4f35]' }
}

function formatTicketDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return '—'
  }
}

type Props = {
  kind: 'return' | 'cancel'
  title: string
  intro: string
  orders: AccountOrder[]
  tickets: ServiceTicket[]
}

export function AccountServiceRequestsPanel({ kind, title, intro, orders, tickets }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState('')
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const reasonOptions = kind === 'cancel' ? CANCEL_REASON_OPTIONS : RETURN_REASON_OPTIONS
  const Icon = kind === 'cancel' ? Ban : RotateCcw

  const prefillOrderNumber = useMemo(() => {
    const raw = searchParams.get('order')
    if (!raw) return null
    const n = Number.parseInt(raw, 10)
    return Number.isFinite(n) ? n : null
  }, [searchParams])

  useEffect(() => {
    if (!prefillOrderNumber || !orders.length) return
    const match = orders.find((o) => Number(o.orderNumber) === prefillOrderNumber)
    if (match) {
      setOrderId(match.id)
    }
  }, [prefillOrderNumber, orders])

  const selectedOrder = orders.find((o) => o.id === orderId)

  const sortedTickets = useMemo(
    () => [...tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [tickets]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!orderId || !selectedOrder) {
      setError('Sipariş seçin.')
      return
    }
    if (!reason) {
      setError('Bir neden seçin.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/account/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: kind === 'cancel' ? 'cancel' : 'return',
          orderId: selectedOrder.id,
          orderNumber: selectedOrder.orderNumber,
          reason,
          note,
        }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(data?.error || 'Talep gönderilemedi.')
      }
      setSuccess('Talebiniz kaydedildi. Ekibimiz Shopify sipariş numaranız üzerinden süreci yönetecek.')
      setNote('')
      setReason('')
      const params = new URLSearchParams(searchParams.toString())
      params.delete('order')
      const qs = params.toString()
      router.push(qs ? `/account?${qs}` : '/account', { scroll: false })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Talep gönderilemedi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#8a6b4b]">
            {kind === 'cancel' ? 'İptal' : 'İade'} · Shopify ile eşleşen talepler
          </p>
          <h2 className="mt-1 font-serif text-3xl text-[#4d3523] sm:text-4xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#7d5f45]">{intro}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#9b7a57]/25 bg-white/80 px-4 py-2 text-xs font-medium text-[#6d4f35] shadow-sm">
          <Icon className="h-3.5 w-3.5 text-[#b8956a]" />
          {tickets.length} kayıtlı talep
        </div>
      </div>

      <div className="rounded-2xl border border-[#9b7a57]/20 bg-white/85 p-5 shadow-inner sm:p-6">
        <h3 className="flex items-center gap-2 font-semibold text-[#4d3523]">
          <Package className="h-4 w-4 text-[#8a6b4b]" />
          Yeni talep oluştur
        </h3>
        <p className="mt-1 text-xs text-[#8a6b4b]">
          Talepler hesabınızda güvenli şekilde saklanır; mağaza ekibi Shopify yönetiminde sipariş numaranızla işlem
          yapar.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-[#4d3523]">Sipariş</label>
            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full rounded-lg border border-[#9b7a57]/30 bg-white px-4 py-3 text-sm text-[#4d3523] outline-none focus:border-[#6d4f35]"
              required
            >
              <option value="">Sipariş seçin…</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  #{o.orderNumber} · {new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(
                    new Date(o.processedAt || Date.now())
                  )}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-[#4d3523]">Neden</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-[#9b7a57]/30 bg-white px-4 py-3 text-sm text-[#4d3523] outline-none focus:border-[#6d4f35]"
              required
            >
              <option value="">Seçin…</option>
              {reasonOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-[#4d3523]">Açıklama (isteğe bağlı)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder={
                reason === 'Diğer' ? 'Kısaca açıklayın (zorunlu alan gibi değerlendirilir)' : 'Ek bilgi ekleyebilirsiniz'
              }
              className="w-full rounded-lg border border-[#9b7a57]/30 bg-white px-4 py-3 text-sm text-[#4d3523] outline-none focus:border-[#6d4f35]"
            />
          </div>
          {error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 sm:col-span-2">
              {success}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting || !orders.length}
            className="rounded-xl bg-[#5B1F2A] px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#4a1822] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
          >
            {submitting ? 'Gönderiliyor...' : 'Talebi gönder'}
          </button>
        </form>
      </div>

      <div>
        <h3 className="font-serif text-xl text-[#4d3523]">Geçmiş talepler</h3>
        {!sortedTickets.length ? (
          <div className="mt-4 rounded-2xl border border-dashed border-[#9b7a57]/30 bg-gradient-to-br from-white via-[#fffdfb] to-[#f8efe1] p-10 text-center text-[#7d5f45]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#9b7a57]/20 bg-white">
              <Icon className="h-6 w-6 text-[#8a6b4b]" />
            </div>
            <p className="mt-4 font-medium text-[#4d3523]">Henüz kayıtlı talep yok</p>
            <p className="mt-2 text-sm">Yukarıdaki formdan yeni bir talep oluşturabilirsiniz.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {sortedTickets.map((t) => {
              const badge = statusBadge(t.status)
              return (
                <li
                  key={t.id}
                  className="rounded-xl border border-[#9b7a57]/18 bg-white/90 px-4 py-4 shadow-sm sm:px-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8a6b4b]">Sipariş</p>
                      <p className="font-serif text-xl text-[#4d3523]">#{t.orderNumber}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#6d4f35]">
                    <span className="font-medium text-[#4d3523]">Neden:</span> {t.reason}
                  </p>
                  {t.note ? (
                    <p className="mt-1 text-sm text-[#7d5f45]">
                      <span className="font-medium text-[#4d3523]">Not:</span> {t.note}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-[#8a6b4b]">{formatTicketDate(t.createdAt)}</p>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
