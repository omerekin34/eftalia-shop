import { NextResponse } from 'next/server'
import { getCollections } from '@/lib/shopify/services'

const TARGET_COLLECTIONS: Array<{
  key: string
  aliases: string[]
  titleKeywords: string[]
}> = [
  {
    key: 'makyaj-cantasi',
    aliases: ['makyaj-cantasi', 'makyaj-cantalari', 'makyaj-cantasi-1'],
    titleKeywords: ['makyaj', 'canta'],
  },
  {
    key: 'el-cantasi',
    aliases: ['el-cantasi', 'el-cantalari'],
    titleKeywords: ['el', 'canta'],
  },
  {
    key: 'omuz-cantasi',
    aliases: ['omuz-cantasi', 'omuz-cantalari'],
    titleKeywords: ['omuz', 'canta'],
  },
  {
    key: 'spor-cantasi',
    aliases: ['spor-cantasi', 'spor-cantalari'],
    titleKeywords: ['spor', 'canta'],
  },
]

function normalize(value: string) {
  return String(value || '')
    .toLocaleLowerCase('tr')
    .replaceAll('ç', 'c')
    .replaceAll('ğ', 'g')
    .replaceAll('ı', 'i')
    .replaceAll('ö', 'o')
    .replaceAll('ş', 's')
    .replaceAll('ü', 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET() {
  try {
    const collections = await getCollections(100)
    const categoryImages = TARGET_COLLECTIONS.reduce<Record<string, { imageUrl: string | null; imageAlt: string }>>(
      (acc, target) => {
        const normalizedAliases = target.aliases.map(normalize)
        const exactMatch = collections.find((collection) =>
          normalizedAliases.includes(normalize(collection.handle))
        )
        const keywordMatch =
          exactMatch ||
          collections.find((collection) => {
            const title = normalize(collection.title)
            return target.titleKeywords.every((keyword) => title.includes(normalize(keyword)))
          })

        const match = keywordMatch || exactMatch
        acc[target.key] = {
          imageUrl: match?.image?.url || null,
          imageAlt: match?.image?.altText || match?.title || target.key,
        }
        return acc
      },
      {}
    )

    return NextResponse.json(
      { categoryImages },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Failed to load storefront category images', error)
    return NextResponse.json({ categoryImages: {} }, { status: 200 })
  }
}
