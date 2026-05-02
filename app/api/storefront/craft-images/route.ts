import { NextResponse } from 'next/server'
import { getCollections } from '@/lib/shopify/services'

type CraftTarget = {
  key: string
  aliases: string[]
  titleKeywords: string[]
}

const TARGETS: CraftTarget[] = [
  {
    key: 'deri-ornekleri',
    aliases: ['deri-ornekleri', 'deri-ornekleri-1', 'deri'],
    titleKeywords: ['deri', 'ornek'],
  },
  {
    key: 'cuzdan-kartlik',
    aliases: ['cuzdan-kartlik', 'cuzdan-ve-kartliklar', 'cuzdan-kartliklar'],
    titleKeywords: ['cuzdan', 'kartlik'],
  },
  {
    key: 'gabardin-kumaslari',
    aliases: ['gabardin-kumaslari'],
    titleKeywords: ['gabardin', 'kumas'],
  },
  {
    key: 'taraklar',
    aliases: ['taraklar', 'tarak'],
    titleKeywords: ['tarak'],
  },
  {
    key: 'aksesuarlar',
    aliases: ['aksesuarlar', 'aksesuar'],
    titleKeywords: ['aksesuar'],
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
    const collections = await getCollections(120)
    const craftImages = TARGETS.reduce<Record<string, { imageUrl: string | null; imageAlt: string }>>(
      (acc, target) => {
        const aliases = target.aliases.map(normalize)
        const exact = collections.find((collection) => aliases.includes(normalize(collection.handle)))
        const byTitle =
          exact ||
          collections.find((collection) => {
            const title = normalize(collection.title)
            return target.titleKeywords.every((keyword) => title.includes(normalize(keyword)))
          })

        const match = byTitle || exact
        acc[target.key] = {
          imageUrl: match?.image?.url || null,
          imageAlt: match?.image?.altText || match?.title || target.key,
        }
        return acc
      },
      {}
    )

    return NextResponse.json(
      { craftImages },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Failed to load craft images', error)
    return NextResponse.json({ craftImages: {} }, { status: 200 })
  }
}
