import 'server-only'

function normalizeShopifyStoreDomain(raw: string | undefined): string {
  if (!raw) return ''
  return raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
    ?.replace(/^www\./i, '') || ''
}

const SHOPIFY_STORE_DOMAIN = normalizeShopifyStoreDomain(process.env.SHOPIFY_STORE_DOMAIN)
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-01'
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
const WHEEL_DISCOUNT_CODES = process.env.WHEEL_DISCOUNT_CODES || ''
const WHEEL_DISCOUNT_PERCENTS = process.env.WHEEL_DISCOUNT_PERCENTS || '10,15,20,25,30'

/** Çark listesi: env yok veya boş = tüm aktif kodlar; dolu = sadece bu önek (örn. EFTALIA). */
function getWheelListPrefixFilter(): string | null {
  const v = process.env.WHEEL_DISCOUNT_PREFIX
  if (v === undefined) return null
  const t = v.trim()
  return t === '' ? null : t.toUpperCase()
}

/** Sunucunun oluşturacağı dinamik kodların öneki (spin havuzuyla ilgili değil). */
const WHEEL_GENERATED_CODE_PREFIX = (process.env.WHEEL_GENERATED_CODE_PREFIX || 'EFTALIA').toUpperCase()

/** Native Shopify `returnRequest` için teslim satırı gerekir; kargo öncesi yalnızca müşteri metafield kaydı yapılır. */
export const SHOPIFY_RETURN_NO_FULFILLMENT_LINES =
  'Bu siparişte iade talebi açılabilecek teslim edilmiş ürün satırı bulunamadı. Sipariş henüz kargolanmamış olabilir.' as const

export function isShopifyReturnNoFulfillmentError(message: string): boolean {
  const m = String(message || '').trim()
  return m === SHOPIFY_RETURN_NO_FULFILLMENT_LINES || m.includes('teslim edilmiş ürün satırı bulunamadı')
}

function describeShopifyAdminHttpError(status: number): string {
  if (status === 401) {
    return (
      'Shopify Admin API erişimi reddedildi (401). SHOPIFY_ADMIN_ACCESS_TOKEN sunucuda yanlış, eksik veya geçersiz. ' +
      "Shopify yönetim → Ayarlar → Uygulamalar ve satış kanalları → Geliştirme → özel uygulama → 'Admin API erişim belirteci'ni " +
      'Vercel (veya hosting) ortam değişkenlerine ekleyin ve yeniden dağıtın. SHOPIFY_STORE_DOMAIN, https olmadan magaza.myshopify.com biçiminde olmalı.'
    )
  }
  if (status === 403) {
    return `Shopify Admin API izni yok (${status}). Özel uygulamada metafield yazımı / müşteri erişim izinlerini kontrol edin.`
  }
  return `Shopify Admin API yanıtı: HTTP ${status}`
}

const ACTIVE_DISCOUNT_CODES_QUERY = /* GraphQL */ `
  query ActiveDiscountCodes($first: Int!) {
    codeDiscountNodes(first: $first, query: "status:active") {
      nodes {
        codeDiscount {
          __typename
          ... on DiscountCodeBasic {
            codes(first: 50) {
              nodes {
                code
              }
            }
            customerGets {
              value {
                __typename
                ... on DiscountPercentage {
                  percentage
                }
              }
            }
          }
          ... on DiscountCodeBxgy {
            codes(first: 50) {
              nodes {
                code
              }
            }
          }
          ... on DiscountCodeFreeShipping {
            codes(first: 50) {
              nodes {
                code
              }
            }
          }
        }
      }
    }
  }
`

const METAFIELDS_SET_MUTATION = /* GraphQL */ `
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        key
        namespace
      }
      userErrors {
        field
        message
      }
    }
  }
`

const CUSTOMER_SPIN_REWARD_QUERY = /* GraphQL */ `
  query CustomerSpinReward($id: ID!) {
    customer(id: $id) {
      metafield(namespace: "custom", key: "spin_wheel_reward_v4") {
        value
      }
    }
  }
`

const CUSTOMER_BY_EMAIL_QUERY = /* GraphQL */ `
  query CustomerByEmail($query: String!) {
    customers(first: 1, query: $query) {
      nodes {
        id
        email
      }
    }
  }
`

const CUSTOMER_PASSWORD_UPDATE_MUTATION = /* GraphQL */ `
  mutation CustomerPasswordUpdate($input: CustomerInput!) {
    customerUpdate(input: $input) {
      customer {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`

const ORDER_FULFILLMENT_LINE_ITEMS_QUERY = /* GraphQL */ `
  query OrderForReturnRequest($id: ID!) {
    order(id: $id) {
      id
      name
      fulfillments(first: 20) {
        nodes {
          fulfillmentLineItems(first: 100) {
            nodes {
              id
              quantity
            }
          }
        }
      }
    }
  }
`

const RETURN_REQUEST_MUTATION = /* GraphQL */ `
  mutation ReturnRequest($input: ReturnRequestInput!) {
    returnRequest(input: $input) {
      return {
        id
        name
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`

type AdminGraphqlFetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; httpStatus?: number }

async function adminGraphqlFetchDetailed<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<AdminGraphqlFetchResult<T>> {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
    return { ok: false, message: 'SHOPIFY_STORE_DOMAIN veya SHOPIFY_ADMIN_ACCESS_TOKEN eksik.' }
  }

  const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })

  if (!response.ok) {
    return {
      ok: false,
      httpStatus: response.status,
      message: `Shopify Admin HTTP ${response.status}. Mağaza alanını (örn. magaza.myshopify.com, https’siz) ve Vercel ortam değişkenlerini kontrol edin.`,
    }
  }

  const json = (await response.json()) as {
    data?: T
    errors?: Array<{ message?: string }>
  }
  if (json.errors?.length) {
    const msg = json.errors
      .map((e) => String(e?.message || '').trim())
      .filter(Boolean)
      .join(' | ')
    return {
      ok: false,
      message:
        msg ||
        'Shopify GraphQL hatası. Admin özel uygulamasında read_customers ve müşteri metaalanları için gerekli izinler açık mı kontrol edin.',
    }
  }
  if (json.data === undefined || json.data === null) {
    return { ok: false, message: 'Shopify boş veri döndürdü.' }
  }
  return { ok: true, data: json.data }
}

async function adminGraphqlFetch<T>(query: string, variables: Record<string, unknown>) {
  const result = await adminGraphqlFetchDetailed<T>(query, variables)
  if (!result.ok) return null
  return result.data
}

function toRewardFromCode(code: string) {
  const amountMatch = code.match(/(\d{1,2})$/)
  const amount = amountMatch?.[1] || '10'
  return {
    code,
    label: `%${amount} İndirim`,
  }
}

function normalizeDiscountPercent(rawValue: unknown) {
  const parsed = Number(rawValue)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  // Shopify bazı tiplerde 0.10, bazılarında 10 döndürebilir.
  const normalized = parsed <= 1 ? parsed * 100 : parsed
  if (!Number.isFinite(normalized) || normalized <= 0) return null
  return Math.max(1, Math.min(90, Math.round(normalized)))
}

function getRewardsFromEnv() {
  const percents = getWheelRewardPercents()
  const codes = WHEEL_DISCOUNT_CODES.split(',')
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean)
  const uniqueCodes = Array.from(new Set(codes))
  return uniqueCodes.map((code, index) => {
    const percentFromEnv = percents[index]
    if (Number.isFinite(percentFromEnv) && percentFromEnv > 0) {
      return {
        code,
        label: `%${Math.round(percentFromEnv)} İndirim`,
      }
    }
    return toRewardFromCode(code)
  })
}

export async function getWheelDiscountRewards() {
  const data = await adminGraphqlFetch<{
    codeDiscountNodes?: {
      nodes?: Array<{
        codeDiscount?: {
          __typename?: string | null
          customerGets?: {
            value?: {
              __typename?: string | null
              percentage?: number | null
            } | null
          } | null
          codes?: { nodes?: Array<{ code?: string | null } | null> | null } | null
        } | null
      } | null>
    }
  }>(ACTIVE_DISCOUNT_CODES_QUERY, { first: 80 })

  const rewardsFromShopify = (data?.codeDiscountNodes?.nodes || [])
    .flatMap((node) => {
      const discount = node?.codeDiscount
      const prefixFilter = getWheelListPrefixFilter()
      const codes = (discount?.codes?.nodes || [])
        .map((entry) => String(entry?.code || '').trim().toUpperCase())
        .filter((code) => Boolean(code) && (!prefixFilter || code.startsWith(prefixFilter)))
      if (!codes.length) return []

      const normalizedPercent = normalizeDiscountPercent(discount?.customerGets?.value?.percentage)
      const hasPercentage =
        typeof normalizedPercent === 'number' &&
        Number.isFinite(normalizedPercent) &&
        normalizedPercent > 0

      return codes.map((code) => ({
        code,
        label: hasPercentage ? `%${normalizedPercent} İndirim` : toRewardFromCode(code).label,
      }))
    })
    .filter((reward) => reward.code)

  const uniqueByCode = Array.from(
    new Map(rewardsFromShopify.map((reward) => [reward.code, reward])).values()
  )
    .sort((a, b) => a.code.localeCompare(b.code, 'tr'))
  if (uniqueByCode.length) {
    return uniqueByCode
  }

  const rewardsFromEnv = getRewardsFromEnv()
  if (rewardsFromEnv.length) {
    return rewardsFromEnv
  }

  return []
}

function getAdminEndpoint(path: string) {
  return `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}${path}`
}

async function adminRestFetch<T>(path: string, payload: unknown) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
    return { ok: false as const, error: 'SHOPIFY_ADMIN_ACCESS_TOKEN eksik veya geçersiz.' }
  }
  const response = await fetch(getAdminEndpoint(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })
  const json = (await response.json().catch(() => null)) as T | null
  if (!response.ok) {
    return { ok: false as const, error: describeShopifyAdminHttpError(response.status) }
  }
  return { ok: true as const, data: json }
}

function parseCustomerNumericId(customerGid: string) {
  const raw = String(customerGid || '').trim()
  const matched = raw.match(/\/(\d+)$/)
  if (matched?.[1]) return Number(matched[1])
  const digits = raw.replace(/\D/g, '')
  return digits ? Number(digits) : null
}

function createRandomCode(prefix: string) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 10; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return `${prefix}-${suffix}`
}

export function getWheelRewardPercents() {
  const parsed = WHEEL_DISCOUNT_PERCENTS.split(',')
    .map((entry) => Number(String(entry).trim()))
    .filter((value) => Number.isFinite(value) && value > 0 && value <= 90)
  return parsed.length ? parsed : [10, 15, 20, 25, 30]
}

export async function createCustomerScopedWheelDiscount(customerGid: string, percent: number) {
  const customerId = parseCustomerNumericId(customerGid)
  if (!customerId) return { ok: false as const, error: 'Geçersiz müşteri kimliği.' }
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
    return { ok: false as const, error: 'SHOPIFY_ADMIN_ACCESS_TOKEN eksik veya geçersiz.' }
  }

  const safePercent = Math.max(1, Math.min(90, Math.round(percent)))
  const code = createRandomCode(WHEEL_GENERATED_CODE_PREFIX)
  const startsAt = new Date().toISOString()
  const ruleTitle = `Wheel ${safePercent}% - ${customerId} - ${Date.now()}`

  const createRule = await adminRestFetch<{
    price_rule?: { id?: number }
  }>('/price_rules.json', {
    price_rule: {
      title: ruleTitle,
      target_type: 'line_item',
      target_selection: 'all',
      allocation_method: 'across',
      value_type: 'percentage',
      value: `-${safePercent}`,
      customer_selection: 'prerequisite',
      prerequisite_customer_ids: [customerId],
      starts_at: startsAt,
      usage_limit: 1,
      once_per_customer: true,
    },
  })
  if (!createRule.ok || !createRule.data?.price_rule?.id) {
    return { ok: false as const, error: createRule.ok ? 'Price rule oluşturulamadı.' : createRule.error }
  }

  const priceRuleId = createRule.data.price_rule.id
  const createCode = await adminRestFetch('/price_rules/' + priceRuleId + '/discount_codes.json', {
    discount_code: { code },
  })
  if (!createCode.ok) {
    return { ok: false as const, error: createCode.error }
  }

  return {
    ok: true as const,
    reward: {
      code,
      label: `%${safePercent} İndirim`,
    },
  }
}

/** Storefront `customerUpdate` cannot write customer metafields; use Admin metafieldsSet (same as spin wheel). */
export async function setCustomerJsonMetafieldAdmin(
  customerGid: string,
  key: 'return_requests' | 'cancel_requests',
  value: unknown
) {
  const ownerId = String(customerGid || '').trim()
  if (!ownerId) return { ok: false as const, error: 'Müşteri kimliği yok.' }
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
    return {
      ok: false as const,
      error:
        'SHOPIFY_ADMIN_ACCESS_TOKEN tanımlı değil. İade/iptal talepleri için Admin API ile müşteri metafield yazımı gerekir.',
    }
  }

  let rawValue: string
  try {
    rawValue = JSON.stringify(value)
  } catch {
    return { ok: false as const, error: 'Veri JSON olarak kaydedilemedi.' }
  }

  const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
    },
    body: JSON.stringify({
      query: METAFIELDS_SET_MUTATION,
      variables: {
        metafields: [
          {
            ownerId,
            namespace: 'custom',
            key,
            type: 'json',
            value: rawValue,
          },
        ],
      },
    }),
    cache: 'no-store',
  })

  const json = (await response.json().catch(() => null)) as
    | {
        errors?: Array<{ message?: string | null } | null>
        data?: {
          metafieldsSet?: {
            userErrors?: Array<{ message?: string | null } | null>
          }
        }
      }
    | null

  if (!response.ok) {
    const gqlErrors = (json?.errors || [])
      .map((error) => String(error?.message || '').trim())
      .filter(Boolean)
    const base = describeShopifyAdminHttpError(response.status)
    return {
      ok: false as const,
      error: gqlErrors.length ? `${base} — ${gqlErrors.join(' | ')}` : base,
    }
  }

  const gqlErrors = (json?.errors || [])
    .map((error) => String(error?.message || '').trim())
    .filter(Boolean)
  if (gqlErrors.length) {
    return { ok: false as const, error: gqlErrors.join(' | ') }
  }

  const userErrors = (json?.data?.metafieldsSet?.userErrors || [])
    .map((error) => String(error?.message || '').trim())
    .filter(Boolean)
  if (userErrors.length) {
    return { ok: false as const, error: userErrors.join(' | ') }
  }

  return { ok: true as const }
}

export async function setCustomerSpinWheelRewardRaw(customerId: string, rawValue: string) {
  const ownerId = String(customerId || '').trim()
  if (!ownerId) return { ok: false as const, error: 'Geçersiz müşteri kimliği.' }
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
    return { ok: false as const, error: 'SHOPIFY_ADMIN_ACCESS_TOKEN eksik veya geçersiz.' }
  }

  const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
    },
    body: JSON.stringify({
      query: METAFIELDS_SET_MUTATION,
      variables: {
        metafields: [
          {
            ownerId,
            namespace: 'custom',
            key: 'spin_wheel_reward_v4',
            type: 'json',
            value: rawValue,
          },
        ],
      },
    }),
    cache: 'no-store',
  })

  const json = (await response.json().catch(() => null)) as
    | {
        errors?: Array<{ message?: string | null } | null>
        data?: {
          metafieldsSet?: {
            userErrors?: Array<{ message?: string | null } | null>
          }
        }
      }
    | null

  if (!response.ok) {
    const gqlErrors = (json?.errors || [])
      .map((error) => String(error?.message || '').trim())
      .filter(Boolean)
    const base = describeShopifyAdminHttpError(response.status)
    return {
      ok: false as const,
      error: gqlErrors.length ? `${base} — ${gqlErrors.join(' | ')}` : base,
    }
  }

  const gqlErrors = (json?.errors || [])
    .map((error) => String(error?.message || '').trim())
    .filter(Boolean)
  if (gqlErrors.length) {
    return { ok: false as const, error: gqlErrors.join(' | ') }
  }

  const userErrors = (json?.data?.metafieldsSet?.userErrors || [])
    .map((error) => String(error?.message || '').trim())
    .filter(Boolean)
  if (userErrors.length) {
    return { ok: false as const, error: userErrors.join(' | ') }
  }

  return { ok: true as const }
}

export async function getCustomerSpinWheelRewardRaw(customerId: string) {
  const ownerId = String(customerId || '').trim()
  if (!ownerId) return { ok: false as const, error: 'Geçersiz müşteri kimliği.' }
  const data = await adminGraphqlFetch<{
    customer?: { metafield?: { value?: string | null } | null } | null
  }>(CUSTOMER_SPIN_REWARD_QUERY, { id: ownerId })
  if (!data) {
    return { ok: false as const, error: 'Müşteri ödül verisi Shopify Admin üzerinden okunamadı.' }
  }
  return {
    ok: true as const,
    rawValue: String(data?.customer?.metafield?.value || ''),
  }
}

export async function setCustomerPasswordByEmailAdmin(email: string, password: string) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const nextPassword = String(password || '').trim()
  if (!normalizedEmail || !nextPassword) {
    return { ok: false as const, error: 'E-posta veya parola bilgisi eksik.' }
  }
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
    return { ok: false as const, error: 'SHOPIFY_ADMIN_ACCESS_TOKEN eksik veya geçersiz.' }
  }

  const customerLookup = await adminGraphqlFetch<{
    customers?: { nodes?: Array<{ id?: string | null; email?: string | null } | null> | null } | null
  }>(CUSTOMER_BY_EMAIL_QUERY, {
    query: `email:${normalizedEmail}`,
  })
  const customerNode = customerLookup?.customers?.nodes?.[0]
  const customerId = String(customerNode?.id || '').trim()
  if (!customerId) {
    return { ok: false as const, error: 'Müşteri bulunamadı.', code: 'NOT_FOUND' as const }
  }

  const updateResult = await adminGraphqlFetch<{
    customerUpdate?: {
      customer?: { id?: string | null } | null
      userErrors?: Array<{ message?: string | null } | null>
    } | null
  }>(CUSTOMER_PASSWORD_UPDATE_MUTATION, {
    input: { id: customerId, password: nextPassword },
  })
  if (!updateResult?.customerUpdate) {
    return { ok: false as const, error: 'Müşteri parolası Shopify Admin üzerinden güncellenemedi.' }
  }
  const userErrors = (updateResult.customerUpdate.userErrors || [])
    .map((e) => String(e?.message || '').trim())
    .filter(Boolean)
  if (userErrors.length) {
    return { ok: false as const, error: userErrors.join(' | ') }
  }

  return { ok: true as const, customerId }
}

export async function createShopifyReturnRequest(
  orderId: string,
  customerNote?: string
): Promise<{ ok: true; returnId: string; returnName: string } | { ok: false; error: string }> {
  const normalizedOrderId = String(orderId || '').trim()
  if (!normalizedOrderId) {
    return { ok: false, error: 'Sipariş kimliği eksik.' }
  }
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
    return {
      ok: false,
      error:
        'SHOPIFY_ADMIN_ACCESS_TOKEN tanımlı değil. Native Shopify iade talebi açmak için Admin API gerekir.',
    }
  }

  const orderData = await adminGraphqlFetch<{
    order?: {
      id?: string | null
      name?: string | null
      fulfillments?: {
        nodes?: Array<{
          fulfillmentLineItems?: {
            nodes?: Array<{ id?: string | null; quantity?: number | null } | null> | null
          } | null
        } | null>
      } | null
    } | null
  }>(ORDER_FULFILLMENT_LINE_ITEMS_QUERY, { id: normalizedOrderId })

  const nodes = orderData?.order?.fulfillments?.nodes || []
  const returnLineItems = nodes
    .flatMap((fulfillment) => fulfillment?.fulfillmentLineItems?.nodes || [])
    .map((line) => {
      const id = String(line?.id || '').trim()
      const qty = Number(line?.quantity || 0)
      if (!id || !Number.isFinite(qty) || qty <= 0) return null
      return {
        fulfillmentLineItemId: id,
        quantity: Math.max(1, Math.floor(qty)),
      }
    })
    .filter(Boolean) as Array<{ fulfillmentLineItemId: string; quantity: number }>

  if (!returnLineItems.length) {
    return {
      ok: false,
      error: SHOPIFY_RETURN_NO_FULFILLMENT_LINES,
    }
  }

  const data = await adminGraphqlFetch<{
    returnRequest?: {
      return?: { id?: string | null; name?: string | null } | null
      userErrors?: Array<{ message?: string | null } | null>
    } | null
  }>(RETURN_REQUEST_MUTATION, {
    input: {
      orderId: normalizedOrderId,
      returnLineItems: returnLineItems.map((line) => ({
        ...line,
        ...(customerNote ? { customerNote: String(customerNote).slice(0, 300) } : {}),
      })),
    },
  })

  if (!data?.returnRequest) {
    return { ok: false, error: 'Shopify iade talebi oluşturulamadı.' }
  }

  const userErrors = (data.returnRequest.userErrors || [])
    .map((e) => String(e?.message || '').trim())
    .filter(Boolean)
  if (userErrors.length) {
    return { ok: false, error: userErrors.join(' | ') }
  }

  const returnId = String(data.returnRequest.return?.id || '').trim()
  const returnName = String(data.returnRequest.return?.name || '').trim()
  if (!returnId) {
    return { ok: false, error: 'Shopify iade talebi yanıtında iade kimliği bulunamadı.' }
  }

  return { ok: true, returnId, returnName: returnName || returnId }
}
