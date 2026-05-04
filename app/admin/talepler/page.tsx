'use client'

import { useMemo, useState } from 'react'
import { Ban, CheckCircle2, RefreshCcw, RotateCcw, XCircle } from 'lucide-react'

type Kind = 'return' | 'cancel'
type StatusFilter = 'all' | 'beklemede' | 'inceleniyor' | 'tamamlandi' | 'reddedildi'

type RecordRow = {
  customerId: string
  customerName: string
  customerEmail: string
  kind: Kind
  ticket: {
    id: string
    orderId: string
    orderNumber: number
    reason: string
    note?: string
    status: string
    createdAt: string
    shopifyReturnId?: string
    shopifyReturnName?: string
  }
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  } catch {
    return value || '—'
  }
}

export default function AdminServiceRequestsPage() {
  const [adminKey, setAdminKey] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [records, setRecords] = useState<RecordRow[]>([])
  const [kind, setKind] = useState<'all' | Kind>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [actionNote, setActionNote] = useState<Record<string, string>>({})
  const [pendingActionId, setPendingActionId] = useState('')

  const summary = useMemo(() => {
    const total = records.length
    const pending = records.filter((r) => ['beklemede', 'inceleniyor'].includes((r.ticket.status || '').toLowerCase())).length
    const done = records.filter((r) => (r.ticket.status || '').toLowerCase() === 'tamamlandi').length
    const rejected = records.filter((r) => (r.ticket.status || '').toLowerCase() === 'reddedildi').length
    return { total, pending, done, rejected }
  }, [records])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/service-requests?kind=${kind}&status=${status}&limit=250`, {
        headers: { 'x-admin-key': adminKey },
      })
      const data = (await response.json()) as { error?: string; records?: RecordRow[] }
      if (!response.ok) throw new Error(data?.error || 'Talepler alınamadı.')
      setRecords(Array.isArray(data.records) ? data.records : [])
      setLoaded(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Talepler alınamadı.')
    } finally {
      setLoading(false)
    }
  }

  const runAction = async (row: RecordRow, action: 'approve' | 'decline') => {
    setPendingActionId(row.ticket.id)
    setError('')
    try {
      const response = await fetch('/api/admin/service-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          customerId: row.customerId,
          ticketId: row.ticket.id,
          kind: row.kind,
          action,
          note: actionNote[row.ticket.id] || '',
        }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(data?.error || 'İşlem başarısız.')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'İşlem başarısız.')
    } finally {
      setPendingActionId('')
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3eb] px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-[#9b7a57]/30 bg-white p-5 sm:p-6">
          <h1 className="font-serif text-3xl text-[#4d3523]">Talep Yönetim Paneli</h1>
          <p className="mt-1 text-sm text-[#7d5f45]">
            İade ve iptal taleplerini buradan yönetin. Onay/red işlemlerinde Shopify müşteri bildirimleri kullanılır.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              type="password"
              placeholder="ADMIN_DASHBOARD_KEY"
              className="rounded-lg border border-[#9b7a57]/30 bg-white px-4 py-2.5 text-sm text-[#4d3523] outline-none focus:border-[#6d4f35]"
            />
            <button
              type="button"
              onClick={() => void load()}
              disabled={!adminKey || loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5B1F2A] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              <RefreshCcw className="h-4 w-4" />
              {loading ? 'Yükleniyor...' : 'Talepleri getir'}
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <select
              value={kind}
              onChange={(e) => setKind((e.target.value as 'all' | Kind) || 'all')}
              className="rounded-lg border border-[#9b7a57]/30 bg-white px-4 py-2.5 text-sm text-[#4d3523] outline-none focus:border-[#6d4f35]"
            >
              <option value="all">Tüm talepler</option>
              <option value="return">Sadece iade</option>
              <option value="cancel">Sadece iptal</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus((e.target.value as StatusFilter) || 'all')}
              className="rounded-lg border border-[#9b7a57]/30 bg-white px-4 py-2.5 text-sm text-[#4d3523] outline-none focus:border-[#6d4f35]"
            >
              <option value="all">Tüm durumlar</option>
              <option value="beklemede">Beklemede</option>
              <option value="inceleniyor">İnceleniyor</option>
              <option value="tamamlandi">Tamamlandı</option>
              <option value="reddedildi">Reddedildi</option>
            </select>
          </div>

          {error ? <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        </div>

        {loaded ? (
          <>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-[#9b7a57]/25 bg-white p-4 text-[#6d4f35]">Toplam: {summary.total}</div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">Bekleyen: {summary.pending}</div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">Tamamlanan: {summary.done}</div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">Reddedilen: {summary.rejected}</div>
            </div>

            <ul className="space-y-4">
              {records.map((row) => {
                const isBusy = pendingActionId === row.ticket.id
                const isDone = ['tamamlandi', 'reddedildi'].includes((row.ticket.status || '').toLowerCase())
                return (
                  <li key={`${row.customerId}:${row.ticket.id}`} className="rounded-2xl border border-[#9b7a57]/25 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-[#8a6b4b]">
                          {row.kind === 'return' ? 'İade talebi' : 'İptal talebi'} • #{row.ticket.orderNumber}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-[#4d3523]">
                          {row.customerName} <span className="text-sm font-normal text-[#7d5f45]">({row.customerEmail || 'e-posta yok'})</span>
                        </h3>
                        <p className="mt-1 text-sm text-[#6d4f35]">
                          <strong>Neden:</strong> {row.ticket.reason}
                        </p>
                        {row.ticket.note ? <p className="mt-1 text-sm text-[#7d5f45]"><strong>Not:</strong> {row.ticket.note}</p> : null}
                        {row.kind === 'return' && (row.ticket.shopifyReturnName || row.ticket.shopifyReturnId) ? (
                          <p className="mt-1 text-xs text-[#8a6b4b]">
                            Shopify iade: {row.ticket.shopifyReturnName || row.ticket.shopifyReturnId}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-[#8a6b4b]">{formatDate(row.ticket.createdAt)}</p>
                      </div>
                      <span className="rounded-full border border-[#9b7a57]/25 bg-[#fff9ef] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#6d4f35]">
                        {row.ticket.status || 'beklemede'}
                      </span>
                    </div>

                    {!isDone ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                        <input
                          value={actionNote[row.ticket.id] || ''}
                          onChange={(e) => setActionNote((prev) => ({ ...prev, [row.ticket.id]: e.target.value }))}
                          placeholder="Opsiyonel not (red durumunda müşteriye gidebilir)"
                          className="rounded-lg border border-[#9b7a57]/25 bg-white px-3 py-2.5 text-sm text-[#4d3523] outline-none focus:border-[#6d4f35]"
                        />
                        <button
                          type="button"
                          onClick={() => void runAction(row, 'approve')}
                          disabled={isBusy}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-900 disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {row.kind === 'return' ? 'İadeyi onayla' : 'İptali onayla'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void runAction(row, 'decline')}
                          disabled={isBusy}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-800 disabled:opacity-60"
                        >
                          <XCircle className="h-4 w-4" />
                          Reddet
                        </button>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-[#8a6b4b]">
                        Bu kayıt sonuçlandırılmış. Shopify bildirimleri işlem sırasında tetiklendi.
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#9b7a57]/30 bg-white/70 p-8 text-center text-[#7d5f45]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#9b7a57]/30 bg-[#fff9ef]">
              <Ban className="h-5 w-5 text-[#8a6b4b]" />
            </div>
            <p className="mt-3 text-sm">Admin key girip “Talepleri getir” dedikten sonra liste burada görünür.</p>
          </div>
        )}
      </section>
    </main>
  )
}
