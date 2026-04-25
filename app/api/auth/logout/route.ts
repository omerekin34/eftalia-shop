import { NextResponse } from 'next/server'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}
