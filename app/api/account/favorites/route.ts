import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCustomerFavorites, setCustomerFavorites } from '@/lib/shopify'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 })
    }

    const favorites = await getCustomerFavorites(token)
    return NextResponse.json({ favorites })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Favoriler alınamadı.' },
      { status: 400 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 })
    }

    const body = (await request.json()) as { favorites?: unknown[] }
    if (!Array.isArray(body.favorites)) {
      return NextResponse.json({ error: 'Geçersiz favori listesi.' }, { status: 400 })
    }

    await setCustomerFavorites(token, body.favorites)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Favoriler kaydedilemedi.' },
      { status: 400 }
    )
  }
}
