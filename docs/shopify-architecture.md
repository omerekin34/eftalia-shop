# Shopify Storefront Architecture

Bu frontend, veri kaynağı olarak Shopify Storefront API'yi kullanacak şekilde kurgulanmıştır.

## Katmanlar

- `lib/shopify/client.ts`
  - Shopify GraphQL endpoint'ine güvenli istek yapan server-only istemci.
- `lib/shopify/queries.ts`
  - Ürün, ürün detayı, cart ve checkout ile ilgili GraphQL sorgu/mutasyonları.
- `lib/shopify/services.ts`
  - Uygulama içinde tekrar kullanılacak servis fonksiyonları.
- `app/api/shopify/*`
  - Frontend'in doğrudan Storefront token görmeden konuşacağı API katmanı.

## Endpointler

- `GET /api/shopify/products?first=24&query=...`
- `GET /api/shopify/product/:handle`
- `GET /api/shopify/cart?cartId=...`
- `POST /api/shopify/cart` with actions:
  - `create`
  - `add`
  - `update`
  - `remove`
- `POST /api/shopify/checkout` (`{ cartId }`) => `checkoutUrl`

## Geçiş Planı

1. `app/tum-urunler/page.tsx` içindeki `mockProducts` yerine `/api/shopify/products`.
2. `app/urun/[slug]/page.tsx` içindeki `mockProducts` ve fallback yapısı yerine `/api/shopify/product/:handle`.
3. `cart-context.tsx` içinde local-only state yerine Shopify cart ID merkezli state:
   - localStorage: yalnızca `cartId`
   - satırlar ve toplamlar: Shopify cart response
4. `app/odeme/page.tsx` içindeki "Siparişi Tamamla" aksiyonu:
   - `/api/shopify/checkout` çağır
   - dönen `checkoutUrl` adresine yönlendir.

## Notlar

- Storefront token yalnızca server tarafında kullanılmalıdır.
- Cart durability için `cartId` localStorage'da saklanır.
- Filtreleme için Shopify `query` syntax kullanılabilir (tag, productType, vendor vb.).
