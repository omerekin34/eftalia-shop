/**
 * Shopify Storefront API returns many user-facing errors in English.
 * Map known messages (and substrings) to Turkish for the storefront UI.
 */

function hasTurkishLetters(s: string) {
  return /[ğüşıöçĞÜŞİÖÇİı]/.test(s)
}

const EXACT: Record<string, string> = {
  'unidentified customer':
    'E-posta veya şifre hatalı. Bu e-posta ile kayıtlıysanız doğru şifreyi girin; hesabınız yoksa üye olun.',
  'customer is disabled': 'Hesabınız devre dışı. Lütfen destek ile iletişime geçin.',
  'invalid email or password': 'E-posta veya şifre hatalı.',
  'unknown error': 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
  'shopify response has no data.': 'Mağazadan veri alınamadı. Lütfen tekrar deneyin.',
}

const SUBSTRING_RULES: Array<{ match: (s: string) => boolean; tr: string }> = [
  {
    match: (s) =>
      s.includes('already been taken') ||
      s.includes('has already been taken') ||
      s.includes('email has already been taken') ||
      s.includes('already taken'),
    tr: 'Bu e-posta adresi zaten kayıtlı.',
  },
  {
    match: (s) => s.includes("can't be blank") || s.includes('cannot be blank') || s.includes(' boş olamaz'),
    tr: 'Zorunlu alanları doldurun.',
  },
  {
    match: (s) => s.includes('email is invalid') || s.includes('invalid email'),
    tr: 'Geçersiz e-posta adresi.',
  },
  {
    match: (s) => s.includes('password') && (s.includes('too short') || s.includes('minimum')),
    tr: 'Şifre çok kısa. Shopify en az 5 karakter ister.',
  },
  {
    match: (s) => s.includes('phone') && (s.includes('invalid') || s.includes('geçersiz')),
    tr: 'Geçersiz telefon numarası.',
  },
  {
    match: (s) => s.includes('throttled') || s.includes('too many requests'),
    tr: 'Çok fazla istek yapıldı. Lütfen kısa bir süre sonra tekrar deneyin.',
  },
  {
    match: (s) => s.includes('merchandise') && (s.includes('unavailable') || s.includes('does not exist')),
    tr: 'Seçilen ürün şu an sepete eklenemiyor.',
  },
  {
    match: (s) => s.includes('out of stock') || s.includes('sold out'),
    tr: 'Ürün stokta yok.',
  },
  {
    match: (s) => s.includes('maximum') && s.includes('quantity'),
    tr: 'İzin verilen en fazla adede ulaşıldı.',
  },
  {
    match: (s) => s.includes('shopify request failed'),
    tr: 'Mağaza bağlantısında sorun oluştu. Lütfen tekrar deneyin.',
  },
  {
    match: (s) =>
      s.includes('missing shopify') ||
      (s.includes('shopify') && s.includes('configuration')) ||
      (s.includes('shopify') && s.includes('env vars')),
    tr: 'Sunucu yapılandırması eksik: Shopify alan adı veya erişim anahtarı tanımlı değil.',
  },
  {
    match: (s) =>
      s.includes('metafield') ||
      s.includes('definition') ||
      s.includes('must have a definition') ||
      s.includes('metafielddefinition') ||
      s.includes('invalid metafield') ||
      s.includes('unknown metafield') ||
      (s.includes('does not exist') && s.includes('metafield')),
    tr: 'Shopify tarafında müşteri metafield tanımı eksik veya izin yok. Admin → Ayarlar → Özel veriler → Müşteriler: namespace "custom" altında "return_requests" ve "cancel_requests" için JSON tipinde tanımlar oluşturun; ardından Storefront erişiminde bu alanların yazılabilir olduğundan emin olun.',
  },
  {
    match: (s) =>
      s.includes('access') &&
      (s.includes('denied') || s.includes('forbidden') || s.includes('not allowed')),
    tr: 'Bu işlem için mağaza API izinleri yetersiz. Storefront erişim anahtarınızın müşteri güncellemesi ve metafield yazımına izin verdiğini kontrol edin.',
  },
]

function translateOne(raw: string): string {
  const trimmed = String(raw || '').trim()
  if (!trimmed) return ''

  if (hasTurkishLetters(trimmed)) {
    return trimmed
  }

  const key = trimmed.toLowerCase()
  if (EXACT[key]) {
    return EXACT[key]
  }

  for (const rule of SUBSTRING_RULES) {
    if (rule.match(key)) {
      return rule.tr
    }
  }

  return 'İşlem tamamlanamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.'
}

/** Join multiple Shopify `customerUserErrors` / `userErrors` messages for display. */
export function translateStorefrontUserErrorMessages(messages: string[]): string {
  const parts = messages.map((m) => translateOne(m)).filter(Boolean)
  const unique = [...new Set(parts)]
  return unique.join(' ')
}

/** Single message from a catch block or upstream API. */
export function translateAnyStorefrontErrorMessage(message: string): string {
  return translateStorefrontUserErrorMessages([message])
}
