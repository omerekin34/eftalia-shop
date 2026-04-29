import 'server-only'

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-01'
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
const WHEEL_DISCOUNT_PREFIX = (process.env.WHEEL_DISCOUNT_PREFIX || 'EFTALIA').toUpperCase()
const WHEEL_DISCOUNT_CODES = process.env.WHEEL_DISCOUNT_CODES || ''
const WHEEL_DISCOUNT_PERCENTS = process.env.WHEEL_DISCOUNT_PERCENTS || '10,15,20,25,30'

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

async function adminGraphqlFetch<T>(query: string, variables: Record<string, unknown>) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) return null

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

  if (!response.ok) return null
  const json = (await response.json()) as {
    data?: T
    errors?: Array<{ message?: string }>
  }
  if (json.errors?.length) return null
  return json.data || null
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
      const codes = (discount?.codes?.nodes || [])
        .map((entry) => String(entry?.code || '').trim().toUpperCase())
        .filter(Boolean)
      if (!codes.length) return []

      const normalizedPercent = normalizeDiscountPercent(discount?.customerGets?.value?.percentage)
      const hasPercentage = Number.isFinite(normalizedPercent) && normalizedPercent > 0

      return codes.map((code) => ({
        code,
        label: hasPercentage ? `%${normalizedPercent} İndirim` : toRewardFromCode(code).label,
      }))
    })
    .filter((reward) => reward.code)

  const uniqueByCode = Array.from(
    new Map(rewardsFromShopify.map((reward) => [reward.code, reward])).values()
  )
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
    return { ok: false as const, error: `Admin API hatası: ${response.status}` }
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
  const code = createRandomCode(WHEEL_DISCOUNT_PREFIX)
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
    return { ok: false as const, error: `Admin API hatası: ${response.status}` }
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
