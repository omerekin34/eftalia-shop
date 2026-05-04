import 'server-only'

import { translateStorefrontUserErrorMessages } from '@/lib/storefront-error-messages-tr'

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const SHOPIFY_STOREFRONT_TOKEN =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.SHOPIFY_STOREFRONT_TOKEN
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-01'

function getEndpoint() {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
    throw new Error(
      translateStorefrontUserErrorMessages([
        'Missing Shopify configuration. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN.',
      ])
    )
  }
  return `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`
}

type StorefrontResponse<T> = {
  data?: T
  errors?: Array<{ message: string }>
}

export async function storefrontFetch<T>({
  query,
  variables,
}: {
  query: string
  variables?: Record<string, unknown>
}): Promise<T> {
  const res = await fetch(getEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(
      translateStorefrontUserErrorMessages([`Shopify request failed with status ${res.status}`])
    )
  }

  const json = (await res.json()) as StorefrontResponse<T>

  if (json.errors?.length) {
    throw new Error(translateStorefrontUserErrorMessages(json.errors.map((e) => e.message)))
  }

  if (!json.data) {
    throw new Error(translateStorefrontUserErrorMessages(['Shopify response has no data.']))
  }

  return json.data
}
