import { NextResponse } from 'next/server'
import { mergeStorePolicyClaims } from '@/lib/policy-claims'
import { getShopPolicyClaimsFromMetafield } from '@/lib/shopify-admin'

export async function GET() {
  try {
    const shopClaims = await getShopPolicyClaimsFromMetafield()
    const claims = mergeStorePolicyClaims(shopClaims)
    return NextResponse.json(claims, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json(mergeStorePolicyClaims(), { status: 200 })
  }
}
