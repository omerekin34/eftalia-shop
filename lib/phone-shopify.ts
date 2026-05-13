/** Shopify Storefront müşteri `phone` alanı için E.164 (+90…) normalizasyonu. */
export function normalizePhoneForShopify(rawPhone: string) {
  const value = String(rawPhone || '').trim()
  if (!value) return null

  const digits = value.replace(/\D/g, '')
  if (!digits) return null

  if (value.startsWith('+')) {
    return /^\+\d{10,15}$/.test(value) ? value : null
  }

  if (digits.startsWith('90') && digits.length === 12) {
    return `+${digits}`
  }

  if (digits.startsWith('0') && digits.length === 11) {
    return `+90${digits.slice(1)}`
  }

  if (digits.startsWith('5') && digits.length === 10) {
    return `+90${digits}`
  }

  return null
}
