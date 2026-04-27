import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCustomerFavorites, setCustomerFavorites } from '@/lib/shopify'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json(
        { ok: false, configured: false, error: 'Oturum bulunamadı.' },
        { status: 401 }
      )
    }

    // 1) Read check
    const favorites = await getCustomerFavorites(token)

    // 2) Write permission check (write back the same value, no behavioral change)
    await setCustomerFavorites(token, favorites)

    return NextResponse.json({
      ok: true,
      configured: true,
      message: 'Shopify customer favorites metafield erişimi hazır.',
      count: favorites.length,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        error:
          error instanceof Error
            ? error.message
            : 'Shopify favorites metafield doğrulaması başarısız.',
      },
      { status: 400 }
    )
  }
}
