import { NextResponse } from 'next/server'
import { customerRecover } from '@/lib/shopify'
import { checkRateLimit, getRequestIp } from '@/lib/auth-security'

const GENERIC_OK_MESSAGE =
  'Bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı kısa süre içinde gönderilir. Gelen kutunuzu ve gerekiyorsa spam klasörünü kontrol edin.'

export async function POST(request: Request) {
  const ip = getRequestIp(request)
  const limiter = await checkRateLimit({
    key: `auth:forgot-password:${ip}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  })
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: 'Çok fazla sıfırlama talebi gönderildi. Lütfen daha sonra tekrar deneyin.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limiter.retryAfterSeconds) },
      }
    )
  }

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
  } catch {
    // Hesap var/yok bilgisini ifşa etmemek için her durumda aynı yanıt döndürülür.
    return NextResponse.json({ ok: true, message: GENERIC_OK_MESSAGE })
  }
}
