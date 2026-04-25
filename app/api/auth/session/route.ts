import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCustomerByAccessToken } from '@/lib/shopify'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.json({ authenticated: false, customer: null })
  }

  try {
    const customer = await getCustomerByAccessToken(token)
    if (!customer) {
      const response = NextResponse.json({ authenticated: false, customer: null })
      response.cookies.set(AUTH_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      })
      return response
    }

    return NextResponse.json({ authenticated: true, customer })
  } catch {
    const response = NextResponse.json({ authenticated: false, customer: null })
    response.cookies.set(AUTH_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    return response
  }
}
