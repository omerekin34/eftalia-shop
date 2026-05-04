import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCustomerDetails, getCustomerOrders } from '@/lib/shopify'
import { AccountDashboardClient } from '@/components/storefront/account-dashboard-client'
import type { ServiceTicket } from '@/components/storefront/account-service-requests-panel'

const AUTH_COOKIE_NAME = 'eftalia_customer_access_token'

function asTicketList(value: unknown): ServiceTicket[] {
  if (!Array.isArray(value)) return []
  return value.filter((t): t is ServiceTicket => {
    if (typeof t !== 'object' || t === null) return false
    const o = t as Record<string, unknown>
    return (
      typeof o.id === 'string' &&
      typeof o.orderId === 'string' &&
      typeof o.orderNumber === 'number' &&
      typeof o.reason === 'string' &&
      typeof o.status === 'string' &&
      typeof o.createdAt === 'string'
    )
  })
}

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

  return (
    <AccountDashboardClient
      customer={{
        ...customer,
        returnTickets: asTicketList(customer.returnTickets),
        cancelTickets: asTicketList(customer.cancelTickets),
      }}
      orders={orders}
    />
  )
}
