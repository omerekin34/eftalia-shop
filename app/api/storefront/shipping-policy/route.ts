import { NextResponse } from 'next/server'
import { getShopShippingPolicy } from '@/lib/shopify'

function htmlToPlainText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export async function GET() {
  try {
    const policy = await getShopShippingPolicy()
    const excerpt = policy?.body ? htmlToPlainText(policy.body).slice(0, 260) : ''

    return NextResponse.json(
      {
        shippingPolicy: policy
          ? {
              title: policy.title,
              url: policy.url,
              excerpt,
            }
          : null,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Failed to load shipping policy', error)
    return NextResponse.json({ shippingPolicy: null }, { status: 200 })
  }
}
