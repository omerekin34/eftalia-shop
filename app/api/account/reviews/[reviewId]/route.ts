import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getCustomerDetails } from '@/lib/shopify'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

/** Liste `judge.me` kullanıyor; önce aynı host, sonra `api.judge.me`. İsteğe bağlı `JUDGEME_API_BASE` en başa. */
function judgeRestBases(): string[] {
  const env = (process.env.JUDGEME_API_BASE || '').trim().replace(/\/$/, '')
  const defaults = ['https://judge.me/api/v1', 'https://api.judge.me/api/v1']
  if (env && !defaults.includes(env)) return [env, ...defaults]
  return defaults
}

function judgeAuth() {
  const shopDomain = (process.env.JUDGEME_SHOP_DOMAIN || 'nwjti9-bw.myshopify.com').trim()
  const apiToken = (process.env.JUDGEME_PRIVATE_TOKEN || process.env.JUDGEME_API_TOKEN || '').trim()
  return { shopDomain, apiToken }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ reviewId: string }> }
) {
  const { reviewId } = await context.params
  const id = String(reviewId || '').trim()
  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Geçersiz yorum.' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value
  if (!accessToken) {
    return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 })
  }

  const customer = await getCustomerDetails(accessToken)
  const customerEmail = String(customer?.email || '')
    .trim()
    .toLowerCase()
  if (!customerEmail) {
    return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 })
  }

  const { shopDomain, apiToken } = judgeAuth()
  if (!apiToken) {
    return NextResponse.json({ error: 'Judge.me yapılandırması eksik.' }, { status: 500 })
  }

  const authHeaders: Record<string, string> = {
    'X-Api-Token': apiToken,
    'Content-Type': 'application/json',
  }

  const bases = judgeRestBases()

  const buildReviewUrl = (base: string) => {
    const u = new URL(`${base}/reviews/${id}`)
    u.searchParams.set('shop_domain', shopDomain)
    u.searchParams.set('api_token', apiToken)
    return u.toString()
  }

  try {
    let getOk = false
    let ownerEmail = ''
    for (const base of bases) {
      const getRes = await fetch(buildReviewUrl(base), {
        method: 'GET',
        cache: 'no-store',
        headers: { 'X-Api-Token': apiToken },
      })
      const raw = (await getRes.json().catch(() => ({}))) as Record<string, unknown>
      const review = (raw?.review as Record<string, unknown> | undefined) || raw
      const reviewer = review?.reviewer as { email?: string } | undefined
      const em = String(reviewer?.email || '')
        .trim()
        .toLowerCase()
      if (getRes.ok && em) {
        getOk = true
        ownerEmail = em
        break
      }
    }

    if (!getOk || !ownerEmail) {
      return NextResponse.json({ error: 'Yorum bulunamadı veya Judge.me yanıt vermedi.' }, { status: 404 })
    }
    if (ownerEmail !== customerEmail) {
      return NextResponse.json({ error: 'Bu yorumu kaldırma yetkiniz yok.' }, { status: 403 })
    }

    const putBodies = [{ curated: 'spam' as const }, { shop_domain: shopDomain, curated: 'spam' as const }]

    for (const base of bases) {
      const delRes = await fetch(buildReviewUrl(base), {
        method: 'DELETE',
        cache: 'no-store',
        headers: { 'X-Api-Token': apiToken },
      })
      if (delRes.ok || delRes.status === 204) {
        return NextResponse.json({ ok: true, mode: 'deleted' })
      }
    }

    let lastError = ''
    for (const base of bases) {
      const putUrl = buildReviewUrl(base)
      for (const body of putBodies) {
        const putRes = await fetch(putUrl, {
          method: 'PUT',
          cache: 'no-store',
          headers: authHeaders,
          body: JSON.stringify(body),
        })
        if (putRes.ok) {
          return NextResponse.json({ ok: true, mode: 'hidden' })
        }
        lastError = await putRes.text()
      }
    }

    return NextResponse.json(
      { error: lastError.slice(0, 220) || 'Judge.me yorumu kaldıramadı.' },
      { status: 502 }
    )
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Beklenmeyen hata.' },
      { status: 500 }
    )
  }
}
