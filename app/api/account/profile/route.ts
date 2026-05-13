import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { customerUpdate, getCustomerDetails } from '@/lib/shopify'
import { normalizePhoneForShopify } from '@/lib/phone-shopify'
import {
  MEMBERSHIP_CAPTCHA_COOKIE,
  verifyMembershipCaptchaToken,
} from '@/lib/membership-captcha'
import {
  deleteCustomerByGidAdmin,
  setCustomerJsonMetafieldAdmin,
} from '@/lib/shopify-admin'
import { checkRateLimit, getRequestIp } from '@/lib/auth-security'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

const MAX_LEN = 240

function clip(s: string, max = MAX_LEN) {
  return String(s || '').trim().slice(0, max)
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 })
    }

    const captchaCookie = cookieStore.get(MEMBERSHIP_CAPTCHA_COOKIE)?.value
    const body = (await request.json()) as {
      firstName?: string
      lastName?: string
      phoneLocal?: string
      password?: string
      acceptsMarketing?: boolean
      captchaAnswer?: string
      membership?: {
        country?: string
        city?: string
        district?: string
        education?: string
        profession?: string
        gender?: string
        birthdate?: string
        hideBirthdate?: boolean
        smsOptIn?: boolean
      }
    }

    const captchaAnswer = String(body?.captchaAnswer || '').trim()
    if (!verifyMembershipCaptchaToken(captchaCookie, captchaAnswer)) {
      return NextResponse.json(
        { error: 'Güvenlik kodu hatalı veya süresi doldu. Lütfen yeni kod alıp tekrar deneyin.' },
        { status: 400 }
      )
    }

    const firstName = clip(body?.firstName || '', 80)
    const lastName = clip(body?.lastName || '', 80)
    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'Ad ve soyad zorunludur.' }, { status: 400 })
    }

    const normalizedPhone = normalizePhoneForShopify(String(body?.phoneLocal || '').trim())

    const m = body.membership || {}
    const genderRaw = String(m.gender || 'unspecified').toLowerCase()
    const gender =
      genderRaw === 'female' || genderRaw === 'male' || genderRaw === 'unspecified'
        ? genderRaw
        : 'unspecified'

    const membershipPayload = {
      country: clip(m.country || 'Türkiye', 80),
      city: clip(m.city || '', 80),
      district: clip(m.district || '', 80),
      education: clip(m.education || '', 80),
      profession: clip(m.profession || '', 120),
      gender,
      birthdate: m.hideBirthdate ? '' : clip(m.birthdate || '', 32),
      hideBirthdate: Boolean(m.hideBirthdate),
      smsOptIn: Boolean(m.smsOptIn),
    }

    // 1) Shopify Storefront `customerUpdate`: yalnızca desteklenen alanlar.
    const customerPayload: Record<string, unknown> = {
      firstName,
      lastName,
      acceptsMarketing: Boolean(body.acceptsMarketing),
    }
    if (normalizedPhone) {
      customerPayload.phone = normalizedPhone
    }
    if (body.password && String(body.password).trim().length > 0) {
      customerPayload.password = String(body.password).trim()
    }

    const customer = await customerUpdate(token, customerPayload)

    // 2) Müşteri metafield JSON: Storefront yazamaz, Admin metafieldsSet ile.
    const details = customer || (await getCustomerDetails(token))
    const customerGid = String(details?.id || '').trim()
    if (customerGid) {
      const metaResult = await setCustomerJsonMetafieldAdmin(
        customerGid,
        'membership_profile_v1',
        membershipPayload
      )
      if (!metaResult.ok) {
        return NextResponse.json(
          {
            error:
              'Temel bilgiler kaydedildi ancak ek profil verileri yazılamadı: ' + metaResult.error,
          },
          { status: 200 }
        )
      }
    }

    const res = NextResponse.json({ ok: true, customer })
    res.cookies.set(MEMBERSHIP_CAPTCHA_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    return res
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Profil güncellenemedi.' },
      { status: 400 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const ip = getRequestIp(request)
    const limiter = await checkRateLimit({
      key: `account:delete:${ip}`,
      limit: 3,
      windowMs: 60 * 60 * 1000,
    })
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: 'Çok fazla hesap silme denemesi. Lütfen daha sonra tekrar deneyin.' },
        { status: 429, headers: { 'Retry-After': String(limiter.retryAfterSeconds) } }
      )
    }

    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 })
    }

    const body = (await request.json().catch(() => ({}))) as {
      confirmation?: string
    }
    const details = await getCustomerDetails(token)
    if (!details?.id || !details.email) {
      return NextResponse.json({ error: 'Müşteri bilgisi alınamadı.' }, { status: 400 })
    }

    const expected = String(details.email || '').trim().toLowerCase()
    const got = String(body?.confirmation || '').trim().toLowerCase()
    if (!expected || got !== expected) {
      return NextResponse.json(
        { error: 'Hesabı silmek için e-posta adresinizi aynen yazmanız gerekir.' },
        { status: 400 }
      )
    }

    const del = await deleteCustomerByGidAdmin(details.id)
    if (!del.ok) {
      return NextResponse.json({ error: del.error }, { status: 400 })
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set(AUTH_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    res.cookies.set(MEMBERSHIP_CAPTCHA_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    return res
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Hesap silinemedi.' },
      { status: 400 }
    )
  }
}
