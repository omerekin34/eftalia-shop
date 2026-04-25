import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { customerUpdate } from '@/lib/shopify'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 })
    }

    const body = (await request.json()) as {
      firstName?: string
      lastName?: string
      phone?: string
      password?: string
    }

    const payload = {
      ...(body.firstName ? { firstName: String(body.firstName).trim() } : {}),
      ...(body.lastName ? { lastName: String(body.lastName).trim() } : {}),
      ...(body.phone ? { phone: String(body.phone).trim() } : {}),
      ...(body.password ? { password: String(body.password).trim() } : {}),
    }

    if (!Object.keys(payload).length) {
      return NextResponse.json({ error: 'Güncellenecek alan bulunamadı.' }, { status: 400 })
    }

    const customer = await customerUpdate(token, payload)
    return NextResponse.json({ ok: true, customer })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Profil güncellenemedi.' },
      { status: 400 }
    )
  }
}
