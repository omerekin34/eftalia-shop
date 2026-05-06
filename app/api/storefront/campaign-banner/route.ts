import { NextResponse } from 'next/server'
import { getShopCampaignBannerConfigFromMetafield } from '@/lib/shopify-admin'
import type { CampaignBannerConfig } from '@/lib/shopify-admin'

function readEnvFallback(): CampaignBannerConfig {
  const enabled = String(process.env.NEXT_PUBLIC_CAMPAIGN_BAR_ENABLED || '').trim() === '1'
  const message = String(process.env.NEXT_PUBLIC_CAMPAIGN_BAR_MESSAGE || '').trim()
  const messagesRaw = String(process.env.NEXT_PUBLIC_CAMPAIGN_BAR_MESSAGES || '').trim()
  const countdownTitle = String(process.env.NEXT_PUBLIC_CAMPAIGN_BAR_COUNTDOWN_TITLE || '').trim()
  const endAtIso = String(process.env.NEXT_PUBLIC_CAMPAIGN_BAR_END_AT || '').trim()
  const ctaLabel = String(process.env.NEXT_PUBLIC_CAMPAIGN_BAR_CTA_LABEL || '').trim()
  const ctaActionRaw = String(process.env.NEXT_PUBLIC_CAMPAIGN_BAR_CTA_ACTION || '').trim()
  const ctaHref = String(process.env.NEXT_PUBLIC_CAMPAIGN_BAR_CTA_HREF || '').trim()
  const ctaAction = ctaActionRaw === 'spin-wheel' ? 'spin-wheel' : ctaActionRaw === 'link' ? 'link' : undefined

  const messages = messagesRaw
    ? messagesRaw
        .split('||')
        .map((item) => item.trim())
        .filter(Boolean)
    : []

  return {
    enabled,
    message,
    messages,
    countdownTitle: countdownTitle || 'Fırsat bitimine',
    endAtIso,
    ctaLabel,
    ctaAction,
    ctaHref,
  }
}

function normalizePayload(input: {
  enabled?: boolean
  message?: string
  messages?: string[]
  countdownTitle?: string
  endAtIso?: string
  ctaLabel?: string
  ctaAction?: 'spin-wheel' | 'link'
  ctaHref?: string
}) {
  const parsedDate = input.endAtIso ? new Date(input.endAtIso) : null
  const hasValidDate = Boolean(parsedDate && !Number.isNaN(parsedDate.getTime()))

  const messageList = Array.isArray(input.messages)
    ? input.messages.map((item) => String(item).trim()).filter(Boolean)
    : []
  const fallbackMessage = String(input.message || '').trim()
  const normalizedMessages = messageList.length
    ? messageList
    : fallbackMessage
      ? [fallbackMessage]
      : []

  return {
    enabled: Boolean(input.enabled),
    message: normalizedMessages[0] || '',
    messages: normalizedMessages,
    countdownTitle: String(input.countdownTitle || 'Fırsat bitimine'),
    endAtIso: hasValidDate ? parsedDate!.toISOString() : '',
    ctaLabel: String(input.ctaLabel || ''),
    ctaAction: input.ctaAction === 'spin-wheel' ? 'spin-wheel' : input.ctaAction === 'link' ? 'link' : '',
    ctaHref: String(input.ctaHref || ''),
  }
}

export async function GET() {
  try {
    const shopConfig = await getShopCampaignBannerConfigFromMetafield()
    const envConfig = readEnvFallback()

    const merged = normalizePayload({
      ...envConfig,
      ...(shopConfig || {}),
    })

    return NextResponse.json(merged, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Failed to load campaign banner config', error)
    return NextResponse.json(normalizePayload(readEnvFallback()), { status: 200 })
  }
}
