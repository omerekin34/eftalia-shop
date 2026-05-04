import { NextResponse } from 'next/server'
import { customerResetByUrl } from '@/lib/shopify'
import { isAllowedShopifyPasswordResetUrl } from '@/lib/is-shopify-password-reset-url'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

function decodeResetUrlParam(raw: string): string {
  let out = raw.trim()
  for (let i = 0; i < 3; i += 1) {
    try {
      const next = decodeURIComponent(out)
      if (next === out) break
      out = next
    } catch {
      break
    }
  }
  return out
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { resetUrl?: string; password?: string }
    const resetUrl = decodeResetUrlParam(String(body?.resetUrl || ''))
    const password = String(body?.password || '').trim()

    if (!resetUrl || !password) {
      return NextResponse.json({ error: 'Sıfırlama bağlantısı ve yeni şifre zorunludur.' }, { status: 400 })
    }
    if (password.length < 5) {
      return NextResponse.json({ error: 'Şifre en az 5 karakter olmalıdır (Shopify kuralı).' }, { status: 400 })
    }

    if (!isAllowedShopifyPasswordResetUrl(resetUrl)) {
      return NextResponse.json(
        {
          error:
            'Sıfırlama bağlantısı bu site için doğrulanamadı. .env içinde NEXT_PUBLIC_SITE_URL veya SHOPIFY_PASSWORD_RESET_ALLOWED_HOSTS değerlerini kontrol edin.',
        },
        { status: 400 }
      )
    }

    const token = await customerResetByUrl(resetUrl, password)
    if (!token?.accessToken) {
      return NextResponse.json({ error: 'Şifre güncellenemedi.' }, { status: 400 })
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set(AUTH_COOKIE_NAME, token.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
    return response
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Şifre sıfırlanamadı.' },
      { status: 400 }
    )
  }
}
