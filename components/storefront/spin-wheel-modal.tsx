'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Reward = { code: string; label: string }
const SPIN_THRESHOLDS = [5000]

type SpinStatus = {
  authenticated: boolean
  eligible: boolean
  totalSpend: number
  requiredSpend: number
  rewardSlots: number
  availableSpins: number
  usedSpins: number
  remainingSpins: number
  alreadyUsed: boolean
  reward: Reward | null
  rewardsWon?: Reward[]
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
      const nextRotation = rotationDeg + 1440 + pointerCompensation

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

  const wheelSlices = Math.max(1, Number(status?.rewardSlots || 1))
  const wheelBackground = wheelSlices
      ? `conic-gradient(${Array.from({ length: wheelSlices })
        .map((_, index) => {
          const from = (index * 360) / wheelSlices
          const to = ((index + 1) * 360) / wheelSlices
          const palette = ['#5B1F2A', '#7A4A21', '#9B7A57', '#B68A5E', '#4A1822']
          const color = palette[index % palette.length]
          return `${color} ${from}deg ${to}deg`
        })
        .join(', ')})`
    : '#5B1F2A'

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
          <div className="relative h-52 w-52">
            <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
              <div className="h-0 w-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-[#4a1822]" />
            </div>
            <div
              className="absolute inset-0 rounded-full border-4 border-[#f0dbc0] shadow-[0_10px_30px_-16px_rgba(83,58,39,0.65)]"
              style={{
                background: wheelBackground,
                transform: `rotate(${rotationDeg}deg)`,
                transition: isAnimating ? 'transform 4.2s cubic-bezier(0.17, 0.67, 0.2, 1)' : 'none',
              }}
            />
            <div className="absolute inset-[30%] flex items-center justify-center rounded-full border border-white/50 bg-white/85 text-center text-xs font-semibold text-[#5B1F2A]">
              ŞANS
              <br />
              ÇARKI
            </div>
          </div>
        </div>

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

        <p className="mt-3 text-xs text-bronze/60">
          Kazandığınız kupon sadece hesabınızda gösterilir.
        </p>

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
