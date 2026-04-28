import { NextResponse } from 'next/server'
import { getShopRefundPolicy } from '@/lib/shopify'

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
    const policy = await getShopRefundPolicy()
    const excerpt = policy?.body ? htmlToPlainText(policy.body).slice(0, 260) : ''

    return NextResponse.json(
      {
        refundPolicy: policy
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
    console.error('Failed to load refund policy', error)
    return NextResponse.json({ refundPolicy: null }, { status: 200 })
  }
}
