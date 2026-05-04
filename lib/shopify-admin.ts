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

const RETURN_APPROVE_REQUEST_MUTATION = /* GraphQL */ `
  mutation ReturnApproveRequest($input: ReturnApproveRequestInput!) {
    returnApproveRequest(input: $input) {
      return {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`

const RETURN_DECLINE_REQUEST_MUTATION = /* GraphQL */ `
  mutation ReturnDeclineRequest($input: ReturnDeclineRequestInput!) {
    returnDeclineRequest(input: $input) {
      returnDecline {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`

const ORDER_CANCEL_MUTATION = /* GraphQL */ `
  mutation OrderCancel($orderId: ID!, $reason: OrderCancelReason!, $restock: Boolean!, $notifyCustomer: Boolean!) {
    orderCancel(orderId: $orderId, reason: $reason, restock: $restock, notifyCustomer: $notifyCustomer) {
      job {
        id
        done
      }
      userErrors {
        field
        message
      }
    }
  }
`

const CUSTOMERS_WITH_REQUESTS_QUERY = /* GraphQL */ `
  query CustomersWithRequests($first: Int!, $after: String) {
    customers(first: $first, after: $after, query: "metafield:custom.return_requests:* OR metafield:custom.cancel_requests:*") {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          firstName
          lastName
          email
          returnRequests: metafield(namespace: "custom", key: "return_requests") {
            value
          }
          cancelRequests: metafield(namespace: "custom", key: "cancel_requests") {
            value
          }
        }
      }
    }
  }
`

const CUSTOMER_REQUEST_METAFIELDS_QUERY = /* GraphQL */ `
  query CustomerRequestMetafields($id: ID!) {
    customer(id: $id) {
      id
      firstName
      lastName
      email
      returnRequests: metafield(namespace: "custom", key: "return_requests") {
        value
      }
      cancelRequests: metafield(namespace: "custom", key: "cancel_requests") {
        value
      }
    }
  }
`

type AdminServiceTicket = {
  id: string
  orderId: string
  orderNumber: number
  reason: string
  note?: string
  status: string
  createdAt: string
  shopifyReturnId?: string
  shopifyReturnName?: string
}

type CustomerRequestRecord = {
  customerId: string
  customerName: string
  customerEmail: string
  kind: 'return' | 'cancel'
  ticket: AdminServiceTicket
}

type CustomersWithRequestsData = {
  customers?: {
    pageInfo?: { hasNextPage?: boolean; endCursor?: string | null } | null
    edges?: Array<{
      node?: {
        id?: string | null
        firstName?: string | null
        lastName?: string | null
        email?: string | null
        returnRequests?: { value?: string | null } | null
        cancelRequests?: { value?: string | null } | null
      } | null
    } | null>
  } | null
}

function parseTicketList(raw: string | null | undefined): AdminServiceTicket[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(String(raw || '[]'))
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []
  return parsed
    .map((entry): AdminServiceTicket | null => {
      if (!entry || typeof entry !== 'object') return null
      const t = entry as Record<string, unknown>
      const orderId = String(t.orderId || '').trim()
      const orderNumber = Number(t.orderNumber)
      const reason = String(t.reason || '').trim()
      const createdAt = String(t.createdAt || '').trim()
      if (!orderId || !Number.isFinite(orderNumber) || !reason || !createdAt) return null
      return {
        id: String(t.id || `${orderId}:${createdAt}`).trim(),
        orderId,
        orderNumber,
        reason,
        note: String(t.note || '').trim() || undefined,
        status: String(t.status || 'beklemede').trim() || 'beklemede',
        createdAt,
        shopifyReturnId: String(t.shopifyReturnId || '').trim() || undefined,
        shopifyReturnName: String(t.shopifyReturnName || '').trim() || undefined,
      }
    })
    .filter((t): t is AdminServiceTicket => Boolean(t))
}

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
        .filter((code) => Boolean(code) && code.startsWith(WHEEL_DISCOUNT_PREFIX))
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
    return { ok: false as const, error: `Shopify Admin API hatası: ${response.status}` }
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
      error:
        'Bu siparişte iade talebi açılabilecek teslim edilmiş ürün satırı bulunamadı. Sipariş henüz kargolanmamış olabilir.',
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

export async function listCustomerServiceRequestsAdmin(limit = 120): Promise<
  | { ok: true; records: CustomerRequestRecord[] }
  | { ok: false; error: string }
> {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
    return { ok: false, error: 'SHOPIFY_ADMIN_ACCESS_TOKEN eksik veya geçersiz.' }
  }

  const records: CustomerRequestRecord[] = []
  let after: string | null = null

  while (records.length < limit) {
    const data: CustomersWithRequestsData | null = await adminGraphqlFetch<CustomersWithRequestsData>(
      CUSTOMERS_WITH_REQUESTS_QUERY,
      { first: 40, after }
    )

    if (!data?.customers) {
      return { ok: false, error: 'Shopify müşteri talepleri okunamadı.' }
    }

    const edges = data.customers.edges || []
    for (const edge of edges) {
      const node = edge?.node
      const customerId = String(node?.id || '').trim()
      if (!customerId) continue
      const customerName = [node?.firstName, node?.lastName].filter(Boolean).join(' ').trim() || 'Müşteri'
      const customerEmail = String(node?.email || '').trim()

      const returnTickets = parseTicketList(node?.returnRequests?.value)
      const cancelTickets = parseTicketList(node?.cancelRequests?.value)

      for (const ticket of returnTickets) {
        records.push({ customerId, customerName, customerEmail, kind: 'return', ticket })
      }
      for (const ticket of cancelTickets) {
        records.push({ customerId, customerName, customerEmail, kind: 'cancel', ticket })
      }

      if (records.length >= limit) break
    }

    if (records.length >= limit) break
    if (!data.customers.pageInfo?.hasNextPage) break
    after = String(data.customers.pageInfo?.endCursor || '')
    if (!after) break
  }

  records.sort((a, b) => new Date(b.ticket.createdAt).getTime() - new Date(a.ticket.createdAt).getTime())
  return { ok: true, records: records.slice(0, limit) }
}

export async function getCustomerRequestMetafieldsAdmin(customerId: string): Promise<
  | {
      ok: true
      customer: {
        id: string
        firstName: string
        lastName: string
        email: string
        returnTickets: AdminServiceTicket[]
        cancelTickets: AdminServiceTicket[]
      }
    }
  | { ok: false; error: string }
> {
  const id = String(customerId || '').trim()
  if (!id) return { ok: false, error: 'Müşteri kimliği eksik.' }
  const data = await adminGraphqlFetch<{
    customer?: {
      id?: string | null
      firstName?: string | null
      lastName?: string | null
      email?: string | null
      returnRequests?: { value?: string | null } | null
      cancelRequests?: { value?: string | null } | null
    } | null
  }>(CUSTOMER_REQUEST_METAFIELDS_QUERY, { id })

  const c = data?.customer
  if (!c?.id) return { ok: false, error: 'Müşteri bulunamadı.' }

  return {
    ok: true,
    customer: {
      id: String(c.id),
      firstName: String(c.firstName || ''),
      lastName: String(c.lastName || ''),
      email: String(c.email || ''),
      returnTickets: parseTicketList(c.returnRequests?.value),
      cancelTickets: parseTicketList(c.cancelRequests?.value),
    },
  }
}

export async function approveShopifyReturnRequest(returnId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const id = String(returnId || '').trim()
  if (!id) return { ok: false, error: 'Shopify iade kimliği yok.' }
  const data = await adminGraphqlFetch<{
    returnApproveRequest?: { userErrors?: Array<{ message?: string | null } | null> | null } | null
  }>(RETURN_APPROVE_REQUEST_MUTATION, { input: { id, notifyCustomer: true } })
  if (!data?.returnApproveRequest) return { ok: false, error: 'İade onaylanamadı.' }
  const errors = (data.returnApproveRequest.userErrors || []).map((e) => String(e?.message || '').trim()).filter(Boolean)
  if (errors.length) return { ok: false, error: errors.join(' | ') }
  return { ok: true }
}

export async function declineShopifyReturnRequest(
  returnId: string,
  declineNote?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const id = String(returnId || '').trim()
  if (!id) return { ok: false, error: 'Shopify iade kimliği yok.' }
  const data = await adminGraphqlFetch<{
    returnDeclineRequest?: { userErrors?: Array<{ message?: string | null } | null> | null } | null
  }>(RETURN_DECLINE_REQUEST_MUTATION, {
    input: {
      id,
      declineReason: 'OTHER',
      ...(declineNote ? { declineNote: String(declineNote).slice(0, 500) } : {}),
      notifyCustomer: true,
    },
  })
  if (!data?.returnDeclineRequest) return { ok: false, error: 'İade reddedilemedi.' }
  const errors = (data.returnDeclineRequest.userErrors || []).map((e) => String(e?.message || '').trim()).filter(Boolean)
  if (errors.length) return { ok: false, error: errors.join(' | ') }
  return { ok: true }
}

export async function cancelShopifyOrderAndNotify(orderId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const id = String(orderId || '').trim()
  if (!id) return { ok: false, error: 'Sipariş kimliği yok.' }
  const data = await adminGraphqlFetch<{
    orderCancel?: { userErrors?: Array<{ message?: string | null } | null> | null } | null
  }>(ORDER_CANCEL_MUTATION, {
    orderId: id,
    reason: 'CUSTOMER',
    restock: true,
    notifyCustomer: true,
  })
  if (!data?.orderCancel) return { ok: false, error: 'Sipariş iptal edilemedi.' }
  const errors = (data.orderCancel.userErrors || []).map((e) => String(e?.message || '').trim()).filter(Boolean)
  if (errors.length) return { ok: false, error: errors.join(' | ') }
  return { ok: true }
}
