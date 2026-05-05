'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Reward = { code: string; label: string }
const SPIN_THRESHOLDS = [5000]

const WHEEL_COLORS = ['#5B1F2A', '#7A4A21', '#8B5E3C', '#6B2D3C', '#9B7A57', '#4A1822', '#5c3d2e']

type SpinStatus = {
  authenticated: boolean
  eligible: boolean
  totalSpend: number
  requiredSpend: number
  rewardSlots: number
  segmentsPerPrize?: number
  wheelSegments?: { label: string }[]
  availableSpins: number
  usedSpins: number
  remainingSpins: number
  alreadyUsed: boolean
  reward: Reward | null
  rewardsWon?: Reward[]
}

function describeSectorPath(index: number, total: number, radius: number): string {
  if (total < 1) return ''
  const startAngle = (index / total) * 2 * Math.PI - Math.PI / 2
  const endAngle = ((index + 1) / total) * 2 * Math.PI - Math.PI / 2
  const x1 = radius * Math.cos(startAngle)
  const y1 = radius * Math.sin(startAngle)
  const x2 = radius * Math.cos(endAngle)
  const y2 = radius * Math.sin(endAngle)
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0
  return `M 0 0 L ${x1.toFixed(4)} ${y1.toFixed(4)} A ${radius} ${radius} 0 ${largeArc} 1 ${x2.toFixed(4)} ${y2.toFixed(4)} Z`
}

function truncateWheelLabel(label: string, segmentCount: number): string {
  const maxChars = segmentCount >= 18 ? 6 : segmentCount >= 12 ? 8 : segmentCount >= 8 ? 10 : 14
  const t = label.trim()
  if (t.length <= maxChars) return t
  return `${t.slice(0, Math.max(3, maxChars - 1))}…`
}

function SpinWheelVisual({
  labels,
  rotationDeg,
  isAnimating,
}: {
  labels: string[]
  rotationDeg: number
  isAnimating: boolean
}) {
  const n = labels.length
  const r = 100
  const fontSize = n >= 20 ? 6.5 : n >= 14 ? 7.5 : n >= 10 ? 8.5 : 10
  const labelRadius = 64

  if (n < 1) {
    return (
      <div className="flex h-52 w-52 items-center justify-center rounded-full border-2 border-dashed border-bronze/30 bg-ivory-warm/80 text-center text-xs text-bronze/60">
        Çark için aktif
        <br />
        indirim yok
      </div>
    )
  }

  return (
    <div className="relative mx-auto h-56 w-56 sm:h-60 sm:w-60">
      <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
        <div
          className="h-0 w-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-[#2a1218] drop-shadow-md"
          style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))' }}
        />
      </div>
      <svg
        className="h-full w-full overflow-visible"
        viewBox="-100 -100 200 200"
        role="img"
        aria-label="Şans çarkı"
        style={{
          transform: `rotate(${rotationDeg}deg)`,
          transition: isAnimating ? 'transform 4.2s cubic-bezier(0.17, 0.67, 0.2, 1)' : 'none',
        }}
      >
        <circle cx="0" cy="0" r={r + 2} fill="none" stroke="#e8d4bc" strokeWidth="3" />
        {labels.map((label, i) => {
          const midAngle = ((i + 0.5) / n) * 2 * Math.PI - Math.PI / 2
          const tx = labelRadius * Math.cos(midAngle)
          const ty = labelRadius * Math.sin(midAngle)
          const textRotation = (midAngle * 180) / Math.PI + 90
          return (
            <g key={i}>
              <path
                d={describeSectorPath(i, n, r)}
                fill={WHEEL_COLORS[i % WHEEL_COLORS.length]}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="0.8"
              />
              <text
                x={tx}
                y={ty}
                fill="#fffef8"
                fontSize={fontSize}
                fontWeight={700}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${textRotation}, ${tx.toFixed(2)}, ${ty.toFixed(2)})`}
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.45)' }}
              >
                {truncateWheelLabel(label, n)}
              </text>
            </g>
          )
        })}
        <circle cx="0" cy="0" r="28" fill="#fffdf7" stroke="#deb887" strokeWidth="1.5" />
        <text x="0" y="5" textAnchor="middle" fill="#5B1F2A" fontSize="9" fontWeight={700}>
          EFTALIA
        </text>
      </svg>
    </div>
  )
}

export function SpinWheelModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<SpinStatus | null>(null)
  const [message, setMessage] = useState('')
  const [rotationDeg, setRotationDeg] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    ;(async () => {
      try {
        const response = await fetch('/api/account/spin-wheel', { cache: 'no-store' })
        const data = (await response.json()) as SpinStatus & { error?: string }
        if (!response.ok) {
          setMessage(data.error || 'Çarkıfelek bilgisi yüklenemedi.')
          return
        }
        setStatus(data)
      } catch {
        setMessage('Çarkıfelek bilgisi yüklenemedi.')
      }
    })()
  }, [isOpen])

  const spendRemaining = useMemo(() => {
    if (!status) return 0
    const nextThreshold = SPIN_THRESHOLDS.find((threshold) => threshold > status.totalSpend)
    if (!nextThreshold) return 0
    return Math.max(0, nextThreshold - status.totalSpend)
  }, [status])

  const wheelLabels = useMemo(
    () => (status?.wheelSegments?.length ? status.wheelSegments.map((s) => s.label) : []),
    [status?.wheelSegments]
  )

  const uniqueLegend = useMemo(() => {
    if (!status?.wheelSegments?.length) return []
    const seen = new Set<string>()
    const out: string[] = []
    for (const s of status.wheelSegments) {
      if (!seen.has(s.label)) {
        seen.add(s.label)
        out.push(s.label)
      }
    }
    return out
  }, [status?.wheelSegments])

  const handleSpin = async () => {
    if (!status?.rewardSlots) {
      setMessage('Shopify tarafında aktif çark indirimi bulunamadı. İndirim kodlarını ve Admin token ayarını kontrol edin.')
      return
    }
    setIsLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/account/spin-wheel', { method: 'POST' })
      const data = (await response.json()) as {
        error?: string
        reward?: Reward | null
        rewardsWon?: Reward[]
        rewardSlots?: number
        rewardIndex?: number
        eligible?: boolean
        totalSpend?: number
        requiredSpend?: number
        availableSpins?: number
        usedSpins?: number
        remainingSpins?: number
        alreadyUsed?: boolean
      }
      if (!response.ok) {
        setMessage(data.error || 'Çarkıfelek şu an kullanılamıyor.')
        if (typeof data.totalSpend === 'number' && status) {
          setStatus({
            ...status,
            totalSpend: data.totalSpend,
            eligible: Boolean(data.eligible),
            availableSpins: typeof data.availableSpins === 'number' ? data.availableSpins : status.availableSpins,
            usedSpins: typeof data.usedSpins === 'number' ? data.usedSpins : status.usedSpins,
            remainingSpins:
              typeof data.remainingSpins === 'number' ? data.remainingSpins : status.remainingSpins,
          })
        }
        return
      }

      const rewardSlots = Math.max(1, Number(data.rewardSlots || status.rewardSlots || 1))
      const rewardIndex = Math.max(0, Math.min(rewardSlots - 1, Number(data.rewardIndex || 0)))
      const sliceAngle = 360 / rewardSlots
      const pointerCompensation = 360 - (rewardIndex * sliceAngle + sliceAngle / 2)
      const nextRotation = rotationDeg + 1800 + pointerCompensation

      setIsAnimating(true)
      setRotationDeg(nextRotation)
      await new Promise((resolve) => setTimeout(resolve, 4200))
      setIsAnimating(false)

      setStatus((prev) =>
        prev
          ? {
              ...prev,
              alreadyUsed: true,
              reward: data.reward || null,
              eligible: true,
              totalSpend: typeof data.totalSpend === 'number' ? data.totalSpend : prev.totalSpend,
              availableSpins:
                typeof data.availableSpins === 'number' ? data.availableSpins : prev.availableSpins,
              usedSpins: typeof data.usedSpins === 'number' ? data.usedSpins : prev.usedSpins,
              remainingSpins:
                typeof data.remainingSpins === 'number' ? data.remainingSpins : prev.remainingSpins,
              rewardSlots: typeof data.rewardSlots === 'number' ? data.rewardSlots : prev.rewardSlots,
              rewardsWon: data.rewardsWon || prev.rewardsWon,
            }
          : prev
      )
      window.dispatchEvent(new CustomEvent('eftalia:spin-wheel-updated'))
      setMessage('Tebrikler! Kupon kodun hesabına işlendi.')
    } catch {
      setMessage('Çarkıfelek sırasında hata oluştu.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-md rounded-2xl border border-bronze/20 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-bronze/70">Özel Üye Fırsatı</p>
            <h3 className="mt-1 font-serif text-2xl text-bronze-dark">Şans Çarkı</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-bronze/15 px-2 py-1 text-xs text-bronze/70"
          >
            Kapat
          </button>
        </div>

        <p className="mt-3 text-sm text-bronze/75">
          Çarkıfelek, toplam {status?.requiredSpend || 5000} TL ve üzeri alışveriş yapan üyelere özeldir.
        </p>

        <div className="mt-4 flex justify-center">
          <SpinWheelVisual labels={wheelLabels} rotationDeg={rotationDeg} isAnimating={isAnimating} />
        </div>

        {uniqueLegend.length > 0 ? (
          <div className="mt-3 rounded-lg border border-bronze/10 bg-ivory-warm/90 px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-bronze/55">Çarktaki ödüller</p>
            {typeof status?.segmentsPerPrize === 'number' && status.segmentsPerPrize > 1 ? (
              <p className="mt-1 text-[11px] text-bronze/60">
                Her kupon türü çarkta <strong>{status.segmentsPerPrize}</strong> dilimde yer alır (şans eşit dağılsın
                diye).
              </p>
            ) : null}
            <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-bronze/85">
              {uniqueLegend.map((label) => (
                <li key={label} className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#5B1F2A]" aria-hidden />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-4 rounded-xl border border-bronze/15 bg-ivory-warm p-4">
          {!status ? (
            <p className="text-sm text-bronze/70">Yükleniyor...</p>
          ) : status.reward ? (
            <p className="text-sm text-bronze/80">
              Kuponun hazır: <strong>{status.reward.code}</strong> ({status.reward.label})
            </p>
          ) : status.authenticated ? (
            <p className="text-sm text-bronze/80">
              Mevcut toplam harcama: <strong>{status.totalSpend.toLocaleString('tr-TR')} TL</strong>
              {spendRemaining > 0 ? ` • Sonraki eşik için kalan: ${spendRemaining.toLocaleString('tr-TR')} TL` : ''}
              {` • Kalan hak: ${status.remainingSpins}`}
            </p>
          ) : (
            <p className="text-sm text-bronze/80">Çarkıfeleği kullanmak için hesabına giriş yapman gerekiyor.</p>
          )}
        </div>

        <p className="mt-3 text-xs text-bronze/60">Kazandığınız kupon sadece hesabınızda gösterilir.</p>

        {message ? (
          <p className="mt-3 rounded-md border border-bronze/15 bg-white px-3 py-2 text-sm text-bronze/80">
            {message}
          </p>
        ) : null}

        <div className="mt-4 flex gap-2">
          {status?.authenticated ? (
            <button
              type="button"
              onClick={handleSpin}
              disabled={isLoading || status.remainingSpins <= 0 || !status.eligible || status.rewardSlots <= 0}
              className="flex-1 rounded-lg bg-[#5B1F2A] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4a1822] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status.rewardSlots <= 0
                ? 'Kupon Hazırlanıyor'
                : !status.eligible
                  ? 'Henüz Uygun Değil'
                  : status.remainingSpins <= 0
                    ? 'Kullanıldı'
                    : isLoading
                      ? 'Çevriliyor...'
                      : 'Çarkı Çevir'}
            </button>
          ) : (
            <Link
              href="/giris"
              onClick={onClose}
              className="flex-1 rounded-lg bg-[#5B1F2A] px-4 py-2.5 text-center text-sm font-medium text-white"
            >
              Giriş Yap
            </Link>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-bronze/20 px-4 py-2.5 text-sm text-bronze"
          >
            Daha Sonra
          </button>
        </div>
      </div>
    </div>
  )
}
