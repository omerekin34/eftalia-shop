import { NextRequest, NextResponse } from 'next/server'
import {
  approveShopifyReturnRequest,
  cancelShopifyOrderAndNotify,
  declineShopifyReturnRequest,
  getCustomerRequestMetafieldsAdmin,
  listCustomerServiceRequestsAdmin,
  setCustomerJsonMetafieldAdmin,
} from '@/lib/shopify-admin'

type RequestKind = 'return' | 'cancel'
type RequestAction = 'approve' | 'decline'

function isAuthorized(request: NextRequest) {
  const configured = String(process.env.ADMIN_DASHBOARD_KEY || '').trim()
  if (!configured) return false
  const provided = String(request.headers.get('x-admin-key') || '').trim()
  return provided && provided === configured
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 })
  }

  const kindParam = String(request.nextUrl.searchParams.get('kind') || 'all').trim()
  const statusParam = String(request.nextUrl.searchParams.get('status') || 'all').trim().toLowerCase()
  const limitParam = Number(request.nextUrl.searchParams.get('limit') || '150')
  const limit = Number.isFinite(limitParam) ? Math.max(20, Math.min(400, Math.floor(limitParam))) : 150

  const result = await listCustomerServiceRequestsAdmin(limit)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  const kindFilter = kindParam === 'return' || kindParam === 'cancel' ? (kindParam as RequestKind) : 'all'
  const records = result.records.filter((r) => {
    if (kindFilter !== 'all' && r.kind !== kindFilter) return false
    if (statusParam !== 'all' && String(r.ticket.status || '').toLowerCase() !== statusParam) return false
    return true
  })

  return NextResponse.json({ ok: true, records })
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as
    | {
        customerId?: string
        ticketId?: string
        kind?: RequestKind
        action?: RequestAction
        note?: string
      }
    | null

  const customerId = String(body?.customerId || '').trim()
  const ticketId = String(body?.ticketId || '').trim()
  const kind = body?.kind === 'cancel' ? 'cancel' : body?.kind === 'return' ? 'return' : null
  const action = body?.action === 'approve' || body?.action === 'decline' ? body.action : null
  const note = String(body?.note || '').trim()

  if (!customerId || !ticketId || !kind || !action) {
    return NextResponse.json({ error: 'Eksik işlem parametreleri.' }, { status: 400 })
  }

  const customerData = await getCustomerRequestMetafieldsAdmin(customerId)
  if (!customerData.ok) {
    return NextResponse.json({ error: customerData.error }, { status: 400 })
  }

  const list = kind === 'return' ? [...customerData.customer.returnTickets] : [...customerData.customer.cancelTickets]
  const idx = list.findIndex((t) => t.id === ticketId)
  if (idx === -1) {
    return NextResponse.json({ error: 'Talep bulunamadı.' }, { status: 404 })
  }

  const ticket = list[idx]

  if (kind === 'return') {
    if (!ticket.shopifyReturnId) {
      return NextResponse.json(
        { error: 'Bu kayıt native Shopify iade kaydı içermiyor; otomatik onay/red yapılamaz.' },
        { status: 400 }
      )
    }
    if (action === 'approve') {
      const approved = await approveShopifyReturnRequest(ticket.shopifyReturnId)
      if (!approved.ok) return NextResponse.json({ error: approved.error }, { status: 400 })
      list[idx] = { ...ticket, status: 'tamamlandi' }
    } else {
      const declined = await declineShopifyReturnRequest(ticket.shopifyReturnId, note)
      if (!declined.ok) return NextResponse.json({ error: declined.error }, { status: 400 })
      list[idx] = { ...ticket, status: 'reddedildi', ...(note ? { note } : {}) }
    }
  } else {
    if (action === 'approve') {
      const canceled = await cancelShopifyOrderAndNotify(ticket.orderId)
      if (!canceled.ok) return NextResponse.json({ error: canceled.error }, { status: 400 })
      list[idx] = { ...ticket, status: 'tamamlandi', ...(note ? { note } : {}) }
    } else {
      list[idx] = { ...ticket, status: 'reddedildi', ...(note ? { note } : {}) }
    }
  }

  const metafieldKey = kind === 'return' ? 'return_requests' : 'cancel_requests'
  const saved = await setCustomerJsonMetafieldAdmin(customerId, metafieldKey, list)
  if (!saved.ok) {
    return NextResponse.json({ error: saved.error }, { status: 400 })
  }

  return NextResponse.json({ ok: true, ticket: list[idx] })
}
