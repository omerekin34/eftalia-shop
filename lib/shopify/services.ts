import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCTS_QUERY,
} from '@/lib/shopify/queries'
import { storefrontFetch } from '@/lib/shopify/client'

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

export async function createCart(lines?: Array<{ merchandiseId: string; quantity: number }>) {
  type Response = {
    cartCreate: {
      cart: unknown | null
      userErrors: Array<{ message: string }>
    }
  }
  const data = await storefrontFetch<Response>({
    query: CART_CREATE_MUTATION,
    variables: { input: lines?.length ? { lines } : {} },
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
