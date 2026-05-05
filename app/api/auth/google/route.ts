import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { customerAccessTokenCreate, customerCreate } from '@/lib/shopify'
import { translateAnyStorefrontErrorMessage } from '@/lib/storefront-error-messages-tr'

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

function deterministicGooglePassword(googleSub: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(`google:${googleSub}`).digest('hex').slice(0, 32)
}

function getGooglePasswordCandidates(googleSub: string) {
  const rawSecrets = [
    process.env.GOOGLE_OAUTH_PASSWORD_SECRET,
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    'eftalia-google-fallback',
  ]
  const uniqueSecrets = Array.from(
    new Set(
      rawSecrets
        .map((s) => String(s || '').trim())
        .filter(Boolean)
    )
  )
  return uniqueSecrets.map((secret) => deterministicGooglePassword(googleSub, secret))
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

    const passwordCandidates = getGooglePasswordCandidates(googleSub)
    const primaryPassword = passwordCandidates[0]

    for (const candidatePassword of passwordCandidates) {
      try {
        const existingToken = await customerAccessTokenCreate(email, candidatePassword)
        if (existingToken?.accessToken) {
          return setAuthCookie(NextResponse.json({ ok: true }), existingToken.accessToken)
        }
      } catch {
        // Continue trying other password candidates.
      }
    }

    if (!acceptsPolicies) {
      return NextResponse.json(
        {
          ok: false,
          code: 'POLICY_REQUIRED',
          error:
            mode === 'login'
              ? 'Bu Google hesabı ile doğrudan giriş yapılamadı. Üye Ol sekmesine geçip sözleşmeleri kabul ederek Google ile devam edin.'
              : 'Google ile devam etmek için politika metinlerini kabul etmelisiniz.',
        },
        { status: 200 }
      )
    }

    try {
      await customerCreate({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email,
        password: primaryPassword,
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
            ok: false,
            code: 'PASSWORD_LOGIN_REQUIRED',
            error:
              'Bu e-posta ile daha önce farklı bir giriş yöntemiyle hesap açılmış görünüyor. Lütfen e-posta/şifre ile giriş yapın.',
          },
          { status: 200 }
        )
      }
      throw error
    }

    const newToken = await customerAccessTokenCreate(email, primaryPassword)
    if (!newToken?.accessToken) {
      return NextResponse.json({ error: 'Google ile giriş tamamlanamadı.' }, { status: 400 })
    }

    return setAuthCookie(NextResponse.json({ ok: true }), newToken.accessToken)
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? translateAnyStorefrontErrorMessage(error.message)
            : 'Google ile giriş başarısız oldu.',
      },
      { status: 400 }
    )
  }
}
