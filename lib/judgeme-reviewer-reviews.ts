import "server-only";

import { filterJudgeMePublishedReviews, getProductFeaturedImageByHandle } from "./shopify.js";

export type JudgeMeReviewerReview = {
  id: string | number;
  productTitle: string;
  productHandle: string;
  rating: number;
  body: string;
  createdAt: string;
  imageUrl: string | null;
};

function firstPictureUrl(review: Record<string, unknown>): string | null {
  const pics = review?.pictures;
  if (!Array.isArray(pics) || pics.length === 0) return null;
  for (const pic of pics) {
    if (!pic || typeof pic !== "object") continue;
    const hidden = (pic as { hidden?: boolean }).hidden;
    if (hidden) continue;
    const urls = (pic as { urls?: Record<string, string> }).urls;
    const url = urls?.compact || urls?.small || urls?.huge || urls?.original;
    if (typeof url === "string" && url.startsWith("http")) return url;
  }
  return null;
}

/**
 * Judge.me GET /reviews — mağaza + private token + reviewer e-postası ile yorum listesi.
 * `reviewer_email` desteklenmezse boş dönebilir; o durumda Judge.me panelindeki parametre adını kontrol edin.
 */
export async function fetchJudgeMeReviewsByReviewerEmail(
  customerEmail: string
): Promise<JudgeMeReviewerReview[]> {
  const email = String(customerEmail || "").trim().toLowerCase();
  if (!email) return [];

  const apiToken = (process.env.JUDGEME_PRIVATE_TOKEN || process.env.JUDGEME_API_TOKEN || "").trim();
  const shopDomain = (process.env.JUDGEME_SHOP_DOMAIN || "nwjti9-bw.myshopify.com").trim();
  if (!apiToken) return [];

  const url = new URL("https://judge.me/api/v1/reviews");
  url.searchParams.set("shop_domain", shopDomain);
  url.searchParams.set("api_token", apiToken);
  url.searchParams.set("reviewer_email", email);
  url.searchParams.set("per_page", "50");

  try {
    const response = await fetch(url.toString(), {
      cache: "no-store",
      next: { revalidate: 0 },
      headers: { "X-Api-Token": apiToken },
    });
    if (!response.ok) return [];

    const data = (await response.json()) as { reviews?: unknown[] };
    const rows = Array.isArray(data?.reviews) ? data.reviews : [];
    const published = filterJudgeMePublishedReviews(rows);
    const byEmail = published.filter((raw) => {
      const review = raw as Record<string, unknown>;
      const reviewer = review?.reviewer as Record<string, unknown> | undefined;
      const rowEmail = String(reviewer?.email || "")
        .trim()
        .toLowerCase();
      if (!rowEmail) return true;
      return rowEmail === email;
    });
    return byEmail.map((raw) => {
      const review = raw as Record<string, unknown>;
      const reviewer = review?.reviewer as Record<string, unknown> | undefined;
      const ratingNum = Number(review?.rating ?? 0);
      return {
        id: (review?.id ?? review?.review_id ?? "") as string | number,
        productTitle: String(review?.product_title ?? "Ürün").trim() || "Ürün",
        productHandle: String(review?.product_handle ?? "").trim(),
        rating: Number.isFinite(ratingNum) ? ratingNum : 0,
        body: typeof review?.body === "string" ? review.body : "",
        createdAt: String(review?.created_at ?? review?.createdAt ?? ""),
        imageUrl: firstPictureUrl(review),
      };
    });
  } catch {
    return [];
  }
}

/** Judge.me’deki görsel yoksa veya zayıfsa Shopify ürün handle’ına göre kapak görseli doldurur. */
export async function attachShopifyProductImagesToReviews(
  reviews: JudgeMeReviewerReview[]
): Promise<JudgeMeReviewerReview[]> {
  if (!reviews.length) return reviews;
  const handles = [...new Set(reviews.map((r) => String(r.productHandle || "").trim()).filter(Boolean))];
  const byHandle = new Map<string, string | null>();
  const chunk = 6;
  for (let i = 0; i < handles.length; i += chunk) {
    const slice = handles.slice(i, i + chunk);
    await Promise.all(
      slice.map(async (handle) => {
        const url = await getProductFeaturedImageByHandle(handle);
        byHandle.set(handle, url);
      })
    );
  }
  return reviews.map((r) => {
    const h = String(r.productHandle || "").trim();
    const shopifyUrl = h ? byHandle.get(h) ?? null : null;
    return {
      ...r,
      imageUrl: shopifyUrl || r.imageUrl || null,
    };
  });
}
