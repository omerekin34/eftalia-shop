import { NextResponse } from 'next/server'
import { customerAccessTokenCreate, customerCreate } from '@/lib/shopify'
import { checkRateLimit, getRequestIp, validateStrongPassword } from '@/lib/auth-security'
import { normalizePhoneForShopify } from '@/lib/phone-shopify'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

export async function POST(request: Request) {
  try {
    const ip = getRequestIp(request)
    const limiter = await checkRateLimit({
      key: `auth:register:${ip}`,
      limit: 5,
      windowMs: 15 * 60 * 1000,
    })
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: 'Çok fazla üyelik denemesi yapıldı. Lütfen daha sonra tekrar deneyin.' },
        {
          status: 429,
          headers: { 'Retry-After': String(limiter.retryAfterSeconds) },
        }
      )
    }

    const body = (await request.json()) as {
      firstName?: string
      lastName?: string
      email?: string
      password?: string
      phone?: string
      acceptsPolicies?: boolean
    }

    const firstName = String(body?.firstName || '').trim()
    const lastName = String(body?.lastName || '').trim()
    const email = String(body?.email || '').trim()
    const password = String(body?.password || '').trim()
    const phone = String(body?.phone || '').trim()
    const normalizedPhone = normalizePhoneForShopify(phone)
    const acceptsPolicies = Boolean(body?.acceptsPolicies)

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'Ad, soyad, e-posta ve şifre zorunludur.' }, { status: 400 })
    }
    const passwordCheck = validateStrongPassword(password)
    if (!passwordCheck.valid) {
      return NextResponse.json({ error: passwordCheck.message }, { status: 400 })
    }
    if (!acceptsPolicies) {
      return NextResponse.json(
        { error: 'Üyelik için Gizlilik Politikası, Şartlar ve İade Politikası onayı gereklidir.' },
        { status: 400 }
      )
    }

    await customerCreate({
      firstName,
      lastName,
      email,
      password,
      ...(normalizedPhone ? { phone: normalizedPhone } : {}),
      acceptsMarketing: true,
    })

    const token = await customerAccessTokenCreate(email, password)
    if (!token?.accessToken) {
      return NextResponse.json({ error: 'Üyelik oluşturuldu fakat giriş yapılamadı.' }, { status: 400 })
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
    return NextResponse.json({ error: 'Üyelik oluşturulamadı.' }, { status: 400 })
  }
}
