/**
 * Shopify hosted checkout için dil tercihi.
 * Admin'de Türkçe dilinin eklenip yayınlanmış olması gerekir (Ayarlar → Diller).
 * @see https://help.shopify.com/manual/checkout-settings/checkout-language
 */
export function withCheckoutLocale(checkoutUrl: string, locale = 'tr'): string {
  try {
    const url = new URL(checkoutUrl)
    url.searchParams.set('locale', locale)
    return url.toString()
  } catch {
    const sep = checkoutUrl.includes('?') ? '&' : '?'
    return `${checkoutUrl}${sep}locale=${encodeURIComponent(locale)}`
  }
}
