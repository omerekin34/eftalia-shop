import { NextResponse } from 'next/server'
import { customerAccessTokenCreate, customerCreate } from '@/lib/shopify'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

function normalizePhoneForShopify(rawPhone: string) {
  const value = String(rawPhone || '').trim()
  if (!value) return null

  const digits = value.replace(/\D/g, '')
  if (!digits) return null

  if (value.startsWith('+')) {
    return /^\+\d{10,15}$/.test(value) ? value : null
  }

  if (digits.startsWith('90') && digits.length === 12) {
    return `+${digits}`
  }

  if (digits.startsWith('0') && digits.length === 11) {
    return `+90${digits.slice(1)}`
  }

  if (digits.startsWith('5') && digits.length === 10) {
    return `+90${digits}`
  }

  return null
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      firstName?: string
      lastName?: string
      email?: string
      password?: string
      phone?: string
    }

    const firstName = String(body?.firstName || '').trim()
    const lastName = String(body?.lastName || '').trim()
    const email = String(body?.email || '').trim()
    const password = String(body?.password || '').trim()
    const phone = String(body?.phone || '').trim()
    const normalizedPhone = normalizePhoneForShopify(phone)

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'Ad, soyad, e-posta ve şifre zorunludur.' }, { status: 400 })
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
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Üyelik oluşturulamadı.' },
      { status: 400 }
    )
  }
}
