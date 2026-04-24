import { NextRequest, NextResponse } from 'next/server'
import { getCart } from '@/lib/shopify/services'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { cartId?: string }
    if (!body.cartId) {
      return NextResponse.json({ error: 'cartId is required' }, { status: 400 })
    }

    const cart = (await getCart(body.cartId)) as { checkoutUrl?: string } | null
    if (!cart?.checkoutUrl) {
      return NextResponse.json({ error: 'Checkout URL not found' }, { status: 404 })
    }

    return NextResponse.json({ checkoutUrl: cart.checkoutUrl })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
