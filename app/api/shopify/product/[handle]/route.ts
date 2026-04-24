import { NextRequest, NextResponse } from 'next/server'
import { getProductByHandle } from '@/lib/shopify/services'

type RouteContext = {
  params: Promise<{ handle: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { handle } = await context.params
    const product = await getProductByHandle(handle)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
