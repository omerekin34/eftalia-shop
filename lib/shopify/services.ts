import {
  COLLECTIONS_QUERY,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCTS_QUERY,
} from '@/lib/shopify/queries'
import { storefrontFetch } from '@/lib/shopify/client'

export async function getCollections(first = 50) {
  type Response = {
    collections: {
      edges: Array<{
        node: {
          id: string
          title: string
          handle: string
          image?: {
            url: string
            altText: string | null
            width: number | null
            height: number | null
          } | null
        }
      }>
    }
  }

  const data = await storefrontFetch<Response>({
    query: COLLECTIONS_QUERY,
    variables: { first },
  })

  return data.collections.edges.map((edge) => edge.node)
}

export async function getProducts(first = 24, query?: string) {
  type Response = {
    products: {
      edges: Array<{
        node: {
          id: string
          handle: string
          title: string
          description: string
          productType: string
          tags: string[]
          featuredImage?: {
            url: string
            altText: string | null
            width: number | null
            height: number | null
          } | null
          images: {
            edges: Array<{
              node: {
                url: string
                altText: string | null
                width: number | null
                height: number | null
              }
            }>
          }
          variants: {
            edges: Array<{
              node: {
                id: string
                title: string
                availableForSale: boolean
                quantityAvailable?: number | null
                selectedOptions: Array<{ name: string; value: string }>
                price: { amount: string; currencyCode: string }
                compareAtPrice?: { amount: string; currencyCode: string } | null
                image?: {
                  url: string
                  altText: string | null
                  width: number | null
                  height: number | null
                } | null
              }
            }>
          }
        }
      }>
    }
  }

  const data = await storefrontFetch<Response>({
    query: PRODUCTS_QUERY,
    variables: { first, query },
  })

  return data.products.edges.map((edge) => edge.node)
}

export async function getProductByHandle(handle: string) {
  type Response = {
    product: unknown | null
  }
  const data = await storefrontFetch<Response>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
  })
  return data.product
}

export type CartCreateBuyerIdentityInput = {
  customerAccessToken?: string
  email?: string
  phone?: string
  countryCode?: string
}

export type CartSelectableAddressForCreate = {
  address:
    | { copyFromCustomerAddressId: string }
    | {
        deliveryAddress: {
          firstName?: string
          lastName?: string
          address1?: string
          address2?: string
          city?: string
          provinceCode?: string
          countryCode?: string
          zip?: string
          phone?: string
        }
      }
  selected?: boolean
}

export type CreateCartOptions = {
  buyerCountryCode?: string
  buyerIdentity?: CartCreateBuyerIdentityInput
  delivery?: { addresses: CartSelectableAddressForCreate[] }
}

export async function createCart(
  lines?: Array<{
    merchandiseId: string
    quantity: number
    attributes?: Array<{ key: string; value: string }>
  }>,
  options?: CreateCartOptions
) {
  type Response = {
    cartCreate: {
      cart: unknown | null
      userErrors: Array<{ message: string }>
    }
  }
  const input: Record<string, unknown> = {}
  if (lines?.length) {
    input.lines = lines
  }

  const buyerIdentity: Record<string, unknown> = {}
  if (options?.buyerIdentity) {
    Object.assign(buyerIdentity, options.buyerIdentity)
  }
  if (options?.buyerCountryCode && !buyerIdentity.countryCode) {
    buyerIdentity.countryCode = options.buyerCountryCode
  }
  if (Object.keys(buyerIdentity).length) {
    input.buyerIdentity = buyerIdentity
  }

  if (options?.delivery?.addresses?.length) {
    input.delivery = { addresses: options.delivery.addresses }
  }

  const data = await storefrontFetch<Response>({
    query: CART_CREATE_MUTATION,
    variables: { input: Object.keys(input).length ? input : {} },
  })
  if (data.cartCreate.userErrors.length) {
    throw new Error(data.cartCreate.userErrors.map((e) => e.message).join(', '))
  }
  return data.cartCreate.cart
}

export async function addCartLines(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>
) {
  type Response = {
    cartLinesAdd: { cart: unknown | null; userErrors: Array<{ message: string }> }
  }
  const data = await storefrontFetch<Response>({
    query: CART_LINES_ADD_MUTATION,
    variables: { cartId, lines },
  })
  if (data.cartLinesAdd.userErrors.length) {
    throw new Error(data.cartLinesAdd.userErrors.map((e) => e.message).join(', '))
  }
  return data.cartLinesAdd.cart
}

export async function updateCartLines(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>
) {
  type Response = {
    cartLinesUpdate: { cart: unknown | null; userErrors: Array<{ message: string }> }
  }
  const data = await storefrontFetch<Response>({
    query: CART_LINES_UPDATE_MUTATION,
    variables: { cartId, lines },
  })
  if (data.cartLinesUpdate.userErrors.length) {
    throw new Error(data.cartLinesUpdate.userErrors.map((e) => e.message).join(', '))
  }
  return data.cartLinesUpdate.cart
}

export async function removeCartLines(cartId: string, lineIds: string[]) {
  type Response = {
    cartLinesRemove: { cart: unknown | null; userErrors: Array<{ message: string }> }
  }
  const data = await storefrontFetch<Response>({
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId, lineIds },
  })
  if (data.cartLinesRemove.userErrors.length) {
    throw new Error(data.cartLinesRemove.userErrors.map((e) => e.message).join(', '))
  }
  return data.cartLinesRemove.cart
}

export async function getCart(cartId: string) {
  type Response = { cart: unknown | null }
  const data = await storefrontFetch<Response>({
    query: CART_QUERY,
    variables: { cartId },
  })
  return data.cart
}
