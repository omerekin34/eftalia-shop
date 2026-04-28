import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { OAuth2Client } from 'google-auth-library'
import { customerUpdate, getCustomerByAccessToken } from '@/lib/shopify'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

function deterministicGooglePassword(googleSub: string) {
  const secret =
    process.env.GOOGLE_OAUTH_PASSWORD_SECRET ||
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
    'eftalia-google-fallback'
  return crypto.createHmac('sha256', secret).update(`google:${googleSub}`).digest('hex').slice(0, 32)
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'Google hesabı bağlamak için giriş yapmalısınız.' }, { status: 401 })
    }

    const body = (await request.json()) as { credential?: string }
    const credential = String(body?.credential || '').trim()
    const clientId = String(process.env.GOOGLE_CLIENT_ID || '').trim()

    if (!credential) {
      return NextResponse.json({ error: 'Google kimlik doğrulama verisi eksik.' }, { status: 400 })
    }
    if (!clientId) {
      return NextResponse.json({ error: 'Google Client ID yapılandırılmamış.' }, { status: 500 })
    }

    const signedInCustomer = await getCustomerByAccessToken(token)
    const customerEmail = String(signedInCustomer?.email || '').trim().toLowerCase()
    if (!customerEmail) {
      return NextResponse.json({ error: 'Hesap bilgisi doğrulanamadı.' }, { status: 401 })
    }

    const client = new OAuth2Client(clientId)
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    })
    const payload = ticket.getPayload()
    const googleEmail = String(payload?.email || '').trim().toLowerCase()
    const googleSub = String(payload?.sub || '').trim()
    const emailVerified = Boolean(payload?.email_verified)

    if (!googleEmail || !googleSub || !emailVerified) {
      return NextResponse.json({ error: 'Google hesabı doğrulanamadı.' }, { status: 400 })
    }
    if (googleEmail !== customerEmail) {
      return NextResponse.json(
        { error: 'Google hesabı e-postası, mevcut üyelik e-postanız ile aynı olmalıdır.' },
        { status: 400 }
      )
    }

    const generatedPassword = deterministicGooglePassword(googleSub)
    await customerUpdate(token, { password: generatedPassword })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Google hesabı bağlanamadı.' },
      { status: 400 }
    )
  }
}
