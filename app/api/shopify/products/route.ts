import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/shopify'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const first = Number(searchParams.get('first') || 24)
    const products = await getProducts(first)
    return NextResponse.json({ products })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
