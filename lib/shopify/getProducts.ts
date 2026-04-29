export interface ProductCardModel {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  discount?: number
  images: string[]
  category: string
  subcategory: string
  colors: { name: string; hex: string }[]
  tags?: string[]
  collections?: Array<{ id: string; title: string; handle: string }>
  isNew?: boolean
  isBestseller?: boolean
  inStock: boolean
  stockQuantity?: number
  colorStockByName?: Record<string, number>
}

type ShopifyProductNode = {
  id: string
  handle: string
  title: string
  description: string
  productType?: string
  tags?: string[]
  featuredImage?: { url: string } | null
  images?: { edges?: Array<{ node?: { url?: string | null } }> }
  variants?: {
    edges?: Array<{
      node?: {
        availableForSale?: boolean
        quantityAvailable?: number | null
        price?: { amount?: string }
        compareAtPrice?: { amount?: string } | null
        selectedOptions?: Array<{ name: string; value: string }>
      }
    }>
  }
}

type NormalizedApiProduct = {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  discount?: number
  images?: string[]
  category?: string
  subcategory?: string
  colors?: { name: string; hex: string }[]
  tags?: string[]
  collections?: Array<{ id: string; title: string; handle: string }>
  isNew?: boolean
  isBestseller?: boolean
  inStock?: boolean
  stockQuantity?: number
  colorStockByName?: Record<string, number>
}

const colorHexMap: Record<string, string> = {
  krem: '#F5F5DC',
  siyah: '#1a1a1a',
  antrasit: '#383838',
  vizon: '#8B7355',
  bej: '#D4C4A8',
  kahve: '#5C4033',
  pudra: '#E8D5D5',
  mint: '#98D4BB',
  taba: '#A67B5B',
}

function slugToSubcategory(handle?: string) {
  const map: Array<{ key: string; value: string }> = [
    { key: 'suet-canta', value: 'Süet Çanta' },
    { key: 'omuz-cantasi', value: 'Omuz Çantası' },
    { key: 'capraz-canta', value: 'Çapraz Çanta' },
    { key: 'baget-canta', value: 'Baget Çanta' },
    { key: 'el-cantasi', value: 'El Çantası' },
    { key: 'makyaj-cantasi', value: 'Makyaj Çantası' },
    { key: 'laptop-cantasi', value: 'Laptop Çantası' },
    { key: 'spor-cantasi', value: 'Spor Çantası' },
    { key: 'kadin-cuzdan', value: 'Kadın Cüzdan' },
    { key: 'erkek-cuzdan', value: 'Erkek Cüzdan' },
    { key: 'kartlik', value: 'Kartlık' },
    { key: 'pasaportluk', value: 'Pasaportluk' },
    { key: 'telefon-cuzdani', value: 'Telefon Cüzdanı' },
    { key: 'ahsap-tarak', value: 'Ahşap Tarak' },
    { key: 'kemik-tarak', value: 'Kemik Tarak' },
    { key: 'cep-taragi', value: 'Cep Tarağı' },
    { key: 'sac-fircasi', value: 'Saç Fırçası' },
  ]
  return map.find((item) => (handle || '').includes(item.key))?.value
}

function inferCategory(productType = '', handle = '', subcategory = '') {
  const lower = `${productType} ${handle} ${subcategory}`.toLocaleLowerCase('tr')
  if (lower.includes('cüzdan') || lower.includes('kart')) return 'cuzdan-kartlik'
  if (lower.includes('tarak') || lower.includes('fırça') || lower.includes('firca')) return 'tarak'
  return 'canta'
}

function parseColors(node: ShopifyProductNode) {
  const colorOptionValues =
    node.variants?.edges
      ?.flatMap((edge) => edge.node?.selectedOptions || [])
      .filter((option) =>
        ['color', 'renk'].includes((option.name || '').toLocaleLowerCase('tr'))
      )
      .map((option) => option.value) || []

  const unique = Array.from(new Set(colorOptionValues))
  if (!unique.length) {
    return [{ name: 'Standart', hex: '#D4C4A8' }]
  }

  return unique.map((name) => ({
    name,
    hex: colorHexMap[name.toLocaleLowerCase('tr')] || '#D4C4A8',
  }))
}

function toProductCardModel(node: ShopifyProductNode): ProductCardModel {
  const variants = node.variants?.edges?.map((edge) => edge.node).filter(Boolean) || []
  const prices = variants
    .map((variant) => Number(variant?.price?.amount || 0))
    .filter((price) => Number.isFinite(price) && price > 0)
  const comparePrices = variants
    .map((variant) => Number(variant?.compareAtPrice?.amount || 0))
    .filter((price) => Number.isFinite(price) && price > 0)

  const minPrice = prices.length ? Math.min(...prices) : 0
  const minCompareAtPrice = comparePrices.length ? Math.min(...comparePrices) : undefined
  const discount =
    minCompareAtPrice && minCompareAtPrice > minPrice
      ? Math.round(((minCompareAtPrice - minPrice) / minCompareAtPrice) * 100)
      : undefined

  const inStock = variants.some(
    (variant) =>
      Boolean(variant?.availableForSale) &&
      ((variant?.quantityAvailable ?? 1) > 0)
  )
  const stockQuantity = variants.reduce((sum, variant) => {
    if (!variant?.availableForSale) return sum
    const qty = Number(variant?.quantityAvailable ?? 0)
    return sum + (Number.isFinite(qty) && qty > 0 ? qty : 0)
  }, 0)
  const colorStockByName = variants.reduce<Record<string, number>>((acc, variant) => {
    if (!variant?.availableForSale) return acc
    const qty = Number(variant?.quantityAvailable ?? 0)
    if (!Number.isFinite(qty) || qty <= 0) return acc
    const colorOption = (variant?.selectedOptions || []).find((option) =>
      ['color', 'renk'].includes((option.name || '').toLocaleLowerCase('tr'))
    )
    const colorName = String(colorOption?.value || 'Standart').trim() || 'Standart'
    acc[colorName] = (acc[colorName] || 0) + qty
    return acc
  }, {})

  const galleryImages = (node.images?.edges || [])
    .map((edge) => edge.node?.url)
    .filter((url): url is string => Boolean(url))

  const images = Array.from(
    new Set([node.featuredImage?.url, ...galleryImages].filter(Boolean))
  ) as string[]

  const subcategory = slugToSubcategory(node.handle) || node.productType || 'Çanta'
  const category = inferCategory(node.productType || '', node.handle || '', subcategory)
  const tags = node.tags || []

  return {
    id: node.id,
    name: node.title || 'Ürün',
    slug: node.handle || '',
    price: minPrice,
    originalPrice: minCompareAtPrice,
    discount,
    images,
    category,
    subcategory,
    colors: parseColors(node),
    isNew: tags.some((tag) => ['new', 'yeni'].includes((tag || '').toLocaleLowerCase('tr'))),
    isBestseller: tags.some((tag) =>
      ['bestseller', 'çok satan', 'cok-satan', 'coksatan'].includes(
        (tag || '').toLocaleLowerCase('tr')
      )
    ),
    inStock,
    stockQuantity,
    colorStockByName,
  }
}

function isNormalizedApiProduct(
  value: ShopifyProductNode | NormalizedApiProduct
): value is NormalizedApiProduct {
  const candidate = value as Partial<NormalizedApiProduct>
  return (
    typeof candidate.slug === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.price === 'number'
  )
}

function normalizeApiProduct(product: NormalizedApiProduct): ProductCardModel {
  return {
    id: product.id,
    name: product.name || 'Ürün',
    slug: product.slug || '',
    price: Number(product.price || 0),
    originalPrice: product.originalPrice,
    discount: product.discount,
    images: product.images || [],
    category: product.category || 'canta',
    subcategory: product.subcategory || 'Ürün',
    tags: product.tags || [],
    collections: product.collections || [],
    colors:
      product.colors && product.colors.length
        ? product.colors
        : [{ name: 'Standart', hex: '#D4C4A8' }],
    isNew: Boolean(product.isNew),
    isBestseller: Boolean(product.isBestseller),
    inStock: product.inStock !== false,
    stockQuantity: Number(product.stockQuantity || 0),
    colorStockByName: product.colorStockByName || {},
  }
}

export async function getProducts(first = 100): Promise<ProductCardModel[]> {
  let lastError = 'Shopify ürünleri alınamadı.'

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(`/api/shopify/products?first=${first}`, {
      cache: 'no-store',
    })

    if (response.ok) {
  const data = (await response.json()) as {
    products?: Array<ShopifyProductNode | NormalizedApiProduct>
  }

  return (data.products || []).map((item) =>
    isNormalizedApiProduct(item) ? normalizeApiProduct(item) : toProductCardModel(item)
  )
    }

    try {
      const errorJson = (await response.json()) as { error?: string }
      if (errorJson?.error) {
        lastError = errorJson.error
      }
    } catch {
      lastError = `Shopify ürünleri alınamadı. (HTTP ${response.status})`
    }

    // Retry only for transient server/rate-limit failures.
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 3) {
      break
    }

    await new Promise((resolve) => setTimeout(resolve, attempt * 300))
  }

  throw new Error(lastError)
}
