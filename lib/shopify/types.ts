export interface ShopifyMoneyV2 {
  amount: string
  currencyCode: string
}

export interface ShopifyImage {
  url: string
  altText: string | null
  width: number | null
  height: number | null
}

export interface ShopifyProductVariant {
  id: string
  title: string
  availableForSale: boolean
  quantityAvailable?: number | null
  price: ShopifyMoneyV2
  compareAtPrice?: ShopifyMoneyV2 | null
  selectedOptions: Array<{ name: string; value: string }>
  image?: ShopifyImage | null
}

export interface ShopifyProduct {
  id: string
  handle: string
  title: string
  description: string
  featuredImage?: ShopifyImage | null
  images: ShopifyImage[]
  variants: ShopifyProductVariant[]
  productType: string
  tags: string[]
}

export interface ShopifyCartLine {
  id: string
  quantity: number
  merchandise: ShopifyProductVariant
}

export interface ShopifyCart {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: {
    subtotalAmount: ShopifyMoneyV2
    totalAmount: ShopifyMoneyV2
  }
  lines: ShopifyCartLine[]
}

export interface ProductCardModel {
  id: string
  slug: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  colors: string[]
  variantId: string
}
