import { NextResponse } from 'next/server'
import { getCollections } from '@/lib/shopify/services'

export async function GET() {
  try {
    const collections = await getCollections(100)
    return NextResponse.json(
      {
        collections: collections.map((collection) => ({
          id: collection.id,
          name: collection.title,
          href: `/tum-urunler?kategori=${encodeURIComponent(collection.handle)}`,
        })),
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Failed to load storefront collections', error)
    return NextResponse.json({ collections: [] }, { status: 200 })
  }
}
