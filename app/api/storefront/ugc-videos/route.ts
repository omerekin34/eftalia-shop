import { NextResponse } from 'next/server'
import { getUgcVideos } from '@/lib/shopify'

export async function GET() {
  try {
    const videos = await getUgcVideos(12)
    return NextResponse.json({ videos }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Failed to load UGC videos', error)
    return NextResponse.json({ videos: [] }, { status: 200 })
  }
}
