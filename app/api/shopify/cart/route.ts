import { NextRequest, NextResponse } from 'next/server'
import {
  addCartLines,
  createCart,
  getCart,
  removeCartLines,
  updateCartLines,
} from '@/lib/shopify/services'

export async function GET(request: NextRequest) {
  try {
    const cartId = request.nextUrl.searchParams.get('cartId')
    if (!cartId) {
      return NextResponse.json({ error: 'cartId is required' }, { status: 400 })
    }
    const cart = await getCart(cartId)
    return NextResponse.json({ cart })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as
      | { action: 'create'; lines?: Array<{ merchandiseId: string; quantity: number }> }
      | { action: 'add'; cartId: string; lines: Array<{ merchandiseId: string; quantity: number }> }
      | { action: 'update'; cartId: string; lines: Array<{ id: string; quantity: number }> }
      | { action: 'remove'; cartId: string; lineIds: string[] }

    if (body.action === 'create') {
      const cart = await createCart(body.lines, { buyerCountryCode: 'TR' })
      return NextResponse.json({ cart })
    }

    if (body.action === 'add') {
      const cart = await addCartLines(body.cartId, body.lines)
      return NextResponse.json({ cart })
    }

    if (body.action === 'update') {
      const cart = await updateCartLines(body.cartId, body.lines)
      return NextResponse.json({ cart })
    }

    if (body.action === 'remove') {
      const cart = await removeCartLines(body.cartId, body.lineIds)
      return NextResponse.json({ cart })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
