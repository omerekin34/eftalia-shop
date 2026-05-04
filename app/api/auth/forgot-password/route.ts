import { NextResponse } from 'next/server'
import { customerRecover } from '@/lib/shopify'

const GENERIC_OK_MESSAGE =
  'Bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı kısa süre içinde gönderilir. Gelen kutunuzu ve gerekiyorsa spam klasörünü kontrol edin.'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string }
    const email = String(body?.email || '').trim().toLowerCase()
    if (!email) {
      return NextResponse.json({ error: 'E-posta adresi zorunludur.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 })
    }

    await customerRecover(email)

    return NextResponse.json({ ok: true, message: GENERIC_OK_MESSAGE })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'İşlem tamamlanamadı.' },
      { status: 400 }
    )
  }
}
