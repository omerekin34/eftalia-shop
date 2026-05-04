import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCustomerDetails } from '@/lib/shopify'
import { withCheckoutLocale } from '@/lib/shopify/checkout-url'
import { createCart, getCart, type CreateCartOptions } from '@/lib/shopify/services'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

type CartLineBody = {
  merchandiseId?: string
  quantity?: number
  attributes?: Array<{ key?: string; value?: string }>
}

function isShopifyVariantGid(id: string) {
  return id.startsWith('gid://shopify/ProductVariant/')
}

function isCustomerMailingAddressGid(id: string) {
  return id.startsWith('gid://shopify/MailingAddress/')
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      cartId?: string
      lines?: CartLineBody[]
      customerAddressId?: string
    }

    if (Array.isArray(body.lines) && body.lines.length > 0) {
      const lines = body.lines
        .filter(
          (line): line is { merchandiseId: string; quantity: number; attributes?: Array<{ key?: string; value?: string }> } =>
            Boolean(line?.merchandiseId) &&
            isShopifyVariantGid(String(line.merchandiseId)) &&
            Number.isFinite(Number(line.quantity)) &&
            Number(line.quantity) > 0
        )
        .map((line) => ({
          merchandiseId: line.merchandiseId,
          quantity: Math.min(100, Math.max(1, Math.floor(Number(line.quantity)))),
          attributes: Array.isArray(line.attributes)
            ? line.attributes
                .map((attr) => ({
                  key: String(attr?.key || '').trim(),
                  value: String(attr?.value || '').trim(),
                }))
                .filter((attr) => attr.key && attr.value)
                .slice(0, 10)
            : undefined,
        }))

      if (!lines.length) {
        return NextResponse.json(
          { error: 'Geçerli ürün varyantı bulunamadı. Lütfen sepeti güncelleyip tekrar deneyin.' },
          { status: 400 }
        )
      }

      const cookieStore = await cookies()
      const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value
      const createOptions: CreateCartOptions = { buyerCountryCode: 'TR' }

      if (accessToken) {
        const details = await getCustomerDetails(accessToken)
        if (details) {
          createOptions.buyerIdentity = {
            customerAccessToken: accessToken,
            email: details.email || undefined,
            phone: details.phone || undefined,
            countryCode: 'TR',
          }
          const rawAddresses = Array.isArray(details.addresses) ? details.addresses : []
          const addressNodes = rawAddresses.filter(
            (a): a is { id: string } =>
              Boolean(a && typeof (a as { id?: string }).id === 'string') &&
              isCustomerMailingAddressGid(String((a as { id: string }).id))
          )
          if (addressNodes.length) {
            const requestedId =
              body.customerAddressId && isCustomerMailingAddressGid(body.customerAddressId)
                ? body.customerAddressId
                : null
            const allowedIds = new Set(addressNodes.map((a) => a.id))
            const selectedId =
              requestedId && allowedIds.has(requestedId)
                ? requestedId
                : details.defaultAddressId && allowedIds.has(details.defaultAddressId)
                  ? details.defaultAddressId
                  : addressNodes[0].id
            createOptions.delivery = {
              addresses: addressNodes.map((a) => ({
                address: { copyFromCustomerAddressId: a.id },
                selected: a.id === selectedId,
              })),
            }
          }
        }
      }

      const cart = (await createCart(lines, createOptions)) as { checkoutUrl?: string } | null
      if (!cart?.checkoutUrl) {
        return NextResponse.json({ error: 'Ödeme bağlantısı oluşturulamadı.' }, { status: 502 })
      }

      return NextResponse.json({ checkoutUrl: withCheckoutLocale(cart.checkoutUrl) })
    }

    if (body.cartId) {
      const cart = (await getCart(body.cartId)) as { checkoutUrl?: string } | null
      if (!cart?.checkoutUrl) {
        return NextResponse.json({ error: 'Checkout URL not found' }, { status: 404 })
      }

      return NextResponse.json({ checkoutUrl: withCheckoutLocale(cart.checkoutUrl) })
    }

    return NextResponse.json({ error: 'cartId veya lines gerekli.' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Bilinmeyen hata.' },
      { status: 500 }
    )
  }
}
