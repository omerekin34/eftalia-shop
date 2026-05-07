import { NextResponse } from 'next/server'
import { customerAccessTokenCreate } from '@/lib/shopify'
import { checkRateLimit, getRequestIp } from '@/lib/auth-security'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

export async function POST(request: Request) {
  try {
    const ip = getRequestIp(request)
    const limiter = await checkRateLimit({
      key: `auth:login:${ip}`,
      limit: 8,
      windowMs: 10 * 60 * 1000,
    })
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: 'Çok fazla giriş denemesi yapıldı. Lütfen daha sonra tekrar deneyin.' },
        {
          status: 429,
          headers: { 'Retry-After': String(limiter.retryAfterSeconds) },
        }
      )
    }

    const body = (await request.json()) as { email?: string; password?: string }
    const email = String(body?.email || '').trim()
    const password = String(body?.password || '').trim()

    if (!email || !password) {
      return NextResponse.json({ error: 'E-posta ve şifre zorunludur.' }, { status: 400 })
    }

    const token = await customerAccessTokenCreate(email, password)
    if (!token?.accessToken) {
      return NextResponse.json({ error: 'Giriş başarısız oldu.' }, { status: 401 })
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
  } catch {
    return NextResponse.json({ error: 'Giriş sırasında bir sorun oluştu.' }, { status: 400 })
  }
}
