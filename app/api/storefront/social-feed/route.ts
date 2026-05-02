import { NextResponse } from 'next/server'
import { getSocialFeedBundle } from '@/lib/shopify'

export async function GET() {
  try {
    const data = await getSocialFeedBundle(8)
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Failed to load social feed', error)
    return NextResponse.json(
      { instagramUrl: '', tiktokUrl: '', posts: [] },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
