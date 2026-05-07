import { NextResponse } from 'next/server'

type SubmitBody =
  | {
      kind: 'contact'
      name?: string
      email?: string
      subject?: string
      message?: string
      company?: string
    }
  | {
      kind: 'newsletter'
      email?: string
      source?: string
    }

function resolveFormspreeEndpoint(kind: SubmitBody['kind']): string {
  if (kind === 'contact') {
    return String(
      process.env.FORMSPREE_CONTACT_ENDPOINT || process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || ''
    ).trim()
  }

  return String(
    process.env.FORMSPREE_NEWSLETTER_ENDPOINT ||
      process.env.NEXT_PUBLIC_FORMSPREE_NEWSLETTER_ENDPOINT ||
      process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ||
      ''
  ).trim()
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitBody
    const kind = body?.kind

    if (kind !== 'contact' && kind !== 'newsletter') {
      return NextResponse.json({ error: 'Geçersiz form türü.' }, { status: 400 })
    }

    const endpoint = resolveFormspreeEndpoint(kind)
    if (!endpoint) {
      return NextResponse.json({ error: 'Form servisi yapılandırılmamış.' }, { status: 500 })
    }

    const payload =
      kind === 'contact'
        ? {
            name: String(body.name || '').trim(),
            email: String(body.email || '').trim(),
            subject: String(body.subject || '').trim(),
            message: String(body.message || '').trim(),
            _gotcha: String(body.company || '').trim(),
            source: 'contact-page',
          }
        : {
            email: String(body.email || '').trim(),
            source: String(body.source || 'footer-newsletter').trim(),
          }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const data = (await response.json().catch(() => ({}))) as {
      error?: string
      errors?: Array<{ message?: string }>
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || data.errors?.[0]?.message || 'Form gönderimi başarısız.' },
        { status: response.status || 400 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Form gönderimi sırasında bir hata oluştu.' }, { status: 500 })
  }
}
