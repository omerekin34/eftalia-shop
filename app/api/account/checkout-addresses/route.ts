import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCustomerDetails } from '@/lib/shopify'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json({
      authenticated: false,
      addresses: [],
      defaultAddressId: null as string | null,
    })
  }

  try {
    const details = await getCustomerDetails(token)
    if (!details) {
      return NextResponse.json({
        authenticated: false,
        addresses: [],
        defaultAddressId: null,
      })
    }

    return NextResponse.json({
      authenticated: true,
      addresses: details.addresses,
      defaultAddressId: details.defaultAddressId || null,
    })
  } catch {
    return NextResponse.json(
      { error: 'Adresler yüklenemedi.' },
      { status: 500 }
    )
  }
}
