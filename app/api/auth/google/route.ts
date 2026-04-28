import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { customerAccessTokenCreate, customerCreate } from '@/lib/shopify'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

function setAuthCookie(response: NextResponse, accessToken: string) {
  response.cookies.set(AUTH_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}

function deterministicGooglePassword(googleSub: string) {
  const secret = process.env.GOOGLE_OAUTH_PASSWORD_SECRET || process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || 'eftalia-google-fallback'
  return crypto.createHmac('sha256', secret).update(`google:${googleSub}`).digest('hex').slice(0, 32)
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      credential?: string
      acceptsPolicies?: boolean
      mode?: 'login' | 'register'
    }
    const credential = String(body?.credential || '').trim()
    const acceptsPolicies = Boolean(body?.acceptsPolicies)
    const mode = body?.mode === 'register' ? 'register' : 'login'
    const clientId = String(process.env.GOOGLE_CLIENT_ID || '').trim()

    if (!credential) {
      return NextResponse.json({ error: 'Google kimlik doğrulama verisi eksik.' }, { status: 400 })
    }
    if (!clientId) {
      return NextResponse.json({ error: 'Google Client ID yapılandırılmamış.' }, { status: 500 })
    }

    const client = new OAuth2Client(clientId)
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    })
    const payload = ticket.getPayload()

    const email = String(payload?.email || '').trim()
    const emailVerified = Boolean(payload?.email_verified)
    const googleSub = String(payload?.sub || '').trim()
    const firstName = String(payload?.given_name || '').trim()
    const lastName = String(payload?.family_name || '').trim()

    if (!email || !googleSub) {
      return NextResponse.json({ error: 'Google hesabından e-posta bilgisi alınamadı.' }, { status: 400 })
    }
    if (!emailVerified) {
      return NextResponse.json({ error: 'Google hesabınızın e-posta doğrulaması gerekli.' }, { status: 400 })
    }

    const generatedPassword = deterministicGooglePassword(googleSub)

    try {
      const existingToken = await customerAccessTokenCreate(email, generatedPassword)
      if (existingToken?.accessToken) {
        return setAuthCookie(NextResponse.json({ ok: true }), existingToken.accessToken)
      }
    } catch {
      // Customer may not exist yet or password mismatch.
    }

    if (mode === 'login') {
      return NextResponse.json(
        {
          error:
            'Bu Google hesabı ile doğrudan giriş yapılamadı. Hesabınız daha önce e-posta/şifre ile açıldıysa önce normal giriş yapıp profil ekranından Google hesabınızı bağlayın; ilk kez kayıt olacaksanız "Üye Ol" sekmesine geçin.',
        },
        { status: 400 }
      )
    }

    if (!acceptsPolicies) {
      return NextResponse.json(
        { error: 'Google ile devam etmek için politika metinlerini kabul etmelisiniz.' },
        { status: 400 }
      )
    }

    try {
      await customerCreate({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email,
        password: generatedPassword,
        acceptsMarketing: true,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      const normalized = message.toLocaleLowerCase('tr')
      if (
        normalized.includes('already') ||
        normalized.includes('taken') ||
        normalized.includes('zaten alınmış') ||
        normalized.includes('zaten alinmis') ||
        normalized.includes('mevcut')
      ) {
        return NextResponse.json(
          {
            error:
              'Bu e-posta ile daha önce klasik üyelik açılmış görünüyor. Önce e-posta/şifre ile giriş yapıp hesap ekranından Google hesabınızı bağlayın.',
          },
          { status: 400 }
        )
      }
      throw error
    }

    const newToken = await customerAccessTokenCreate(email, generatedPassword)
    if (!newToken?.accessToken) {
      return NextResponse.json({ error: 'Google ile giriş tamamlanamadı.' }, { status: 400 })
    }

    return setAuthCookie(NextResponse.json({ ok: true }), newToken.accessToken)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Google ile giriş başarısız oldu.' },
      { status: 400 }
    )
  }
}
