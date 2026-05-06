'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'

type CampaignBannerResponse = {
  enabled: boolean
  message: string
  messages?: string[]
  countdownTitle: string
  endAtIso: string
  ctaLabel: string
  ctaAction: '' | 'spin-wheel' | 'link'
  ctaHref: string
}

function formatParts(msLeft: number) {
  const totalSeconds = Math.max(0, Math.floor(msLeft / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds }
}

function Pill({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white/95">
      <strong className="text-xs">{String(value).padStart(2, '0')}</strong>
      <span className="text-[9px] text-white/70">{label}</span>
    </span>
  )
}

export function CampaignCountdownBar() {
  const [config, setConfig] = useState<CampaignBannerResponse | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/storefront/campaign-banner', { cache: 'no-store' })
        if (!response.ok) return
        const data = (await response.json()) as CampaignBannerResponse
        setConfig(data)
      } catch {
        setConfig(null)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const messages = useMemo(() => {
    if (!config) return []
    const list = Array.isArray(config.messages)
      ? config.messages.map((item) => String(item).trim()).filter(Boolean)
      : []
    if (list.length) return list
    const single = String(config.message || '').trim()
    return single ? [single] : []
  }, [config])

  useEffect(() => {
    setMessageIndex(0)
  }, [messages.length])

  useEffect(() => {
    if (messages.length <= 1) return
    const timer = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [messages])

  const endTime = useMemo(() => {
    if (!config?.endAtIso) return null
    const parsed = new Date(config.endAtIso).getTime()
    return Number.isFinite(parsed) ? parsed : null
  }, [config?.endAtIso])

  if (!config?.enabled) return null

  const msLeft = endTime ? endTime - now : 0
  const countdown = formatParts(msLeft)
  const activeMessage = messages[messageIndex] || ''

  const handleSpinClick = () => {
    window.dispatchEvent(new CustomEvent('eftalia:open-spin-wheel'))
  }

  return (
    <div className="border-b border-white/15 bg-black text-white">
      <div className="mx-auto flex min-h-12 max-w-7xl flex-wrap items-center justify-center gap-3 px-3 py-2 text-center">
        <div className="relative min-w-[280px] overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={`${messageIndex}-${activeMessage}`}
              initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(3px)' }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="text-center text-[12px] font-semibold tracking-[0.1em] text-white/95"
            >
              {activeMessage}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          {endTime && msLeft > 0 ? (
            <>
              <span className="hidden text-[10px] uppercase tracking-[0.12em] text-white/70 sm:inline">
                {config.countdownTitle}
              </span>
              <div className="flex items-center gap-1">
                <Pill label="Gün" value={countdown.days} />
                <Pill label="Saat" value={countdown.hours} />
                <Pill label="Dk" value={countdown.minutes} />
                <Pill label="Sn" value={countdown.seconds} />
              </div>
            </>
          ) : null}

          {config.ctaLabel ? (
            config.ctaAction === 'spin-wheel' ? (
              <button
                type="button"
                onClick={handleSpinClick}
                className="rounded border border-white/35 px-2 py-1 text-[10px] font-semibold tracking-[0.12em] text-white transition-colors hover:bg-white hover:text-black"
              >
                {config.ctaLabel}
              </button>
            ) : config.ctaAction === 'link' && config.ctaHref ? (
              <Link
                href={config.ctaHref}
                className="rounded border border-white/35 px-2 py-1 text-[10px] font-semibold tracking-[0.12em] text-white transition-colors hover:bg-white hover:text-black"
              >
                {config.ctaLabel}
              </Link>
            ) : null
          ) : null}
        </div>
      </div>
    </div>
  )
}
