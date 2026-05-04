/**
 * Limits which reset URLs we pass to Shopify (defense in depth; mutation is server-side).
 * Include your public storefront domain if Shopify sends links on a custom host.
 */
export function isAllowedShopifyPasswordResetUrl(resetUrl: string): boolean {
  let url: URL
  try {
    url = new URL(resetUrl.trim())
  } catch {
    return false
  }
  if (url.protocol !== 'https:') return false

  const host = url.hostname.toLowerCase()
  const shopDomain = (process.env.SHOPIFY_STORE_DOMAIN || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .replace(/^www\./, '')

  if (shopDomain && host === shopDomain) return true
  if (host.endsWith('.myshopify.com')) return true

  const extras = (process.env.SHOPIFY_PASSWORD_RESET_ALLOWED_HOSTS || '')
    .split(',')
    .map((h) => h.trim().toLowerCase().replace(/^www\./, ''))
    .filter(Boolean)
  if (extras.includes(host)) return true

  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').trim()
  if (site) {
    try {
      const normalized = site.startsWith('http') ? site : `https://${site}`
      const allowedHost = new URL(normalized).hostname.toLowerCase().replace(/^www\./, '')
      if (host.replace(/^www\./, '') === allowedHost) return true
    } catch {
      /* noop */
    }
  }

  return false
}
