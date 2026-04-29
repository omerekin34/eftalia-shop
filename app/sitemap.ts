import type { MetadataRoute } from 'next'
import { getProducts } from '@/lib/shopify'

function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configuredUrl) return configuredUrl.replace(/\/+$/, '')
  return 'http://localhost:3000'
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/tum-urunler',
    '/hakkimizda',
    '/iletisim',
    '/lookbook',
    '/gizlilik-politikasi',
    '/sartlar',
    '/iade',
    '/kargo',
    '/cerez-politikasi',
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))

  try {
    const products = await getProducts(250)
    const productRoutes: MetadataRoute.Sitemap = products
      .filter((product: { slug?: string }) => Boolean(product.slug))
      .map((product: { slug: string }) => ({
        url: `${siteUrl}/product/${product.slug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      }))

    return [...staticRoutes, ...productRoutes]
  } catch {
    return staticRoutes
  }
}
