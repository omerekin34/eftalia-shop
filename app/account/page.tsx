import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCustomerDetails, getCustomerOrders } from '@/lib/shopify'
import { AccountDashboardClient } from '@/components/storefront/account-dashboard-client'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

export default async function AccountPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    redirect('/giris')
  }

  const [customer, orders] = await Promise.all([
    getCustomerDetails(token),
    getCustomerOrders(token),
  ])

  if (!customer) {
    redirect('/giris')
  }

  return <AccountDashboardClient customer={customer} orders={orders} />
}
