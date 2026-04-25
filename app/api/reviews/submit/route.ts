import { NextResponse } from 'next/server'

const JUDGEME_API_BASE = (process.env.JUDGEME_API_BASE || 'https://api.judge.me/api/v1').replace(/\/$/, '')
const JUDGEME_API_URL = `${JUDGEME_API_BASE}/reviews`
const SHOP_DOMAIN = process.env.JUDGEME_SHOP_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN || ''
const PUBLIC_TOKEN = process.env.JUDGEME_PUBLIC_TOKEN || ''

function toNumericProductId(rawId: string) {
  const value = String(rawId || '').trim()
  if (!value) return ''
  if (/^\d+$/.test(value)) return value

  // Shopify GID format: gid://shopify/Product/123456789
  const gidMatch = value.match(/\/(\d+)$/)
  if (gidMatch?.[1]) return gidMatch[1]

  // fallback: take only digits if any
  const digits = value.replace(/\D/g, '')
  return digits || ''
}

export async function POST(request: Request) {
  try {
    const incoming = (await request.json()) as {
      id?: string
      name?: string
      email?: string
      rating?: number | string
      title?: string
      body?: string
    }

    const numericProductId = toNumericProductId(String(incoming?.id || ''))

    if (!SHOP_DOMAIN || !PUBLIC_TOKEN) {
      return NextResponse.json(
        { error: 'Judge.me yapılandırması eksik (JUDGEME_SHOP_DOMAIN / JUDGEME_PUBLIC_TOKEN).' },
        { status: 500 }
      )
    }

    const payload = {
      shop_domain: SHOP_DOMAIN,
      platform: 'shopify',
      id: numericProductId,
      public_token: PUBLIC_TOKEN,
      name: String(incoming?.name || '').trim(),
      email: String(incoming?.email || '').trim(),
      rating: Number(incoming?.rating || 0),
      title: String(incoming?.title || '').trim(),
      body: String(incoming?.body || '').trim(),
    }

    if (!payload.id || !payload.name || !payload.email || !payload.rating || !payload.body) {
      return NextResponse.json({ error: 'Eksik yorum alanı gönderildi.' }, { status: 400 })
    }

    const response = await fetch(JUDGEME_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const text = await response.text()
    if (!response.ok) {
      const prettyMessage = text.includes('Id should be numeric')
        ? 'Ürün kimliği formatı geçersiz. Lütfen tekrar deneyin.'
        : text || 'Judge.me servisine gönderim başarısız.'
      return NextResponse.json(
        { error: prettyMessage },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true, response: text })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Yorum gönderilemedi.' },
      { status: 400 }
    )
  }
}
