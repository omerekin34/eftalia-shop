import { NextResponse } from 'next/server'
import { customerAccessTokenCreate } from '@/lib/shopify'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

export async function POST(request: Request) {
  try {
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
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Giriş başarısız oldu.' },
      { status: 400 }
    )
  }
}
