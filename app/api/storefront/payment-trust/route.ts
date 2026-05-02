import { NextResponse } from 'next/server'
import { getShopPaymentTrustBadges } from '@/lib/shopify'

export async function GET() {
  try {
    const badges = await getShopPaymentTrustBadges()
    return NextResponse.json(
      { badges },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch {
    return NextResponse.json(
      { badges: ['VISA', 'MASTERCARD', 'AMERICAN_EXPRESS', 'APPLE_PAY', 'GOOGLE_PAY'] },
      { status: 200 }
    )
  }
}
