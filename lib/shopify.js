import "server-only";

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

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

const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      productType
      tags
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
    }
  }
`;

function getEndpoint() {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    throw new Error(
      "Missing Shopify env vars: SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_ACCESS_TOKEN"
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
    throw new Error(`Shopify request failed: ${response.status}`);
  }

  const result = await response.json();
  if (result.errors?.length) {
    throw new Error(result.errors.map((e) => e.message).join(", "));
  }

  return result.data;
}

function normalizeCategory(productType = "", handle = "") {
  const value = `${productType} ${handle}`.toLowerCase();
  if (value.includes("cüzdan") || value.includes("cuzdan") || value.includes("kart")) return "cuzdan-kartlik";
  if (value.includes("tarak") || value.includes("fırça") || value.includes("firca")) return "tarak";
  return "canta";
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

export async function getProducts(first = 24) {
  const data = await storefrontFetch(PRODUCTS_QUERY, { first });
  const edges = data?.products?.edges || [];

  const products = edges.map(({ node }) => {
    const variants = (node?.variants?.edges || []).map((edge) => edge.node).filter(Boolean);
    const prices = variants.map((v) => Number(v?.price?.amount || 0)).filter((p) => p > 0);
    const comparePrices = variants.map((v) => Number(v?.compareAtPrice?.amount || 0)).filter((p) => p > 0);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const minCompare = comparePrices.length ? Math.min(...comparePrices) : undefined;
    const discount = minCompare && minCompare > minPrice
      ? Math.round(((minCompare - minPrice) / minCompare) * 100)
      : undefined;

    const inStock = variants.some(
      (v) => Boolean(v?.availableForSale) && ((v?.quantityAvailable ?? 1) > 0)
    );

    const optionEntries = node?.options || [];
    const optionColorValues = optionEntries
      .filter((option) => ["color", "renk"].includes(String(option?.name || "").toLowerCase()))
      .flatMap((option) => option?.values || []);

    const variantColorValues = variants
      .flatMap((variant) => variant?.selectedOptions || [])
      .filter((option) => ["color", "renk"].includes((option.name || "").toLowerCase()))
      .map((option) => option.value);

    const optionColors = Array.from(new Set([...optionColorValues, ...variantColorValues]));

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
      isNew: (node?.tags || []).some((tag) => ["new", "yeni"].includes(String(tag).toLowerCase())),
      isBestseller: (node?.tags || []).some((tag) =>
        ["bestseller", "çok satan", "cok-satan", "coksatan"].includes(String(tag).toLowerCase())
      ),
      inStock,
      description: node?.description || "",
      variantId: variants[0]?.id || "",
    };
  });

  console.log("[Shopify][getProducts] products:", products);
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
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const minCompare = comparePrices.length ? Math.min(...comparePrices) : undefined;
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
    price: minPrice,
    originalPrice: minCompare,
    discount,
    inStock,
  };
}
