import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  createMembershipCaptchaToken,
  MEMBERSHIP_CAPTCHA_COOKIE,
} from '@/lib/membership-captcha'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

function buildCaptchaSvg(code: string) {
  const w = 200
  const h = 56
  const noise = Array.from({ length: 8 }, (_, i) => {
    const x1 = Math.random() * w
    const y1 = Math.random() * h
    const x2 = Math.random() * w
    const y2 = Math.random() * h
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#c4b5a5" stroke-width="0.8" opacity="0.45"/>`
  }).join('')
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" fill="#f5ede2"/>
  ${noise}
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Consolas,monospace" font-size="26" font-weight="700" fill="#4d3523" letter-spacing="0.12em">${escapeXml(
    code
  )}</text>
</svg>`
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 })
    }

    const { code, token: signed } = createMembershipCaptchaToken()
    const svg = buildCaptchaSvg(code)

    const res = new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
    res.cookies.set(MEMBERSHIP_CAPTCHA_COOKIE, signed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    })
    return res
  } catch {
    return NextResponse.json({ error: 'CAPTCHA oluşturulamadı.' }, { status: 500 })
  }
}
