import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { customerAddressCreate, customerAddressDelete, customerAddressUpdate } from '@/lib/shopify'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

async function getToken() {
  const cookieStore = await cookies()
  return cookieStore.get(AUTH_COOKIE_NAME)?.value || ''
}

export async function POST(request: Request) {
  try {
    const token = await getToken()
    if (!token) return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 })
    const address = (await request.json()) as Record<string, string>
    await customerAddressCreate(token, address)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Adres eklenemedi.' },
      { status: 400 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const token = await getToken()
    if (!token) return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 })
    const body = (await request.json()) as { id?: string; address?: Record<string, string> }
    if (!body?.id || !body?.address) {
      return NextResponse.json({ error: 'Adres güncelleme verisi eksik.' }, { status: 400 })
    }
    await customerAddressUpdate(token, body.id, body.address)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Adres güncellenemedi.' },
      { status: 400 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const token = await getToken()
    if (!token) return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 })
    const body = (await request.json()) as { id?: string }
    if (!body?.id) return NextResponse.json({ error: 'Silinecek adres bulunamadı.' }, { status: 400 })
    await customerAddressDelete(token, body.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Adres silinemedi.' },
      { status: 400 }
    )
  }
}
