import "server-only";

import { translateStorefrontUserErrorMessages } from "./storefront-error-messages-tr";

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";
const ENABLE_DEBUG_LOGS = process.env.NODE_ENV !== "production" || process.env.ENABLE_DEBUG_LOGS === "1";

function debugLog(...args) {
  if (!ENABLE_DEBUG_LOGS) return;
  console.log(...args);
}

const PRODUCTS_QUERY = /* GraphQL */ `
  query GetProducts($first: Int!) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          handle
          title
          description
          productType
          tags
          priceRange {
            minVariantPrice {
              amount
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
            }
          }
          collections(first: 50) {
            edges {
              node {
                id
                title
                handle
              }
            }
          }
          options(first: 10) {
            name
            values
          }
          featuredImage {
            url
          }
          images(first: 8) {
            edges {
              node {
                url
              }
            }
          }
          variants(first: 20) {
            edges {
              node {
                id
                availableForSale
                quantityAvailable
                selectedOptions {
                  name
                  value
                }
                price {
                  amount
                }
                compareAtPrice {
                  amount
                }
              }
            }
          }
        }
      }
    }
  }
`;

function normalizeText(value = "") {
  return String(value)
    .toLocaleLowerCase("tr")
    .replace(/i̇/g, "i")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .trim();
}

const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      productType
      tags
      priceRange {
        minVariantPrice {
          amount
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
        }
      }
      collections(first: 50) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
      options(first: 10) {
        name
        values
      }
      materyal: metafield(namespace: "custom", key: "materyal") {
        key
        value
      }
      i_c_astar: metafield(namespace: "custom", key: "i_c_astar") {
        key
        value
      }
      i_scilik: metafield(namespace: "custom", key: "i_scilik") {
        key
        value
      }
      review_rating: metafield(namespace: "reviews", key: "rating") {
        value
      }
      review_rating_count: metafield(namespace: "reviews", key: "rating_count") {
        value
      }
      judgeme_widget: metafield(namespace: "judgeme", key: "widget") {
        value
      }
      judgeme_badge: metafield(namespace: "judgeme", key: "badge") {
        value
      }
      product_video: metafield(namespace: "custom", key: "product_video") {
        value
      }
      urun_tanitim_videosu: metafield(namespace: "custom", key: "urun_tanitim_videosu") {
        value
      }
      featuredImage {
        url
      }
      images(first: 20) {
        edges {
          node {
            url
          }
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            availableForSale
            quantityAvailable
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            image {
              url
            }
          }
        }
      }
      media(first: 10) {
        edges {
          node {
            __typename
            ... on Video {
              sources {
                url
                mimeType
                format
              }
            }
            ... on ExternalVideo {
              originUrl
              embedUrl
            }
          }
        }
      }
    }
  }
`;

const PRODUCT_FEATURED_IMAGE_QUERY = /* GraphQL */ `
  query GetProductFeaturedImage($handle: String!) {
    product(handle: $handle) {
      featuredImage {
        url
      }
      images(first: 1) {
        edges {
          node {
            url
          }
        }
      }
    }
  }
`;

const UGC_VIDEOS_QUERY = /* GraphQL */ `
  query UGCVideos($first: Int!) {
    metaobjects(type: "ugc_video", first: $first) {
      edges {
        node {
          id
          handle
          fields {
            key
            value
          }
        }
      }
    }
  }
`;

const SHOP_SOCIAL_LINKS_QUERY = /* GraphQL */ `
  query ShopSocialLinks {
    shop {
      instagramUrl: metafield(namespace: "custom", key: "instagram_url") {
        value
      }
      tiktokUrl: metafield(namespace: "custom", key: "tiktok_url") {
        value
      }
    }
  }
`;

const SHOP_PAYMENT_TRUST_QUERY = /* GraphQL */ `
  query ShopPaymentTrust {
    shop {
      paymentSettings {
        acceptedCardBrands
        supportedDigitalWallets
      }
    }
  }
`;

/** Shopify boş dönerse vitrinde gösterilecek varsayılan rozet sırası */
const DEFAULT_PAYMENT_TRUST_BADGES = ["VISA", "MASTERCARD", "AMERICAN_EXPRESS", "APPLE_PAY", "GOOGLE_PAY"];

const SOCIAL_FEED_POSTS_QUERY = /* GraphQL */ `
  query SocialFeedPosts($first: Int!) {
    metaobjects(type: "social_feed_item", first: $first) {
      edges {
        node {
          id
          handle
          fields {
            key
            value
            reference {
              __typename
              ... on MediaImage {
                image {
                  url
                }
              }
              ... on GenericFile {
                url
              }
            }
          }
        }
      }
    }
  }
`;

/** Meta nesne: kapak için önce Dosya alanı (thumbnail), yoksa thumbnail_url metin bağlantısı. */
function thumbnailUrlFromSocialFields(fields) {
  let urlFromText = "";
  const fileKeys = new Set(["thumbnail", "thumbnail_image", "cover"]);
  for (const field of fields || []) {
    const key = String(field?.key || "");
    const val = String(field?.value || "").trim();
    if (key === "thumbnail_url" && /^https?:\/\//i.test(val)) {
      urlFromText = val;
    }
    if (!fileKeys.has(key)) continue;
    const ref = field?.reference;
    if (!ref) continue;
    if (ref.image?.url) return String(ref.image.url).trim();
    if (ref.url) return String(ref.url).trim();
  }
  return urlFromText;
}

const SHOP_SHIPPING_POLICY_QUERY = /* GraphQL */ `
  query ShopShippingPolicy {
    shop {
      shippingPolicy {
        id
        title
        handle
        url
        body
      }
    }
  }
`;

const SHOP_REFUND_POLICY_QUERY = /* GraphQL */ `
  query ShopRefundPolicy {
    shop {
      refundPolicy {
        id
        title
        handle
        url
        body
      }
    }
  }
`;

const SHOP_PRIVACY_POLICY_QUERY = /* GraphQL */ `
  query ShopPrivacyPolicy {
    shop {
      privacyPolicy {
        id
        title
        handle
        url
        body
      }
    }
  }
`;

const SHOP_TERMS_OF_SERVICE_QUERY = /* GraphQL */ `
  query ShopTermsOfService {
    shop {
      termsOfService {
        id
        title
        handle
        url
        body
      }
    }
  }
`;

const CUSTOMER_CREATE_MUTATION = /* GraphQL */ `
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        firstName
        lastName
        email
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION = /* GraphQL */ `
  mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_RECOVER_MUTATION = /* GraphQL */ `
  mutation CustomerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_BY_TOKEN_QUERY = /* GraphQL */ `
  query CustomerByToken($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
    }
  }
`;

const CUSTOMER_DETAILS_QUERY = /* GraphQL */ `
  query CustomerDetails($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      addresses(first: 20) {
        edges {
          node {
            id
            firstName
            lastName
            address1
            address2
            city
            province
            country
            zip
            phone
          }
        }
      }
      defaultAddress {
        id
      }
      favorites: metafield(namespace: "custom", key: "favorites") {
        value
      }
      spin_wheel_reward: metafield(namespace: "custom", key: "spin_wheel_reward_v4") {
        value
      }
      returnRequests: metafield(namespace: "custom", key: "return_requests") {
        value
      }
      cancelRequests: metafield(namespace: "custom", key: "cancel_requests") {
        value
      }
    }
  }
`;

const CUSTOMER_FAVORITES_QUERY = /* GraphQL */ `
  query CustomerFavorites($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      favorites: metafield(namespace: "custom", key: "favorites") {
        value
      }
    }
  }
`;

const CUSTOMER_ORDERS_QUERY = /* GraphQL */ `
  query CustomerOrders($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      orders(first: 15, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            totalPrice {
              amount
              currencyCode
            }
            statusUrl
            shippingAddress {
              name
              firstName
              lastName
              address1
              address2
              city
              province
              zip
              country
            }
            lineItems(first: 12) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    title
                    image {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CUSTOMER_UPDATE_MUTATION = /* GraphQL */ `
  mutation CustomerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        id
        firstName
        lastName
        email
        phone
      }
      customerUserErrors {
        code
        field
        message
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CUSTOMER_FAVORITES_UPDATE_MUTATION = /* GraphQL */ `
  mutation CustomerFavoritesUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_ADDRESS_CREATE_MUTATION = /* GraphQL */ `
  mutation CustomerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_ADDRESS_UPDATE_MUTATION = /* GraphQL */ `
  mutation CustomerAddressUpdate(
    $customerAccessToken: String!
    $id: ID!
    $address: MailingAddressInput!
  ) {
    customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
      customerAddress {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_ADDRESS_DELETE_MUTATION = /* GraphQL */ `
  mutation CustomerAddressDelete($customerAccessToken: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
      deletedCustomerAddressId
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

function readJudgeMeEnv() {
  const base = (process.env.JUDGEME_API_BASE || "https://api.judge.me/api/v1").replace(/\/$/, "");
  return {
    reviewsUrl: `${base}/reviews`,
    shopDomain: (process.env.JUDGEME_SHOP_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN || "").trim(),
    apiToken: (process.env.JUDGEME_API_TOKEN || process.env.JUDGEME_PRIVATE_TOKEN || "").trim(),
  };
}

function throwTranslatedCustomerUserErrors(errors) {
  const messages = (errors || [])
    .map((e) => {
      const msg = String(e?.message || "").trim();
      if (!msg) return "";
      const code = String(e?.code || "").trim();
      return code ? `${code}: ${msg}` : msg;
    })
    .filter(Boolean);
  if (!messages.length) return;
  throw new Error(translateStorefrontUserErrorMessages(messages));
}

function mergeCustomerUpdateErrors(payload) {
  const a = payload?.customerUserErrors || [];
  const b = payload?.userErrors || [];
  return [...a, ...b];
}

function getEndpoint() {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    throw new Error(
      "Sunucu yapılandırması eksik: SHOPIFY_STORE_DOMAIN veya SHOPIFY_STOREFRONT_ACCESS_TOKEN tanımlı değil."
    );
  }
  return `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
}

async function storefrontFetch(query, variables = {}) {
  const response = await fetch(getEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(
      translateStorefrontUserErrorMessages([`Shopify request failed: ${response.status}`])
    );
  }

  const result = await response.json();
  if (result.errors?.length) {
    throw new Error(
      translateStorefrontUserErrorMessages(result.errors.map((e) => e.message).filter(Boolean))
    );
  }

  return result.data;
}

function normalizeCategory(productType = "", handle = "") {
  const value = `${productType} ${handle}`.toLowerCase();
  if (value.includes("cüzdan") || value.includes("cuzdan") || value.includes("kart")) return "cuzdan-kartlik";
  if (value.includes("tarak") || value.includes("fırça") || value.includes("firca")) return "tarak";
  return "canta";
}

function extractNumericId(rawId = "") {
  const value = String(rawId || "").trim();
  if (!value) return "";
  if (/^\d+$/.test(value)) return value;
  const gidMatch = value.match(/\/(\d+)$/);
  if (gidMatch?.[1]) return gidMatch[1];
  const digits = value.replace(/\D/g, "");
  return digits || "";
}

function parseNumericValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Judge.me metafield may come as JSON string: {"scale_min":"1.0","scale_max":"5.0","value":"5.0"}
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsedJson = JSON.parse(trimmed);
      const nested =
        parsedJson?.value ??
        parsedJson?.rating ??
        parsedJson?.score ??
        null;
      const nestedParsed = parseNumericValue(String(nested ?? ""));
      if (Number.isFinite(nestedParsed)) return nestedParsed;
    } catch {
      // continue with regex fallback
    }
  }

  const normalized = trimmed.replace(",", ".");
  const matched = normalized.match(/-?\d+(\.\d+)?/);
  if (!matched) return null;
  const parsed = Number.parseFloat(matched[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Yorumda görünen isim sansürü: "Ömer Ekin" → "Ö**** E****" (her kelime: ilk harf + dört yıldız).
 */
export function censorReviewerDisplayName(rawName) {
  const s = String(rawName || "")
    .trim()
    .replace(/\s+/g, " ");
  if (!s) return "M****";
  return s
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      const chars = Array.from(word);
      const first = chars[0] || "";
      if (!first) return "****";
      return `${first}****`;
    })
    .join(" ");
}

/** Judge.me: vitrinde gösterilmemesi gereken (spam / gizli) kayıtları ayıkla — ürün sayfası ve hesap listesi. */
export function filterJudgeMePublishedReviews(reviews) {
  if (!Array.isArray(reviews)) return [];
  return reviews.filter((r) => {
    if (!r || typeof r !== "object") return false;
    if (r.hidden === true) return false;
    const curated = String(r.curated ?? "")
      .trim()
      .toLowerCase();
    if (curated === "spam" || curated === "rejected") return false;
    const status = String(r.status ?? "")
      .trim()
      .toLowerCase();
    if (status === "spam" || status === "hidden" || status === "rejected") return false;
    return true;
  });
}

function mapJudgeMeReviewRow(review) {
  const rawReviewer =
    review.reviewer?.name ||
    review.reviewer?.display_name ||
    review.reviewer_name ||
    review.author ||
    review.name ||
    "Müşteri";
  return {
    id: review.id || review.review_id || "",
    rating: Number(parseNumericValue(review.rating) || 0),
    title: review.title || review.review_title || "",
    body: review.body || review.content || review.description || review.review || review.text || "",
    reviewer: censorReviewerDisplayName(rawReviewer),
    createdAt: review.created_at || review.createdAt || "",
  };
}

function reviewBelongsToShopifyProduct(review, productNumericId, productHandle) {
  const ext = review?.product_external_id;
  const extStr = ext != null && ext !== "" ? String(ext) : "";
  if (productNumericId && extStr && extStr === String(productNumericId)) return true;
  const handle = review?.product_handle;
  if (productHandle && handle && String(handle).trim() === String(productHandle).trim()) return true;
  return false;
}

/**
 * Judge.me GET /reviews: Shopify ürün kimliği query’de `external_id`, yedek olarak `handle`.
 * Mağaza geneli sayfalama + filtre en son güvence.
 */
async function fetchJudgeMeReviews(productNumericId, productHandle = "") {
  const cleanId = String(productNumericId || "").trim();
  const handle = String(productHandle || "").trim();
  if (!cleanId && !handle) return [];

  const { reviewsUrl, shopDomain, apiToken } = readJudgeMeEnv();
  if (!shopDomain) {
    console.warn("[JudgeMe][fetchReviews] Missing JUDGEME_SHOP_DOMAIN (or SHOPIFY_STORE_DOMAIN)");
    return [];
  }
  if (!apiToken) {
    console.warn("[JudgeMe][fetchReviews] Missing JUDGEME_API_TOKEN / JUDGEME_PRIVATE_TOKEN");
    return [];
  }

  const authHeaders = { "X-Api-Token": apiToken };
  const fetchOpts = {
    cache: "no-store",
    next: { revalidate: 0 },
    headers: authHeaders,
  };

  const runList = async (params) => {
    const url = new URL(reviewsUrl);
    url.searchParams.set("shop_domain", shopDomain);
    url.searchParams.set("api_token", apiToken);
    for (const [k, v] of Object.entries(params)) {
      if (v != null && v !== "") url.searchParams.set(k, String(v));
    }
    const fetchUrl = url.toString();
    const safeUrl = `${url.origin}${url.pathname}?${new URLSearchParams(
      [...url.searchParams].filter(([key]) => key !== "api_token")
    ).toString()}`;
    debugLog("API URL:", safeUrl);

    const response = await fetch(fetchUrl, fetchOpts);
    if (!response.ok) {
      const body = await response.text();
      const logPayload = {
        status: response.status,
        cleanId: cleanId || null,
        handle: handle || null,
        url: safeUrl,
        body: body.slice(0, 500),
        shopDomain,
        tokenLength: apiToken.length,
      };
      if (response.status === 401) {
        Object.assign(logPayload, {
          hint:
            "Judge.me 401: private token veya shop_domain bu Judge.me hesabıyla eşleşmiyor. " +
            "https://judge.me/settings?jump_to=judge.me+api adresinden Private token'ı yeniden kopyalayın; " +
            "shop_domain tam olarak .myshopify.com adresi olmalı (başında https yok).",
        });
      }
      console.warn("[JudgeMe][fetchReviews][non-200]", logPayload);
      return null;
    }
    const data = await response.json();
    debugLog("GELEN VERİ:", data);
    return data;
  };

  try {
    let rows = [];

    if (cleanId) {
      const byExternal = await runList({ external_id: cleanId, per_page: "24", page: "1" });
      if (byExternal) {
        rows = Array.isArray(byExternal.reviews) ? byExternal.reviews : [];
      }
    }

    if (rows.length === 0 && handle) {
      const byHandle = await runList({ handle, per_page: "24", page: "1" });
      if (byHandle) {
        rows = Array.isArray(byHandle.reviews) ? byHandle.reviews : [];
      }
    }

    if (rows.length === 0 && cleanId) {
      const maxPages = 5;
      const perPage = "50";
      for (let page = 1; page <= maxPages; page += 1) {
        const batch = await runList({ per_page: perPage, page: String(page) });
        if (!batch) break;
        const chunk = Array.isArray(batch?.reviews) ? batch.reviews : [];
        const matched = chunk.filter((r) => reviewBelongsToShopifyProduct(r, cleanId, handle));
        rows = rows.concat(matched);
        if (chunk.length < Number(perPage)) break;
      }
    }

    rows = filterJudgeMePublishedReviews(rows);
    const seenIds = new Set();
    rows = rows.filter((r) => {
      const rid = r?.id ?? r?.review_id;
      if (rid == null || rid === "") return true;
      const key = String(rid);
      if (seenIds.has(key)) return false;
      seenIds.add(key);
      return true;
    });

    const mapped = rows.map(mapJudgeMeReviewRow);
    debugLog("[JudgeMe][fetchReviews][summary]", {
      cleanId: cleanId || null,
      handle: handle || null,
      count: mapped.length,
    });
    return mapped;
  } catch {
    return [];
  }
}

const colorMap = {
  krem: "#F5F5DC",
  beige: "#D4C4A8",
  black: "#1a1a1a",
  white: "#F8F8F8",
  brown: "#5C4033",
  tan: "#A67B5B",
  nude: "#D8B7A6",
  pink: "#E8D5D5",
  mint: "#98D4BB",
  gray: "#808080",
  grey: "#808080",
  anthracite: "#383838",
  charcoal: "#383838",
  siyah: "#1a1a1a",
  antrasit: "#383838",
  vizon: "#8B7355",
  bej: "#D4C4A8",
  kahve: "#5C4033",
  pudra: "#E8D5D5",
  mint: "#98D4BB",
  taba: "#A67B5B",
};

/** Yorum listesi vb. için hafif sorgu — kapak veya ilk görsel URL. */
export async function getProductFeaturedImageByHandle(handle) {
  const h = String(handle || "").trim();
  if (!h) return null;
  try {
    const data = await storefrontFetch(PRODUCT_FEATURED_IMAGE_QUERY, { handle: h });
    const node = data?.product;
    if (!node) return null;
    const featured = node?.featuredImage?.url;
    if (featured) return featured;
    return node?.images?.edges?.[0]?.node?.url || null;
  } catch {
    return null;
  }
}

export async function getShopShippingPolicy() {
  const data = await storefrontFetch(SHOP_SHIPPING_POLICY_QUERY);
  const shippingPolicy = data?.shop?.shippingPolicy || null;
  if (!shippingPolicy) return null;

  return {
    id: shippingPolicy.id || "",
    title: shippingPolicy.title || "Kargo ve teslimat politikasi",
    handle: shippingPolicy.handle || "",
    url: shippingPolicy.url || "",
    body: shippingPolicy.body || "",
  };
}

export async function getShopRefundPolicy() {
  const data = await storefrontFetch(SHOP_REFUND_POLICY_QUERY);
  const refundPolicy = data?.shop?.refundPolicy || null;
  if (!refundPolicy) return null;

  return {
    id: refundPolicy.id || "",
    title: refundPolicy.title || "İade ve değişim politikası",
    handle: refundPolicy.handle || "",
    url: refundPolicy.url || "",
    body: refundPolicy.body || "",
  };
}

export async function getShopPrivacyPolicy() {
  const data = await storefrontFetch(SHOP_PRIVACY_POLICY_QUERY);
  const privacyPolicy = data?.shop?.privacyPolicy || null;
  if (!privacyPolicy) return null;

  return {
    id: privacyPolicy.id || "",
    title: privacyPolicy.title || "Gizlilik Politikası",
    handle: privacyPolicy.handle || "",
    url: privacyPolicy.url || "",
    body: privacyPolicy.body || "",
  };
}

export async function getShopTermsOfServicePolicy() {
  const data = await storefrontFetch(SHOP_TERMS_OF_SERVICE_QUERY);
  const termsOfService = data?.shop?.termsOfService || null;
  if (!termsOfService) return null;

  return {
    id: termsOfService.id || "",
    title: termsOfService.title || "Şartlar ve Koşullar",
    handle: termsOfService.handle || "",
    url: termsOfService.url || "",
    body: termsOfService.body || "",
  };
}

export async function getUgcVideos(first = 12) {
  const data = await storefrontFetch(UGC_VIDEOS_QUERY, { first });
  const edges = data?.metaobjects?.edges || [];

  const items = edges
    .map((edge) => edge?.node)
    .filter(Boolean)
    .map((node) => {
      const fieldMap = Object.fromEntries(
        (node?.fields || [])
          .filter((field) => field?.key)
          .map((field) => [String(field.key), String(field.value || "").trim()])
      );
      const sortOrderCandidate = Number.parseInt(String(fieldMap.sort_order || "9999"), 10);
      const sortOrder = Number.isFinite(sortOrderCandidate) ? sortOrderCandidate : 9999;
      const isActiveRaw = (fieldMap.is_active || "true").trim().toLowerCase();
      const isActive = ["true", "1", "evet", "yes", "on", "aktif"].includes(isActiveRaw);

      return {
        id: node.id,
        handle: node.handle || "",
        title: fieldMap.title || "",
        subtitle: fieldMap.subtitle || "",
        videoUrl: fieldMap.video_url || "",
        thumbnailUrl: fieldMap.thumbnail_url || "",
        productHandle: fieldMap.product_handle || "",
        ctaText: fieldMap.cta_text || "Hemen Satin Al",
        isActive,
        sortOrder,
      };
    })
    .filter((item) => item.isActive && item.videoUrl);

  return items.sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Ödeme güven şeridi: mağazanın kabul ettiği kart markaları + dijital cüzdanlar (Shopify Payments).
 */
export async function getShopPaymentTrustBadges() {
  const rank = (k) => {
    const order = {
      VISA: 1,
      MASTERCARD: 2,
      AMERICAN_EXPRESS: 3,
      DISCOVER: 4,
      JCB: 5,
      DINERS_CLUB: 6,
      APPLE_PAY: 10,
      GOOGLE_PAY: 11,
      SHOPIFY_PAY: 12,
      ANDROID_PAY: 13,
    };
    return order[k] ?? 99;
  };
  try {
    const data = await storefrontFetch(SHOP_PAYMENT_TRUST_QUERY);
    const ps = data?.shop?.paymentSettings;
    if (!ps) return [...DEFAULT_PAYMENT_TRUST_BADGES];
    const cards = Array.isArray(ps.acceptedCardBrands) ? ps.acceptedCardBrands : [];
    const wallets = Array.isArray(ps.supportedDigitalWallets) ? ps.supportedDigitalWallets : [];
    const merged = [...new Set([...cards, ...wallets].filter(Boolean))];
    merged.sort((a, b) => rank(a) - rank(b) || String(a).localeCompare(String(b)));
    return merged.length ? merged : [...DEFAULT_PAYMENT_TRUST_BADGES];
  } catch {
    return [...DEFAULT_PAYMENT_TRUST_BADGES];
  }
}

/**
 * Mağaza metin alanları: custom.instagram_url, custom.tiktok_url (Storefront’ta açık olmalı).
 * Boşsa NEXT_PUBLIC_INSTAGRAM_URL / NEXT_PUBLIC_TIKTOK_URL env yedekleri kullanılır.
 */
export async function getShopSocialLinks() {
  let instagram = String(process.env.NEXT_PUBLIC_INSTAGRAM_URL || "").trim();
  let tiktok = String(process.env.NEXT_PUBLIC_TIKTOK_URL || "").trim();
  try {
    const data = await storefrontFetch(SHOP_SOCIAL_LINKS_QUERY);
    const shop = data?.shop;
    const fromMeta = (v) => String(v || "").trim();
    const ig = fromMeta(shop?.instagramUrl?.value);
    const tt = fromMeta(shop?.tiktokUrl?.value);
    if (ig) instagram = ig;
    if (tt) tiktok = tt;
  } catch {
    // Metin alanları tanımlı değilse veya Storefront erişimi yoksa env kullan.
  }
  return { instagramUrl: instagram, tiktokUrl: tiktok };
}

/**
 * Metaobject tipi: social_feed_item
 * Alanlar: post_url, caption, thumbnail_url veya thumbnail (dosya), sort_order, is_active
 * Kapak: "thumbnail" adında Dosya (görsel) alanı — bilgisayardan yükleme; yoksa thumbnail_url metin URL.
 */
export async function getSocialFeedPosts(first = 12) {
  try {
    const data = await storefrontFetch(SOCIAL_FEED_POSTS_QUERY, { first });
    const edges = data?.metaobjects?.edges || [];

    const items = edges
      .map((edge) => edge?.node)
      .filter(Boolean)
      .map((node) => {
        const rawFields = node?.fields || [];
        const fieldMap = Object.fromEntries(
          rawFields
            .filter((field) => field?.key)
            .map((field) => [String(field.key), String(field.value || "").trim()])
        );
        const thumbResolved = thumbnailUrlFromSocialFields(rawFields);
        const sortOrderCandidate = Number.parseInt(String(fieldMap.sort_order || "9999"), 10);
        const sortOrder = Number.isFinite(sortOrderCandidate) ? sortOrderCandidate : 9999;
        const isActiveRaw = (fieldMap.is_active || "true").trim().toLowerCase();
        const isActive = ["true", "1", "evet", "yes", "on", "aktif"].includes(isActiveRaw);
        const postUrl = fieldMap.post_url || "";
        const platformRaw = (fieldMap.platform || "").trim().toLowerCase();
        let platform = platformRaw;
        if (!platform || !["instagram", "tiktok"].includes(platform)) {
          if (postUrl.includes("tiktok.com")) platform = "tiktok";
          else if (postUrl.includes("instagram.com")) platform = "instagram";
          else platform = "instagram";
        }

        return {
          id: node.id,
          handle: node.handle || "",
          postUrl,
          caption: fieldMap.caption || "",
          thumbnailUrl: thumbResolved || fieldMap.thumbnail_url || "",
          platform,
          isActive,
          sortOrder,
        };
      })
      .filter((item) => item.isActive && item.postUrl);

    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return [];
  }
}

export async function getSocialFeedBundle(first = 8) {
  const [links, posts] = await Promise.all([getShopSocialLinks(), getSocialFeedPosts(Math.max(first, 12))]);
  return {
    instagramUrl: links.instagramUrl,
    tiktokUrl: links.tiktokUrl,
    posts: posts.slice(0, first),
  };
}

export async function getProducts(first = 24) {
  const data = await storefrontFetch(PRODUCTS_QUERY, { first });
  const edges = data?.products?.edges || [];

  const products = edges.map(({ node }) => {
    const variants = (node?.variants?.edges || []).map((edge) => edge.node).filter(Boolean);
    const prices = variants.map((v) => Number(v?.price?.amount || 0)).filter((p) => p > 0);
    const comparePrices = variants.map((v) => Number(v?.compareAtPrice?.amount || 0)).filter((p) => p > 0);
    const rangePrice = Number(node?.priceRange?.minVariantPrice?.amount || 0);
    const rangeCompare = Number(node?.compareAtPriceRange?.minVariantPrice?.amount || 0);
    const minPrice = prices.length ? Math.min(...prices) : rangePrice;
    const minCompare = comparePrices.length ? Math.min(...comparePrices) : (rangeCompare > 0 ? rangeCompare : undefined);
    const discount = minCompare && minCompare > minPrice
      ? Math.round(((minCompare - minPrice) / minCompare) * 100)
      : undefined;

    const inStock = variants.some(
      (v) => Boolean(v?.availableForSale) && ((v?.quantityAvailable ?? 1) > 0)
    );
    const stockQuantity = variants.reduce((sum, variant) => {
      if (!variant?.availableForSale) return sum;
      const qty = Number(variant?.quantityAvailable ?? 0);
      return sum + (Number.isFinite(qty) && qty > 0 ? qty : 0);
    }, 0);

    const optionEntries = node?.options || [];
    const optionColorValues = optionEntries
      .filter((option) => ["color", "renk"].includes(String(option?.name || "").toLowerCase()))
      .flatMap((option) => option?.values || []);

    const variantColorValues = variants
      .flatMap((variant) => variant?.selectedOptions || [])
      .filter((option) => ["color", "renk"].includes((option.name || "").toLowerCase()))
      .map((option) => option.value);

    const optionColors = Array.from(new Set([...optionColorValues, ...variantColorValues]));
    const colorStockByName = variants.reduce((acc, variant) => {
      if (!variant?.availableForSale) return acc;
      const qty = Number(variant?.quantityAvailable ?? 0);
      if (!Number.isFinite(qty) || qty <= 0) return acc;
      const colorOption = (variant?.selectedOptions || []).find((option) =>
        ["color", "renk"].includes(String(option?.name || "").toLowerCase())
      );
      const colorName = String(colorOption?.value || "Standart").trim() || "Standart";
      acc[colorName] = (acc[colorName] || 0) + qty;
      return acc;
    }, {});

    const colors = optionColors.length
      ? optionColors.map((name) => ({
          name,
          hex: colorMap[String(name).toLowerCase()] || "#D4C4A8",
        }))
      : [{ name: "Standart", hex: "#D4C4A8" }];

    const images = Array.from(
      new Set(
        [node?.featuredImage?.url, ...(node?.images?.edges || []).map((edge) => edge?.node?.url)].filter(Boolean)
      )
    );

    const normalizedTags = (node?.tags || []).map((tag) => normalizeText(tag));

    return {
      id: node.id,
      name: node.title,
      slug: node.handle,
      price: minPrice,
      originalPrice: minCompare,
      discount,
      images,
      category: normalizeCategory(node?.productType, node?.handle),
      subcategory: node?.productType || "Ürün",
      tags: node?.tags || [],
      collections: (node?.collections?.edges || []).map((edge) => ({
        id: edge?.node?.id || "",
        title: edge?.node?.title || "",
        handle: edge?.node?.handle || "",
      })),
      colors,
      isNew: normalizedTags.some((tag) => ["new", "yeni"].includes(tag)),
      isBestseller: normalizedTags.some((tag) =>
        ["bestseller", "cok satan", "cok-satan", "coksatan"].includes(tag)
      ),
      inStock,
      stockQuantity,
      colorStockByName,
      description: node?.description || "",
      variantId: variants[0]?.id || "",
    };
  });

  debugLog("[Shopify][getProducts] products:", products);
  return products;
}

export async function getProduct(handle) {
  if (!handle) return null;

  const data = await storefrontFetch(PRODUCT_BY_HANDLE_QUERY, { handle });
  const node = data?.product;
  if (!node) return null;

  const variants = (node?.variants?.edges || []).map((edge) => edge.node).filter(Boolean);
  const prices = variants.map((v) => Number(v?.price?.amount || 0)).filter((p) => p > 0);
  const comparePrices = variants.map((v) => Number(v?.compareAtPrice?.amount || 0)).filter((p) => p > 0);
  const rangePrice = Number(node?.priceRange?.minVariantPrice?.amount || 0);
  const rangeCompare = Number(node?.compareAtPriceRange?.minVariantPrice?.amount || 0);
  const minPrice = prices.length ? Math.min(...prices) : rangePrice;
  const minCompare = comparePrices.length ? Math.min(...comparePrices) : (rangeCompare > 0 ? rangeCompare : undefined);
  const discount =
    minCompare && minCompare > minPrice
      ? Math.round(((minCompare - minPrice) / minCompare) * 100)
      : undefined;

  const inStock = variants.some(
    (v) => Boolean(v?.availableForSale) && ((v?.quantityAvailable ?? 1) > 0)
  );

  const images = Array.from(
    new Set(
      [node?.featuredImage?.url, ...(node?.images?.edges || []).map((edge) => edge?.node?.url)].filter(Boolean)
    )
  );

  const mediaNodes = (node?.media?.edges || []).map((edge) => edge?.node).filter(Boolean);
  const internalVideo = mediaNodes
    .filter((media) => media?.__typename === "Video")
    .flatMap((media) => media?.sources || [])
    .find((source) => String(source?.mimeType || "").includes("video"))?.url || "";
  const externalVideo =
    mediaNodes.find((media) => media?.__typename === "ExternalVideo")?.originUrl ||
    mediaNodes.find((media) => media?.__typename === "ExternalVideo")?.embedUrl ||
    "";
  const metafieldVideo =
    String(node?.product_video?.value || "").trim() ||
    String(node?.urun_tanitim_videosu?.value || "").trim();
  const videoUrl = internalVideo || externalVideo || metafieldVideo || "";

  const metafields = [node?.materyal, node?.i_c_astar, node?.i_scilik]
    .filter((field) => field?.key && field?.value)
    .map((field) => ({
      key: field.key,
      value: field.value,
    }));

  const ratingRaw = node?.review_rating?.value ?? null;
  const reviewRating = parseNumericValue(ratingRaw);

  const ratingCountRaw = node?.review_rating_count?.value ?? null;
  const parsedReviewCount = Number.parseInt(String(ratingCountRaw ?? "").trim(), 10);
  const reviewRatingCount = Number.isFinite(parsedReviewCount) ? parsedReviewCount : 0;
  const productNumericId = extractNumericId(node?.id || "");
  const reviews = await fetchJudgeMeReviews(productNumericId, node?.handle || "");
  const reviewRatingsFromApi = reviews
    .map((review) => parseNumericValue(review?.rating))
    .filter((rating) => Number.isFinite(rating) && rating > 0);
  const computedReviewCount = reviewRatingsFromApi.length;
  const computedReviewRating = computedReviewCount
    ? reviewRatingsFromApi.reduce((sum, rating) => sum + Number(rating), 0) / computedReviewCount
    : null;
  const finalReviewRating = computedReviewRating ?? reviewRating;
  const finalReviewCount = computedReviewCount > 0 ? computedReviewCount : reviewRatingCount;

  debugLog("[Shopify][getProduct][reviewsMeta]", {
    handle,
    productId: node?.id || null,
    reviewRatingRaw: node?.review_rating?.value ?? null,
    reviewRatingParsed: reviewRating,
    reviewRatingCountRaw: node?.review_rating_count?.value ?? null,
    reviewRatingCountParsed: reviewRatingCount,
    judgeMeReviewsCount: reviews.length,
    computedReviewRating,
    computedReviewCount,
    finalReviewRating,
    finalReviewCount,
  });

  return {
    id: node.id,
    name: node.title,
    slug: node.handle,
    description: node.description || "",
    category: normalizeCategory(node?.productType, node?.handle),
    subcategory: node?.productType || "Ürün",
    tags: node?.tags || [],
    collections: (node?.collections?.edges || []).map((edge) => ({
      id: edge?.node?.id || "",
      title: edge?.node?.title || "",
      handle: edge?.node?.handle || "",
    })),
    options: node?.options || [],
    metafields,
    reviewRating: finalReviewRating,
    reviewRatingCount: Number.isFinite(finalReviewCount) ? finalReviewCount : 0,
    reviews,
    judgemeWidget: node?.judgeme_widget?.value || "",
    judgemeBadge: node?.judgeme_badge?.value || "",
    variants: variants.map((variant) => ({
      id: variant.id,
      title: variant.title,
      availableForSale: Boolean(variant.availableForSale),
      quantityAvailable: variant.quantityAvailable ?? 0,
      price: Number(variant?.price?.amount || 0),
      compareAtPrice: Number(variant?.compareAtPrice?.amount || 0) || undefined,
      image: variant?.image?.url || "",
      selectedOptions: variant?.selectedOptions || [],
    })),
    images,
    videoUrl,
    price: minPrice,
    originalPrice: minCompare,
    discount,
    inStock,
  };
}

export async function customerCreate(input) {
  const data = await storefrontFetch(CUSTOMER_CREATE_MUTATION, { input });
  const payload = data?.customerCreate;
  const errors = payload?.customerUserErrors || [];
  if (errors.length) {
    throwTranslatedCustomerUserErrors(errors);
  }
  return payload?.customer || null;
}

export async function customerAccessTokenCreate(email, password) {
  const data = await storefrontFetch(CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, {
    input: { email, password },
  });
  const payload = data?.customerAccessTokenCreate;
  const errors = payload?.customerUserErrors || [];
  if (errors.length) {
    throwTranslatedCustomerUserErrors(errors);
  }
  return payload?.customerAccessToken || null;
}

/** Sends Shopify’s password reset email to the customer if the address exists. */
export async function customerRecover(email) {
  const data = await storefrontFetch(CUSTOMER_RECOVER_MUTATION, { email });
  const payload = data?.customerRecover;
  const errors = payload?.customerUserErrors || [];
  if (errors.length) {
    throwTranslatedCustomerUserErrors(errors);
  }
  return true;
}

const CUSTOMER_RESET_BY_URL_MUTATION = /* GraphQL */ `
  mutation CustomerResetByUrl($resetUrl: URL!, $password: String!) {
    customerResetByUrl(resetUrl: $resetUrl, password: $password) {
      customerUserErrors {
        code
        field
        message
      }
      customer {
        id
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
    }
  }
`;

/**
 * Completes password reset using the full URL from the recovery email (headless flow).
 * @returns {{ accessToken: string } | null}
 */
export async function customerResetByUrl(resetUrl, password) {
  const data = await storefrontFetch(CUSTOMER_RESET_BY_URL_MUTATION, { resetUrl, password });
  const payload = data?.customerResetByUrl;
  const errors = payload?.customerUserErrors || [];
  if (errors.length) {
    throwTranslatedCustomerUserErrors(errors);
  }
  return payload?.customerAccessToken || null;
}

export async function getCustomerByAccessToken(customerAccessToken) {
  if (!customerAccessToken) return null;
  const data = await storefrontFetch(CUSTOMER_BY_TOKEN_QUERY, { customerAccessToken });
  return data?.customer || null;
}

function parseCustomerTicketList(raw) {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeTicket(entry) {
  if (!entry || typeof entry !== "object") return null;
  const orderId = String(entry.orderId || "").trim();
  const orderNumber = Number(entry.orderNumber);
  const reason = String(entry.reason || "").trim();
  if (!orderId || !Number.isFinite(orderNumber) || !reason) return null;
  const createdAt = String(entry.createdAt || "").trim() || new Date(0).toISOString();
  const id = String(entry.id || "").trim() || `${orderId}:${createdAt}`;
  return {
    id,
    orderId,
    orderNumber,
    reason,
    note: String(entry.note || "").trim() || undefined,
    status: String(entry.status || "beklemede").trim() || "beklemede",
    createdAt,
    shopifyReturnId: String(entry.shopifyReturnId || "").trim() || undefined,
    shopifyReturnName: String(entry.shopifyReturnName || "").trim() || undefined,
  };
}

export async function getCustomerDetails(customerAccessToken) {
  if (!customerAccessToken) return null;
  const data = await storefrontFetch(CUSTOMER_DETAILS_QUERY, { customerAccessToken });
  const customer = data?.customer;
  if (!customer) return null;

  const rawReturns = parseCustomerTicketList(customer?.returnRequests?.value);
  const rawCancels = parseCustomerTicketList(customer?.cancelRequests?.value);

  return {
    id: customer.id,
    firstName: customer.firstName || "",
    lastName: customer.lastName || "",
    email: customer.email || "",
    phone: customer.phone || "",
    addresses: (customer?.addresses?.edges || []).map((edge) => edge?.node).filter(Boolean),
    defaultAddressId: customer?.defaultAddress?.id || "",
    favoritesRaw: customer?.favorites?.value || "[]",
    spinWheelRewardRaw: customer?.spin_wheel_reward?.value || "",
    returnTickets: rawReturns.map(normalizeTicket).filter(Boolean),
    cancelTickets: rawCancels.map(normalizeTicket).filter(Boolean),
  };
}

export async function getCustomerFavorites(customerAccessToken) {
  if (!customerAccessToken) return [];
  const data = await storefrontFetch(CUSTOMER_FAVORITES_QUERY, { customerAccessToken });
  const raw = data?.customer?.favorites?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setCustomerFavorites(customerAccessToken, favorites) {
  if (!customerAccessToken) throw new Error("Yetkilendirme bulunamadı.");
  const value = JSON.stringify(Array.isArray(favorites) ? favorites : []);
  const data = await storefrontFetch(CUSTOMER_FAVORITES_UPDATE_MUTATION, {
    customerAccessToken,
    customer: {
      metafields: [
        {
          namespace: "custom",
          key: "favorites",
          type: "json",
          value,
        },
      ],
    },
  });
  const payload = data?.customerUpdate;
  const errors = payload?.customerUserErrors || [];
  if (errors.length) {
    throwTranslatedCustomerUserErrors(errors);
  }
  return true;
}

export async function getCustomerOrders(customerAccessToken) {
  if (!customerAccessToken) return [];
  const data = await storefrontFetch(CUSTOMER_ORDERS_QUERY, { customerAccessToken });
  const edges = data?.customer?.orders?.edges || [];
  return edges
    .map((edge) => {
      const node = edge?.node;
      if (!node) return null;
      const lineItems = (node.lineItems?.edges || [])
        .map((e) => e?.node)
        .filter(Boolean)
        .map((li) => ({
          title: li.title || "",
          quantity: typeof li.quantity === "number" ? li.quantity : 0,
          variantImage: li.variant?.image?.url || null,
          variantImageAlt: li.variant?.image?.altText || li.title || null,
        }));
      const addr = node.shippingAddress;
      let shippingRecipient = "";
      let shippingSummary = null;
      if (addr) {
        shippingRecipient =
          [addr.firstName, addr.lastName].filter(Boolean).join(" ").trim() || addr.name || "";
        shippingSummary = [addr.address1, addr.address2, addr.city, addr.province, addr.zip, addr.country]
          .filter(Boolean)
          .join(", ");
      }
      return {
        id: node.id,
        orderNumber: node.orderNumber,
        processedAt: node.processedAt,
        financialStatus: node.financialStatus,
        fulfillmentStatus: node.fulfillmentStatus,
        totalPrice: node.totalPrice,
        statusUrl: node.statusUrl || null,
        lineItems,
        shippingRecipient,
        shippingSummary,
      };
    })
    .filter(Boolean);
}

export async function customerUpdate(customerAccessToken, customer) {
  if (!customerAccessToken) throw new Error("Yetkilendirme bulunamadı.");
  const data = await storefrontFetch(CUSTOMER_UPDATE_MUTATION, { customerAccessToken, customer });
  const payload = data?.customerUpdate;
  const errors = mergeCustomerUpdateErrors(payload);
  if (errors.length) {
    throwTranslatedCustomerUserErrors(errors);
  }
  return payload?.customer || null;
}

export async function customerAddressCreate(customerAccessToken, address) {
  if (!customerAccessToken) throw new Error("Yetkilendirme bulunamadı.");
  const data = await storefrontFetch(CUSTOMER_ADDRESS_CREATE_MUTATION, { customerAccessToken, address });
  const payload = data?.customerAddressCreate;
  const errors = payload?.customerUserErrors || [];
  if (errors.length) {
    throwTranslatedCustomerUserErrors(errors);
  }
  return payload?.customerAddress || null;
}

export async function customerAddressUpdate(customerAccessToken, id, address) {
  if (!customerAccessToken) throw new Error("Yetkilendirme bulunamadı.");
  const data = await storefrontFetch(CUSTOMER_ADDRESS_UPDATE_MUTATION, { customerAccessToken, id, address });
  const payload = data?.customerAddressUpdate;
  const errors = payload?.customerUserErrors || [];
  if (errors.length) {
    throwTranslatedCustomerUserErrors(errors);
  }
  return payload?.customerAddress || null;
}

export async function customerAddressDelete(customerAccessToken, id) {
  if (!customerAccessToken) throw new Error("Yetkilendirme bulunamadı.");
  const data = await storefrontFetch(CUSTOMER_ADDRESS_DELETE_MUTATION, { customerAccessToken, id });
  const payload = data?.customerAddressDelete;
  const errors = payload?.customerUserErrors || [];
  if (errors.length) {
    throwTranslatedCustomerUserErrors(errors);
  }
  return payload?.deletedCustomerAddressId || null;
}
